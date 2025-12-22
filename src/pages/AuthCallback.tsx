import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import LoadingPage from "./LoadingPage";

const AuthCallback = () => {
  const { user } = useAuth();
  const { profile, refreshProfile } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      if (user && !profile) {
        await refreshProfile();
      }

      if (user && profile) {
        if (profile.account_type) {
          navigate("/feed");
        } else {
          navigate("/signup-choice");
        }
      }
    };

    handleAuth();
  }, [user, profile, navigate, refreshProfile]);

  return <LoadingPage />;
};

export default AuthCallback;
