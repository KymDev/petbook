import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PetProvider, usePet } from "@/contexts/PetContext";

import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import CreatePet from "./pages/CreatePet";
import CreatePost from "./pages/CreatePost";
import PetProfile from "./pages/PetProfile";
import Chat from "./pages/Chat";
import ChatRoom from "./pages/ChatRoom";
import Communities from "./pages/Communities";
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AuthConfirm from "./pages/AuthConfirm";
import Index from "./pages/Index";
import LoadingPage from "./pages/LoadingPage";
import StoryViewer from "./pages/StoryViewer";
import CreateStory from "./pages/CreateStory";

// --- Componente de redirecionamento raiz ---
const RootRedirect = () => {
  const { user, loading: authLoading } = useAuth();
  const { myPets, loading: petLoading } = usePet();

  if (authLoading || petLoading) return <LoadingPage />;

  if (!user) return <Navigate to="/auth" replace />;

  // Se logado, o ProtectedRoute em /feed cuidará do redirecionamento para /create-pet se necessário.
  return <Navigate to="/feed" replace />;
};

const queryClient = new QueryClient();

// --- Componente de rota protegida ---
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading: authLoading } = useAuth();
  const { myPets, loading: petLoading } = usePet();

  if (authLoading || petLoading) return <LoadingPage />; // enquanto carrega, mostra loading

  if (!user) return <Navigate to="/auth" replace />; // se não logado → login

  if (myPets.length === 0) return <Navigate to="/create-pet" replace />; // se não tem pet → create-pet

  return children; // usuário logado com pet → renderiza componente
};

const AppRoutes = () => (
  <Routes>
    {/* Auth */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/auth/confirm" element={<AuthConfirm />} />

    {/* Criação inicial de pet */}
    <Route
      path="/create-pet"
      element={
        <ProtectedRoute>
          <CreatePet />
        </ProtectedRoute>
      }
    />

    {/* App interno protegido */}
    <Route
      path="/feed"
      element={
        <ProtectedRoute>
          <Feed />
        </ProtectedRoute>
      }
    />
    <Route
      path="/create-post"
      element={
        <ProtectedRoute>
          <CreatePost />
        </ProtectedRoute>
      }
    />
    <Route
      path="/create-story"
      element={
        <ProtectedRoute>
          <CreateStory />
        </ProtectedRoute>
      }
    />
    <Route
      path="/story/:id"
      element={
        <ProtectedRoute>
          <StoryViewer />
        </ProtectedRoute>
      }
    />
    <Route
      path="/pet/:id"
      element={
        <ProtectedRoute>
          <PetProfile />
        </ProtectedRoute>
      }
    />
    <Route
      path="/chat"
      element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      }
    />
    <Route
      path="/chat/:petId"
      element={
        <ProtectedRoute>
          <ChatRoom />
        </ProtectedRoute>
      }
    />
    <Route
      path="/communities"
      element={
        <ProtectedRoute>
          <Communities />
        </ProtectedRoute>
      }
    />
    <Route
      path="/notifications"
      element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      }
    />
    <Route
      path="/explore"
      element={
        <ProtectedRoute>
          <Explore />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      }
    />

    {/* Redirecionamento raiz */}
    <Route path="/" element={<RootRedirect />} />

    {/* Not found */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PetProvider>
            <AppRoutes />
          </PetProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
