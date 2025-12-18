import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PetBookLogo } from "@/components/PetBookLogo";
import { useAuth } from "@/contexts/AuthContext";
import { usePet } from "@/contexts/PetContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  PawPrint,
  Sparkles,
  Briefcase,
  User as UserIcon,
  Stethoscope,
  Users,
  CheckCircle,
} from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

// Itens principais do feed - sempre visíveis
const primaryNavItems = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/explore", icon: Search, label: "Explorar" },
  { href: "/notifications", icon: Bell, label: "Notificações" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/services", icon: Stethoscope, label: "Serviços Pet" },
];

// Itens secundários - no menu dropdown
const secondaryNavItems = [
  { href: "/communities", icon: Users, label: "Comunidades" },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, signOut, isAdmin } = useAuth();
  const { currentPet, myPets } = usePet();
  const { profile } = useUserProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isProfessional = profile?.account_type === 'professional';

  const handleSwitchAccount = async (type: 'user' | 'professional') => {
    if (type === 'professional') {
      navigate('/professional-profile');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header - Mais limpo e organizado */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="container flex h-full items-center justify-between px-4">
          {/* Logo */}
          <Link to="/feed" className="flex-shrink-0">
            <PetBookLogo size="sm" />
          </Link>

          {/* Desktop Nav - Itens principais incluindo Serviços Pet */}
          <nav className="hidden md:flex items-center gap-1">
            {primaryNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive && "gradient-bg"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Create Story/Post - Botão de ação rápida */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/create-post" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Criar Post
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/create-story" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Criar Story
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Pet Selector */}
            {currentPet && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentPet.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {currentPet.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline max-w-[100px] truncate">
                      {currentPet.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Meus Pets</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {myPets.map((pet) => (
                    <DropdownMenuItem key={pet.id} asChild>
                      <Link to={`/pet/${pet.id}`} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={pet.avatar_url || undefined} />
                          <AvatarFallback>{pet.name[0]}</AvatarFallback>
                        </Avatar>
                        {pet.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/create-pet" className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4" />
                      Cadastrar novo pet
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Settings Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Alternar Tipo de Conta */}
                <DropdownMenuLabel>Tipo de Conta</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => handleSwitchAccount('user')}
                  className={!isProfessional ? 'bg-primary/10' : ''}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>Usuário (Guardião)</span>
                  {!isProfessional && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSwitchAccount('professional')}
                  className={isProfessional ? 'bg-primary/10' : ''}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span>Profissional</span>
                  {isProfessional && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {/* Itens secundários de navegação */}
                {secondaryNavItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                
                {/* Perfil Profissional */}
                {isProfessional && (
                  <>
                    <DropdownMenuLabel>Área Profissional</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/professional-dashboard" className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Painel de Atendimento
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/professional-profile" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Editar Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                {/* Admin */}
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-16 md:hidden">
          <div 
            className="absolute inset-0 bg-background/95 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <nav className="relative bg-card border-b border-border p-4 space-y-2 animate-slide-up">
            {/* Primary Items */}
            {primaryNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn("w-full justify-start gap-3", isActive && "gradient-bg")}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            <div className="h-px bg-border my-2" />
            
            {/* Secondary Items */}
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn("w-full justify-start gap-3", isActive && "gradient-bg")}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            <div className="h-px bg-border my-2" />
            
            {/* Create Actions */}
            <Link to="/create-post" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <PlusCircle className="h-5 w-5" />
                Criar Post
              </Button>
            </Link>
            <Link to="/create-story" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Sparkles className="h-5 w-5" />
                Criar Story
              </Button>
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
};
