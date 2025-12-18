import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type AccountType = 'user' | 'professional';

export interface UserProfile {
  id: string;
  account_type: AccountType;
  is_professional_verified: boolean;
  professional_bio?: string;
  professional_specialties?: string[];
  professional_phone?: string;
  professional_address?: string;
  professional_city?: string;
  professional_state?: string;
  professional_zip?: string;
  professional_price_range?: string;
  professional_service_type?: string;
  created_at: string;
  updated_at: string;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  switchAccountType: (type: AccountType) => Promise<void>;
  updateProfessionalProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {

    if (!user) {
      setProfile(null);
      setLoading(false);

      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // Se o perfil não existir, criar um
        if (error.code === 'PGRST116') {

          const { data: newProfile, error: insertError } = await supabase
            .from("user_profiles")
            .insert({ id: user.id, account_type: 'user' })
            .select()
            .single();

          if (insertError) throw insertError;
          setProfile(newProfile);

        } else {
          throw error;
        }
      } else {
        setProfile(data);

      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);

    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const switchAccountType = async (type: AccountType) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ account_type: type })
        .eq("id", user.id);

      if (error) throw error;

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, account_type: type } : null);
    } catch (error) {
      console.error("Error switching account type:", error);
      throw error;
    }
  };

  const updateProfessionalProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update(data)
        .eq("id", user.id);

      if (error) throw error;

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Error updating professional profile:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        loading,
        switchAccountType,
        updateProfessionalProfile,
        refreshProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
};
