import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePet } from "@/contexts/PetContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Story {
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
  };
  hasViewed?: boolean;
}

export const StoriesBar = () => {
  const { currentPet } = usePet();
  const { profile } = useUserProfile();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    fetchStories();
    // Refresh stories every 30 seconds to check for new ones
    const interval = setInterval(fetchStories, 30000);
    return () => clearInterval(interval);
  }, [currentPet]);

  const fetchStories = async () => {
    setLoading(true);
    
    const isProfessional = profile?.account_type === 'professional';
    
    // Se não tem pet e não é profissional, não carrega stories
    if (!currentPet && !isProfessional) {
      setLoading(false);
      return;
    }

    let visiblePetIds: string[] = [];

    if (isProfessional) {
      // Profissionais veem stories de todos os pets (comunidade)
      // Buscamos os 100 pets mais recentes que postaram stories
      const { data: recentStoryPets } = await supabase
        .from("stories")
        .select("pet_id")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(100);
      
      // Remove duplicatas e usa os IDs
      const petIdsWithStories = recentStoryPets?.map(s => s.pet_id) || [];
      visiblePetIds = Array.from(new Set(petIdsWithStories));
    } else if (currentPet) {
      // Usuários comuns veem apenas de quem seguem
      const { data: following } = await supabase
        .from("followers")
        .select("target_pet_id")
        .eq("follower_pet_id", currentPet.id);

      const followingPetIds = following?.map(f => f.target_pet_id) || [];
      visiblePetIds = [...followingPetIds, currentPet.id];
    }

    // Get non-expired stories from followed pets
    const { data: storiesData } = await supabase
      .from("stories")
      .select("*, pet:pet_id(id, name, avatar_url)")
      .in("pet_id", visiblePetIds)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    if (storiesData) {
      // Check which stories current pet has viewed (se tiver pet)
      let viewedStoryIds = new Set<string>();
      
      if (currentPet) {
        const { data: viewsData } = await supabase
          .from("story_views")
          .select("story_id")
          .eq("viewer_pet_id", currentPet.id)
          .in("story_id", storiesData.map(s => s.id));

        viewedStoryIds = new Set(viewsData?.map(v => v.story_id) || []);
      }

      const storiesWithViews = storiesData.map(story => ({
        ...story,
        hasViewed: viewedStoryIds.has(story.id)
      }));

      setStories(storiesWithViews);
    }
    
    setLoading(false);
  };

  const handleStoryClick = async (storyId: string) => {
    if (!currentPet) return;

    // Record view
    await supabase.from("story_views").insert({
      story_id: storyId,
      viewer_pet_id: currentPet.id,
    }).onConflict("story_id,viewer_pet_id").ignore();

    // Update local state
    setStories(stories.map(s => 
      s.id === storyId ? { ...s, hasViewed: true } : s
    ));
  };

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("stories-container");
    if (container) {
      const scrollAmount = 100;
      const newPosition = direction === "left" 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      container.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <Card className="card-elevated border-0 p-4 mb-6">
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <Card className="card-elevated border-0 p-4 mb-6">
      <div className="relative">
        {/* Left Scroll Button */}
        {scrollPosition > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Stories Container */}
        <div
          id="stories-container"
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 px-8"
          style={{ scrollBehavior: "smooth" }}
        >
          {stories.map(story => (
            <Link
              key={story.id}
              to={`/story/${story.id}`}
              onClick={() => handleStoryClick(story.id)}
              className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group"
            >
              <div
                className={`relative w-16 h-16 rounded-full p-[2px] ${
                  story.hasViewed
                    ? "bg-gray-300"
                    : "bg-gradient-to-tr from-yellow-400 to-purple-600"
                }`}
              >
                <Avatar className="w-full h-full border-2 border-white">
                  <AvatarImage src={story.pet?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {story.pet?.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-[10px] font-semibold text-center truncate w-16 group-hover:underline">
                {story.pet?.name || "Pet"}
              </span>
            </Link>
          ))}
        </div>

        {/* Right Scroll Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
