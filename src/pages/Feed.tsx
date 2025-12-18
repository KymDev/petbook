import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePet } from "@/contexts/PetContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { PostCard } from "@/components/feed/PostCard";
import { StoriesBar } from "@/components/feed/StoriesBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, PawPrint } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";

interface Post {
  id: string;
  pet_id: string;
  type: string;
  description: string | null;
  media_url: string | null;
  created_at: string;
}

const Feed = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentPet, myPets, loading: petLoading } = usePet();
  const { profile, loading: profileLoading } = useUserProfile();

  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // A lógica de redirecionamento para /auth e /create-pet é tratada pelo ProtectedRoute.
  // Este useEffect é redundante e pode causar loops ou erros de renderização.
  // Removendo para simplificar o fluxo.
  useEffect(() => {
    if (authLoading || petLoading) return;
    if (!user) return; // O ProtectedRoute já redireciona, mas garantimos que o user existe para o resto do código.
    if (myPets.length === 0) return; // O ProtectedRoute já redireciona, mas garantimos que há pets.
    if (!currentPet) return; // Garante que o pet atual está selecionado.
  }, [authLoading, petLoading, user, myPets, currentPet]);

  // --- BUSCA POSTS QUANDO O PET ATUAL EXISTE OU É PROFISSIONAL ---
  useEffect(() => {
    if (authLoading || petLoading || profileLoading) return;
    
    const isProfessional = profile?.account_type === 'professional';
    
    // Profissionais podem ver o feed mesmo sem pet
    if (isProfessional) {
      fetchFeedPostsForProfessional();
    } else if (currentPet) {
      fetchFeedPosts();
    }
  }, [currentPet, petLoading, authLoading, profileLoading, profile]);

  const fetchFeedPosts = async () => {
    setLoading(true);

    if (!currentPet) return;

    // Pets seguidos
    const { data: following } = await supabase
      .from("followers")
      .select("target_pet_id")
      .eq("follower_pet_id", currentPet.id);

    const followingPetIds = following?.map(f => f.target_pet_id) || [];
    const visiblePetIds = [...followingPetIds, currentPet.id];

    const { data } = await supabase
      .from("posts")
      .select("*, pet:pet_id(*)")
      .in("pet_id", visiblePetIds)
      .order("created_at", { ascending: false })
      .limit(50);

    setPosts(data || []);
    setLoading(false);
  };

  const fetchFeedPostsForProfessional = async () => {
    setLoading(true);

    // Profissionais veem posts de todos os pets (comunidade)
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *, 
        pet:pet_id(
          id, 
          name, 
          avatar_url, 
          guardian_name, 
          user_profile:user_id(account_type)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Erro ao buscar posts para profissional:", error);
      // Em caso de erro, ainda exibe o feed, mas vazio
      setPosts([]);
      setLoading(false);
      return;
    }

    setPosts(data || []);
    setLoading(false);
  };

  // --- TELA DE LOADING DO SISTEMA ---
  if (authLoading || petLoading || profileLoading) {
    return <LoadingScreen message="Carregando seu Pet..." />;
  }

  // Se é profissional, não precisa de pet para acessar o feed
  const isProfessional = profile?.account_type === 'professional';
  if (!isProfessional && (!myPets || myPets.length === 0 || !currentPet)) {
    return <LoadingScreen message="Carregando seu Pet..." />;
  }

  return (
    <MainLayout>
      <div className="container max-w-xl py-6 space-y-6">
        
        {/* STORIES BAR - NOVO */}
        <StoriesBar />

        {/* Card de criar post - apenas para usuários com pet */}
        {!isProfessional && currentPet ? (
          <Link to="/create-post">
            <Card className="card-elevated border-0 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 rounded-full gradient-bg flex items-center justify-center">
                  <PlusCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">O que {currentPet.name} está fazendo?</p>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe um momento especial
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : null}

        {/* Mensagem para profissionais */}
        {isProfessional ? (
          <Card className="card-elevated border-0 bg-gradient-to-br from-secondary/10 to-primary/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <PawPrint className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold">
                    Bem-vindo, Profissional!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Explore e conecte-se com a comunidade
                  </p>
                </div>
              </div>
              <Link to="/professional-dashboard" className="block">
                <Button className="w-full gradient-bg" size="sm">
                  Acessar Painel de Atendimento
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {/* LOADING DO FEED */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="aspect-square rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (

          /* NENHUM POST */
          <Card className="card-elevated border-0">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <PawPrint className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum post ainda</h3>
              <p className="text-muted-foreground mb-4">
                Siga novos pets ou compartilhe algo!
              </p>
              <Link to="/create-post">
                <Button className="gradient-bg">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Post
                </Button>
              </Link>
            </CardContent>
          </Card>

        ) : (

          /* FEED COM POSTS */
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default Feed;
