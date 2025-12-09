import { LoadingScreen } from "@/components/LoadingScreen";

// Este componente é usado como um wrapper para exibir a tela de carregamento
// enquanto os contextos (Auth e Pet) estão carregando.
// A lógica de redirecionamento é tratada no RootRedirect e ProtectedRoute.
export default function LoadingPage() {
  return <LoadingScreen message="Carregando seu PetBook..." />;
}
