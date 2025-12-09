import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePet } from "@/contexts/PetContext";
import LoadingPage from "@/pages/LoadingPage";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading: authLoading } = useAuth();
  const { myPets, loading: petLoading } = usePet();

  if (authLoading || petLoading) return <LoadingPage />;

  if (!user) return <Navigate to="/auth" replace />;

  if (myPets.length === 0) return <Navigate to="/create-pet" replace />;

  return children;
};
