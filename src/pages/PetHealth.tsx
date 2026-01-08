import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePet, Pet } from "@/contexts/PetContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { HealthSection } from "@/components/health/HealthSection";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PawPrint, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PetHealth = () => {
  const { petId } = useParams<{ petId: string }>();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) fetchPetData();
  }, [petId]);

  const fetchPetData = async () => {
    setLoading(true);
    try {
      const { data: petData, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .single();

      if (error || !petData) {
        setPet(null);
      } else {
        setPet(petData as Pet);
      }
    } catch (err) {
      console.error("Erro ao buscar dados do pet:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-6 space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  if (!pet) {
    return (
      <MainLayout>
        <div className="container max-w-xl py-6">
          <Card className="card-elevated border-0">
            <CardContent className="p-6 text-center">
              <PawPrint className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Pet não encontrado</p>
              <Button variant="link" onClick={() => navigate(-1)} className="mt-4">
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white border-b sticky top-14 z-40">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/pet/${petId}`)}
              className="rounded-full"
            >
              <ChevronLeft size={24} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Saúde do Animal</h1>
              <p className="text-xs text-muted-foreground">{pet.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-6">
        <HealthSection petId={petId!} />
      </div>
    </MainLayout>
  );
};

export default PetHealth;
