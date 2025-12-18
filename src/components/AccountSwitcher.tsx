import { useState } from "react";
import { useUserProfile, AccountType } from "@/contexts/UserProfileContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AccountSwitcher = () => {
  const { profile, switchAccountType } = useUserProfile();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  if (!profile) return null;

  const isProfessional = profile.account_type === 'professional';

  const handleSwitch = async () => {
    setIsSwitching(true);
    try {
      const newType: AccountType = isProfessional ? 'user' : 'professional';
      await switchAccountType(newType);
      
      toast({
        title: "Conta alternada com sucesso!",
        description: `Você está agora no modo ${newType === 'professional' ? 'Profissional' : 'Usuário'}.`,
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao alternar conta",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {isProfessional ? (
            <>
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Profissional</span>
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Usuário</span>
            </>
          )}
          {profile.is_professional_verified && (
            <CheckCircle className="h-3 w-3 text-primary" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alternar Tipo de Conta</DialogTitle>
          <DialogDescription>
            Mude entre conta de usuário e profissional para acessar recursos diferentes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Status Atual */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {isProfessional ? (
                <Briefcase className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
              <div>
                <p className="font-medium">
                  Modo {isProfessional ? 'Profissional' : 'Usuário'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isProfessional 
                    ? 'Gerencie seus serviços e clientes' 
                    : 'Navegue e encontre serviços para seu pet'}
                </p>
              </div>
            </div>
            {profile.is_professional_verified && isProfessional && (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Verificado
              </Badge>
            )}
          </div>

          {/* Alternador */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Switch
                checked={isProfessional}
                onCheckedChange={handleSwitch}
                disabled={isSwitching}
              />
              <Label htmlFor="account-type" className="cursor-pointer">
                {isProfessional 
                  ? 'Alternar para Usuário' 
                  : 'Alternar para Profissional'}
              </Label>
            </div>
          </div>

          {/* Aviso para não verificados */}
          {!profile.is_professional_verified && isProfessional && (
            <div className="flex items-start gap-3 p-4 border border-yellow-500/50 rounded-lg bg-yellow-500/10">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-600">
                  Conta não verificada
                </p>
                <p className="text-xs text-muted-foreground">
                  Complete seu perfil profissional e aguarde a verificação para aparecer no diretório de serviços.
                </p>
              </div>
            </div>
          )}

          {/* Informações sobre recursos */}
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Modo Usuário</p>
                <p className="text-muted-foreground text-xs">
                  Encontre serviços, crie posts, conecte-se com outros pets
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Modo Profissional</p>
                <p className="text-muted-foreground text-xs">
                  Ofereça serviços, gerencie clientes, apareça no diretório
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
