import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePet } from "@/contexts/PetContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import LoadingPage from "@/pages/LoadingPage";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading: authLoading } = useAuth();
  const { myPets, loading: petLoading } = usePet();
  const { profile, loading: profileLoading } = useUserProfile();

  if (authLoading || petLoading || profileLoading) return <LoadingPage />;

  if (!user) return <Navigate to="/auth" replace />;

  // Se for profissional, não precisa ter pets para acessar rotas protegidas
  if (profile?.account_type === 'professional') {
    return children;
  }

  // Se for guardião (user) e não tiver pets, redireciona para criar pet
  if (profile?.account_type === 'user' && myPets.length === 0) {
    return <Navigate to="/create-pet" replace />;
  }

  return children;
};
