import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePet, Pet } from "@/contexts/PetContext";
import { useAuth } from "@/contexts/AuthContext"; // Importar useAuth
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, ExternalLink, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  pet_id: string;
  type: string;
  description: string | null;
  media_url: string | null;
  created_at: string;
  pet?: Pet;
}

interface Reaction {
  type: string;
  count: number;
  hasReacted: boolean;
}

interface Comment {
  id: string;
  text: string;
  created_at: string;
  pet?: Pet; // Tornar opcional
  user_profile?: { full_name: string, avatar_url: string | null }; // Adicionar perfil do usuário
}

const reactionTypes = [
  { type: "patinha", emoji: "🐾", label: "Patinha" },
  { type: "abraco", emoji: "❤️", label: "Abraço" },
  { type: "petisco", emoji: "🍖", label: "Petisco" },
];

import { UserProfile } from "@/contexts/UserProfileContext"; // Importar UserProfile

interface PostCardProps {
  post: Post;
  profile: UserProfile | null; // Adicionar a prop profile
}

export const PostCard = ({ post, profile }: PostCardProps) => {
  const { currentPet } = usePet();
  const { user } = useAuth(); // Usar user do AuthContext
  const { toast } = useToast();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [pet, setPet] = useState<Pet | null>(post.pet as Pet || null);
  const [userReactionType, setUserReactionType] = useState<string | null>(null);

  // Identificador de quem está interagindo (pet_id ou user_id)
  const interactorId = currentPet?.id || user?.id;
  const isProfessional = profile?.account_type === 'professional'; // Usar o profile para determinar se é profissional

  useEffect(() => {
    fetchReactions();
    fetchComments();
  }, [post.id, interactorId]); // Adicionar interactorId como dependência

  const fetchReactions = async () => {
    // Fetch reactions
    const { data: allReactions } = await supabase
      .from("reactions")
      .select("type, pet_id, user_id") // Incluir user_id
      .eq("post_id", post.id);

    if (allReactions) {
      // Find user's current reaction
      const userReaction = currentPet
        ? allReactions.find((r) => r.pet_id === currentPet.id)
        : isProfessional
        ? allReactions.find((r) => r.user_id === user?.id)
        : null;
      
      setUserReactionType(userReaction ? userReaction.type : null);

      const reactionCounts = reactionTypes.map((rt) => ({
        type: rt.type,
        count: allReactions.filter((r) => r.type === rt.type).length,
        hasReacted: userReaction ? userReaction.type === rt.type : false,
      }));
      setReactions(reactionCounts);
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`
        *, 
        pet:pets(*), 
        user_profile:user_id(full_name, avatar_url)
      `)
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })
      .limit(10);

    if (data) {
      setComments(data.map((c) => ({ 
        ...c, 
        pet: c.pet as Pet,
        user_profile: c.user_profile as { full_name: string, avatar_url: string | null }
      })));
    }
  };

  const createNotification = async (type: string, message: string) => {
    // Não criar notificação se for o próprio dono do post
    // A lógica de quem interage é mais complexa, então vamos verificar se o interactorId
    // pertence ao user_id do pet_id do post.
    // Isso requer buscar o user_id do pet_id do post.
    
    const { data: postOwner, error: ownerError } = await supabase
      .from("pets")
      .select("user_id")
      .eq("id", post.pet_id)
      .single();

    if (ownerError || !postOwner) {
      console.error("Erro ao buscar dono do post para notificação:", ownerError);
      return;
    }

    // Se o interactor é um pet e é o pet do dono do post, não notifica.
    if (currentPet && currentPet.user_id === postOwner.user_id) return;
    
    // Se o interactor é um profissional e é o dono do post, não notifica.
    if (isProfessional && user?.id === postOwner.user_id) return;

    // Se quem interage é um pet (guardião)
    if (currentPet) {
      await supabase.from("notifications").insert({
        pet_id: post.pet_id,
        type: type,
        message: message,
        related_pet_id: currentPet.id,
        is_read: false,
      });
    } 
    // Se quem interage é um usuário (profissional)
    else if (isProfessional && user) {
      await supabase.from("notifications").insert({
        pet_id: post.pet_id,
        type: type,
        message: message,
        related_user_id: user.id, // Novo campo para identificar o profissional
        is_read: false,
      });
    }
  };

  const handleReaction = async (type: "patinha" | "abraco" | "petisco") => {
    if (!interactorId) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para reagir.",
        variant: "destructive",
      });
      return;
    }

    // Identifica se a reação é de um pet ou de um profissional
    const reactionData = isProfessional 
      ? { user_id: user?.id, pet_id: null } 
      : { pet_id: currentPet?.id, user_id: null };

    // Se o usuário já reagiu com este tipo, remove a reação
    if (userReactionType === type) {
      let query = supabase
        .from("reactions")
        .delete()
        .eq("post_id", post.id);
      
      if (isProfessional) {
        query = query.eq("user_id", user?.id);
      } else {
        query = query.eq("pet_id", currentPet?.id);
      }
      
      await query;
      setUserReactionType(null);
    } else {
      // Remove qualquer reação anterior do usuário neste post
      if (userReactionType) {
        let query = supabase
          .from("reactions")
          .delete()
          .eq("post_id", post.id);
        
        if (isProfessional) {
          query = query.eq("user_id", user?.id);
        } else {
          query = query.eq("pet_id", currentPet?.id);
        }
        
        await query;
      }
      
      // Adiciona a nova reação
      const { error } = await supabase.from("reactions").insert([{
        post_id: post.id,
        type: type,
        ...reactionData, // Adiciona pet_id ou user_id
      }]);

      if (error) {
        toast({
          title: "Erro ao reagir",
          description: "Não foi possível adicionar sua reação. Tente novamente.",
          variant: "destructive",
        });
        return;
      }
      
      setUserReactionType(type);

      // Criar notificação para o dono do post
      const reactionLabel = reactionTypes.find(rt => rt.type === type)?.label || type;
      const interactorName = isProfessional ? (await supabase.from('user_profiles').select('full_name').eq('id', user?.id).single())?.data?.full_name || "Um Profissional" : currentPet?.name;
      
      await createNotification(
        "reaction",
        `${interactorName} reagiu com ${reactionLabel} ao seu post`
      );
    }

    fetchReactions();
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    // Se for profissional, usa o user.id. Se for guardião, usa o currentPet.id
    const commentData = isProfessional
      ? { user_id: user?.id, pet_id: null }
      : { pet_id: currentPet?.id, user_id: null };

    if (!commentData.pet_id && !commentData.user_id) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      text: newComment.trim(),
      ...commentData,
    });

    if (error) {
      toast({
        title: "Erro ao comentar",
        description: "Não foi possível adicionar seu comentário. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    // Criar notificação para o dono do post
    const interactorName = isProfessional ? (await supabase.from('user_profiles').select('full_name').eq('id', user?.id).single())?.data?.full_name || "Um Profissional" : currentPet?.name;
    await createNotification(
      "comment",
      `${interactorName} comentou no seu post: "${newComment.trim().substring(0, 50)}${newComment.trim().length > 50 ? '...' : ''}"`
    );

    setNewComment("");
    fetchComments();
    
    toast({
      title: "Comentário adicionado!",
      description: "Seu comentário foi publicado com sucesso.",
    });
  };

  // ... (Resto do componente)
  // ... (O restante do componente PostCard, incluindo o JSX, deve ser mantido)
  
  // O JSX do PostCard é muito longo, vou apenas incluir a parte que precisa de adaptação
  // para garantir que o componente use o interactorId corretamente.
  
  // O JSX original do PostCard não precisa de grandes mudanças, pois a lógica de reação
  // está toda no handleReaction e fetchReactions.

  // Vou reescrever o componente completo para garantir a integridade.
  
  return (
    <Card className="card-elevated border-0">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <Link to={`/pet/${pet?.id}`} className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={pet?.avatar_url || undefined} />
            <AvatarFallback>{pet?.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{pet?.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </Link>
        <Button variant="ghost" size="icon">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {post.media_url && (
          post.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={post.media_url}
              controls
              className="w-full object-cover max-h-96"
            />
          ) : (
            <img
              src={post.media_url}
              alt={post.description || "Post media"}
              className="w-full object-cover max-h-96"
            />
          )
        )}
        {post.description && (
          <p className="p-4 text-sm">{post.description}</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col p-4 pt-0">
        {/* Reactions */}
        <div className="flex justify-between items-center w-full border-b border-border pb-2">
          <div className="flex gap-2">
            {reactions.map((reaction) => {
              const rt = reactionTypes.find((r) => r.type === reaction.type);
              if (reaction.count === 0 || !rt) return null;
              return (
                <div
                  key={reaction.type}
                  className={cn(
                    "flex items-center gap-1 p-1 rounded-full text-xs cursor-pointer transition-colors",
                    reaction.hasReacted
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted-foreground/10"
                  )}
                  onClick={() => handleReaction(reaction.type as "patinha" | "abraco" | "petisco")}
                >
                  <span className="text-sm">{rt.emoji}</span>
                  <span className="font-medium">{reaction.count}</span>
                </div>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {comments.length} Comentários
          </Button>
        </div>

        {/* Reaction Buttons */}
        <div className="flex justify-around w-full pt-2">
          {reactionTypes.map((rt) => (
            <Button
              key={rt.type}
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-1 text-lg",
                userReactionType === rt.type
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-primary"
              )}
              onClick={() => handleReaction(rt.type as "patinha" | "abraco" | "petisco")}
              disabled={!interactorId}
            >
              {rt.emoji}
            </Button>
          ))}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full mt-4 space-y-3">
            {comments.map((comment) => {
              const isCommentFromPet = !!comment.pet;
              const name = isCommentFromPet ? comment.pet?.name : comment.user_profile?.full_name;
              const avatarUrl = isCommentFromPet ? comment.pet?.avatar_url : comment.user_profile?.avatar_url;
              const fallback = name ? name[0] : 'U';
              const linkTo = isCommentFromPet ? `/pet/${comment.pet?.id}` : `/profile/${comment.user_profile?.full_name}`; // Ajustar link para perfil profissional

              return (
                <div key={comment.id} className="flex gap-3 items-start">
                  <Link to={linkTo}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 bg-muted p-2 rounded-lg">
                    <Link to={linkTo}>
                      <span className="font-semibold text-sm hover:underline">
                        {name}
                      </span>
                    </Link>
                    <p className="text-sm">{comment.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* New Comment Input */}
            {currentPet && (
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Adicionar comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <Button onClick={handleComment} disabled={!newComment.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
