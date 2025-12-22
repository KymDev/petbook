import { useState } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  CheckCircle,
  AlertCircle,
  Save,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const serviceTypeOptions = [
  { value: "veterinario", label: "Veterinário" },
  { value: "banho_tosa", label: "Banho & Tosa" },
  { value: "passeador", label: "Passeador" },
  { value: "loja", label: "Loja Pet" },
  { value: "hotel", label: "Hotel Pet" }
];

const specialtiesOptions = [
  "Cães",
  "Gatos",
  "Aves",
  "Roedores",
  "Répteis",
  "Cirurgia",
  "Dermatologia",
  "Cardiologia",
  "Ortopedia",
  "Comportamento",
  "Nutrição",
  "Emergência 24h"
];

const ProfessionalProfile = () => {
  const { profile, updateProfessionalProfile } = useUserProfile();
  const { deleteAccount } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    professional_bio: profile?.professional_bio || "",
    professional_phone: profile?.professional_phone || "",
    professional_address: profile?.professional_address || "",
    professional_service_type:
      profile?.professional_service_type || "",
    professional_specialties:
      profile?.professional_specialties || [],
    professional_whatsapp:
      profile?.professional_whatsapp || ""
  });

  if (!profile || profile.account_type !== "professional") {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">
                Acesso Restrito
              </h2>
              <p className="text-muted-foreground mb-4">
                Esta página é apenas para contas profissionais.
              </p>
              <Button onClick={() => navigate("/feed")}>
                Voltar ao Feed
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfessionalProfile(formData);
      toast({
        title: "Perfil atualizado!",
        description:
          "Suas informações profissionais foram salvas com sucesso."
      });
    } catch {
      toast({
        title: "Erro ao salvar",
        description:
          "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      professional_specialties:
        prev.professional_specialties.includes(specialty)
          ? prev.professional_specialties.filter(
              s => s !== specialty
            )
          : [...prev.professional_specialties, specialty]
    }));
  };

  const handleDeleteAccount = async () => {
    setIsSaving(true);
    try {
      const { error } = await deleteAccount();
      if (error) throw error;

      toast({
        title: "Conta deletada",
        description: "Sua conta foi removida com sucesso."
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao deletar conta",
        description:
          error.message || "Algo deu errado ao deletar a conta.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Briefcase className="h-8 w-8" />
              Perfil Profissional
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete suas informações para aparecer no diretório
              de serviços
            </p>
          </div>

          {profile.is_professional_verified ? (
            <Badge className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Verificado
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Pendente
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Serviço</CardTitle>
              <CardDescription>
                Selecione o tipo principal de serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.professional_service_type}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    professional_service_type: value
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypeOptions.map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Especialidades</CardTitle>
              <CardDescription>
                Selecione suas áreas de especialização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {specialtiesOptions.map(specialty => (
                  <Badge
                    key={specialty}
                    variant={
                      formData.professional_specialties.includes(
                        specialty
                      )
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      toggleSpecialty(specialty)
                    }
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre Você</CardTitle>
              <CardDescription>
                Conte um pouco sobre sua experiência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                value={formData.professional_bio}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    professional_bio: e.target.value
                  }))
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.professional_phone}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      professional_phone: e.target.value
                    }))
                  }
                />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input
                  value={formData.professional_whatsapp}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      professional_whatsapp: e.target.value
                    }))
                  }
                />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input
                  value={formData.professional_address}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      professional_address: e.target.value
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Perfil"}
          </Button>

          <Card className="border-red-500/50 bg-red-500/10">
            <CardHeader>
              <CardTitle className="text-red-600">
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-500 text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Deletar conta permanentemente?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação é irreversível.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
};

export default ProfessionalProfile;
