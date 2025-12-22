import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePet, Pet } from "@/contexts/PetContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tipos auxiliares
interface Message {
  id: string;
  message: string | null;
  sender_pet_id: string;
  created_at: string;
}

interface OtherParty {
  id: string;
  name: string;
  avatar_url: string | null;
  isProfessional: boolean;
}

const ChatRoom = () => {
  // A rota agora pode ser /chat/:petId ou /chat/professional/:userId
  const { petId, userId } = useParams<{ petId?: string; userId?: string }>();
  const { currentPet } = usePet();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [otherParty, setOtherParty] = useState<OtherParty | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determina se o chat é com um profissional
  const isChatWithProfessional = !!userId;

  useEffect(() => {
    if (!currentPet) {
      toast({
        title: "Pet não selecionado",
        description: "Você precisa ter um pet cadastrado para usar o chat.",
        variant: "destructive",
      });
      navigate("/feed");
      return;
    }

    if (petId || userId) {
      initializeChat();
    }
  }, [currentPet, petId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`chat-messages-${roomId}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "chat_messages", 
          filter: `room_id=eq.${roomId}` 
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const initializeChat = async () => {
    if (!currentPet) return;
    
    setLoading(true);

    try {
      let party: OtherParty | null = null;
      let otherPartyId: string;

      if (isChatWithProfessional && userId) {
        // Chat com Profissional (User ID)
        otherPartyId = userId;
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("full_name, avatar_url")
          .eq("user_id", userId)
          .single();

        if (profileError || !profileData) throw new Error("Profissional não encontrado");

        party = {
          id: userId,
          name: profileData.full_name || "Profissional",
          avatar_url: profileData.avatar_url,
          isProfessional: true,
        };

      } else if (petId) {
        // Chat com Outro Pet (Pet ID)
        otherPartyId = petId;
        const { data: petData, error: petError } = await supabase
          .from("pets")
          .select("id, name, avatar_url, guardian_instagram_username")
          .eq("id", petId)
          .single();
        
        if (petError || !petData) throw new Error("Pet não encontrado");

        party = {
          id: petId,
          name: petData.name,
          avatar_url: petData.avatar_url,
          isProfessional: false,
        };

        // Verifica se está tentando conversar consigo mesmo
        if (currentPet.id === petId) {
          toast({
            title: "Ação inválida",
            description: "Você não pode conversar com seu próprio pet.",
            variant: "destructive",
          });
          navigate("/chat");
          return;
        }
      } else {
        throw new Error("ID de chat inválido");
      }

      setOtherParty(party);

      // Lógica para encontrar ou criar sala de chat
      // Para Profissional, usa-se o user_id e o pet_id do guardião
      // Para Pet, usa-se o pet_id e o pet_id do outro pet
      
      const isPetToPet = !isChatWithProfessional;
      const pet1 = isPetToPet ? currentPet.id : currentPet.id;
      const pet2 = isPetToPet ? otherPartyId : otherPartyId;

      // Busca sala onde (pet1=currentPet.id AND pet2=otherPartyId) OU (pet1=otherPartyId AND pet2=currentPet.id)
      const { data: existingRoom } = await supabase
        .from("chat_rooms")
        .select("*")
        .or(`and(pet_1.eq.${pet1},pet_2.eq.${pet2}),and(pet_1.eq.${pet2},pet_2.eq.${pet1})`)
        .maybeSingle();

      if (existingRoom) {
        setRoomId(existingRoom.id);
        await fetchMessages(existingRoom.id);
      } else {
        const { data: newRoom, error: roomError } = await supabase
          .from("chat_rooms")
          .insert({ 
            pet_1: currentPet.id, 
            pet_2: otherPartyId,
            is_professional_chat: isChatWithProfessional // Novo campo para identificar o tipo de chat
          })
          .select()
          .single();
        
        if (roomError) throw roomError;
        
        if (newRoom) {
          setRoomId(newRoom.id);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Erro ao inicializar chat:", error);
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao carregar o chat: ${error.message}`,
        variant: "destructive",
      });
      navigate("/chat");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", id)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Erro ao buscar mensagens:", error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Algumas mensagens podem não ter sido carregadas.",
        variant: "destructive",
      });
      return;
    }
    
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!currentPet || !roomId || !newMessage.trim() || sending || !otherParty) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase.from("chat_messages").insert({
        room_id: roomId,
        sender_pet_id: currentPet.id,
        message: messageText,
      });

      if (error) throw error;

      // Criar notificação para o outro pet/profissional
      await supabase.from("notifications").insert({
        pet_id: otherParty.isProfessional ? null : otherParty.id, // Se for profissional, a notificação vai para o user_id
        user_id: otherParty.isProfessional ? otherParty.id : null, // Se for pet, a notificação vai para o pet_id
        type: "message",
        message: `${currentPet.name} enviou uma mensagem para você`,
        related_pet_id: currentPet.id,
        is_read: false,
      });

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-xl py-6">
          <Card className="card-elevated border-0 h-[calc(100vh-8rem)] flex items-center justify-center">
            <p className="text-muted-foreground">Carregando chat...</p>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!otherParty) {
    return (
      <MainLayout>
        <div className="container max-w-xl py-6">
          <Card className="card-elevated border-0">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Destinatário não encontrado</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-xl py-6">
        <Card className="card-elevated border-0 h-[calc(100vh-8rem)] flex flex-col">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/chat")}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src={otherParty.avatar_url || undefined} />
                <AvatarFallback className={otherParty.isProfessional ? "bg-blue-500 text-white" : ""}>
                  {otherParty.isProfessional ? <Stethoscope className="h-5 w-5" /> : otherParty.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{otherParty.name}</p>
                {otherParty.isProfessional && (
                  <p className="text-xs text-blue-500 font-medium">
                    Profissional de Serviço
                  </p>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Send className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
                  <p className="text-sm text-muted-foreground">
                    Envie a primeira mensagem para iniciar a conversa
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_pet_id === currentPet?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl break-words ${
                      msg.sender_pet_id === currentPet?.id
                        ? "gradient-bg text-white rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          
          <div className="p-4 border-t border-border flex gap-2">
            <Input
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              className="gradient-bg"
              disabled={!newMessage.trim() || sending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ChatRoom;
