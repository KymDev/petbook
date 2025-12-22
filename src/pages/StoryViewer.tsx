import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePet } from "@/contexts/PetContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Story {
  view_count?: number;
  id: string;
  pet_id: string;
  media_url: string;
  description: string | null;
  created_at: string;
  expires_at: string;
  pet?: {
    id: string;
    name: string;
    avatar_url: string | null;
    guardian_instagram_username: string;
  };
}

export default function StoryViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPet } = usePet();
  const [story, setStory] = useState<Story | null>(null);
  const [professionalViewCount, setProfessionalViewCount] = useState<number>(0);
  const [viewCount, setViewCount] = useState<number>(0);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (id) fetchStory();
  }, [id]);

  // Progress bar animation
  useEffect(() => {
    if (!loading && story) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [loading, story]);

  const fetchStory = async () => {
    setLoading(true);

    // Get the current story
    const { data: storyData } = await supabase
      .from("stories")
      .select("*, pet:pet_id(id, name, avatar_url, guardian_instagram_username)")
      .eq("id", id)
      .single();

    // Fetch view count
    const { count } = await supabase
      .from("story_views")
      .select("*", { count: "exact", head: true })
      .eq("story_id", id);

    if (count !== null) {
      setViewCount(count);
    }

    // Fetch professional view count
    const { count: profCount } = await supabase
      .from("story_views")
      .select("*", { count: "exact", head: true })
      .eq("story_id", id)
      .eq("is_professional", true);

    if (profCount !== null) {
      setProfessionalViewCount(profCount);
    }

    if (!storyData) {
      navigate("/feed");
      return;
    }

    setStory(storyData);

    // Get all stories from this pet (for navigation)
    const { data: petStories } = await supabase
      .from("stories")
      .select("*, pet:pet_id(id, name, avatar_url, guardian_instagram_username)")
      .eq("pet_id", storyData.pet_id)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (petStories) {
      setAllStories(petStories);
      const index = petStories.findIndex(s => s.id === id);
      setCurrentIndex(index >= 0 ? index : 0);
    }

    // Record view
    if (currentPet) {
      await supabase.from("story_views").insert({
        story_id: id,
        viewer_pet_id: currentPet.id,
        // is_professional será preenchido pelo trigger no banco de dados
      }).onConflict("story_id,viewer_pet_id").ignore();
    }

    setLoading(false);
  };

  const handleNext = () => {
    if (currentIndex < allStories.length - 1) {
      const nextStory = allStories[currentIndex + 1];
      navigate(`/story/${nextStory.id}`);
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      navigate("/feed");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevStory = allStories[currentIndex - 1];
      navigate(`/story/${prevStory.id}`);
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      </MainLayout>
    );
  }

  if (!story) {
    return (
      <MainLayout>
        <div className="container max-w-xl py-6">
          <Card className="card-elevated border-0">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Story não encontrado ou expirou</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 z-10">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        {/* Contador de Visualizações */}
        {story.pet?.id === currentPet?.id && (
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-30">
            {viewCount} pessoas viram o story do seu pet
            {professionalViewCount > 0 && (
              <span className="ml-2 text-yellow-400">
                ({professionalViewCount} profissional{professionalViewCount > 1 ? "is" : ""})
              </span>
            )}
          </div>
        )}
        <Link to={`/pet/${story.pet?.id}`} className="flex items-center gap-2">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={story.pet?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {story.pet?.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="text-white">
            <p className="font-semibold text-sm">{story.pet?.name}</p>
            <p className="text-xs text-gray-300">
              {formatDistanceToNow(new Date(story.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => navigate("/feed")}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Story Content */}
      <div className="relative w-full max-w-md h-screen max-h-screen flex items-center justify-center">
        <img
          src={story.media_url}
          alt="Story"
          className="w-full h-full object-cover"
        />

        {story.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <p className="text-white text-sm">{story.description}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {currentIndex < allStories.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          onClick={handleNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Story Navigation Counter */}
      <div className="absolute bottom-4 right-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
        {currentIndex + 1} / {allStories.length}
      </div>
    </div>
  );
}
