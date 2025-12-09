import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  bio: string | null;
  avatar_url: string | null;
  guardian_name: string;
  guardian_instagram_username: string;
  guardian_instagram_url: string | null;
  created_at: string;
}

interface PetContextType {
  currentPet: Pet | null;
  myPets: Pet[];
  following: Pet[];
  allPets: Pet[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  selectPet: (pet: Pet) => void;
  followPet: (id: string) => Promise<void>;
  unfollowPet: (id: string) => Promise<void>;
  searchPets: (query: string) => Pet[];
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [following, setFollowing] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyPets = async () => {
    if (!user) {
      setMyPets([]);
      setCurrentPet(null);
      return;
    }

    const { data, error } = await supabase // <-- CORREÇÃO: Adicionado 'error'
      .from("pets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    if (error) { // <-- CORREÇÃO: Tratamento de erro para diagnóstico
      console.error("ERRO AO CARREGAR MEUS PETS:", error);
      setMyPets([]);
      setCurrentPet(null);
      return;
    }

    setMyPets(data || []);
    setCurrentPet(data?.[0] ?? null);
  };

  const loadAllPets = async () => {
    const { data } = await supabase.from("pets").select("*");
    setAllPets(data || []);
  };

  const loadFollowing = async (petId: string) => {
    const { data: rows } = await supabase
      .from("followers")
      .select("target_pet_id")
      .eq("follower_pet_id", petId);

    if (!rows?.length) {
      setFollowing([]);
      return;
    }

    const ids = rows.map(r => r.target_pet_id);

    const { data: pets } = await supabase
      .from("pets")
      .select("*")
      .in("id", ids);

    setFollowing(pets || []);
  };

  const followPet = async (targetPetId: string) => {
    if (!currentPet) return;

    await supabase.from("followers").insert({
      follower_pet_id: currentPet.id,
      target_pet_id: targetPetId,
    });

    await loadFollowing(currentPet.id);
  };

  const unfollowPet = async (targetPetId: string) => {
    if (!currentPet) return;

    await supabase
      .from("followers")
      .delete()
      .eq("follower_pet_id", currentPet.id)
      .eq("target_pet_id", targetPetId);

    await loadFollowing(currentPet.id);
  };

  const searchPets = (query: string) => {
    const q = query.toLowerCase();
    return allPets.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.guardian_name.toLowerCase().includes(q)
    );
  };

  const refreshAll = async () => {
    setLoading(true);
    await loadMyPets();
    await loadAllPets();
    setLoading(false);
  };

useEffect(() => {
  if (user === undefined) return; // ainda carregando auth

  if (!user) {
    setMyPets([]);
    setCurrentPet(null);
    setLoading(false);
    return;
  }

  refreshAll();
}, [user]);


  useEffect(() => {
    if (currentPet) {
      loadFollowing(currentPet.id);
    } else {
      setFollowing([]);
    }
  }, [currentPet]);

  return (
    <PetContext.Provider
      value={{
        currentPet,
        myPets,
        allPets,
        following,
        loading,
        refreshAll,
        selectPet: setCurrentPet,
        followPet,
        unfollowPet,
        searchPets,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used inside PetProvider");
  return ctx;
};
