import { useState } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, CheckCircle, AlertCircle, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const serviceTypeOptions = [
  { value: 'veterinario', label: 'Veterinário' },
  { value: 'banho_tosa', label: 'Banho & Tosa' },
  { value: 'passeador', label: 'Passeador' },
  { value: 'loja', label: 'Loja Pet' },
  { value: 'hotel', label: 'Hotel Pet' },
];

const specialtiesOptions = [
  'Cães', 'Gatos', 'Aves', 'Roedores', 'Répteis',
  'Cirurgia', 'Dermatologia', 'Cardiologia', 'Ortopedia',
  'Comportamento', 'Nutrição', 'Emergência 24h'
];

const ProfessionalProfile = () => {
  const { profile, updateProfessionalProfile } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    professional_bio: profile?.professional_bio || '',
    professional_phone: profile?.professional_phone || '',
    professional_address: profile?.professional_address || '',
    professional_service_type: profile?.professional_service_type || '',
    professional_specialties: profile?.professional_specialties || [],
  });

  if (!profile || profile.account_type !== 'professional') {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground mb-4">
                Esta página é apenas para contas profissionais.
              </p>
              <Button onClick={() => navigate('/feed')}>
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
        description: "Suas informações profissionais foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      professional_specialties: prev.professional_specialties.includes(specialty)
        ? prev.professional_specialties.filter(s => s !== specialty)
        : [...prev.professional_specialties, specialty]
    }));
  };

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading flex items-center gap-2">
              <Briefcase className="h-8 w-8" />
              Perfil Profissional
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete suas informações para aparecer no diretório de serviços
            </p>
          </div>
          {profile.is_professional_verified ? (
            <Badge variant="default" className="gap-1">
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
          {/* Tipo de Serviço */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Serviço</CardTitle>
              <CardDescription>
                Selecione o tipo principal de serviço que você oferece
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.professional_service_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, professional_service_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Especialidades */}
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
                    variant={formData.professional_specialties.includes(specialty) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Biografia */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre Você</CardTitle>
              <CardDescription>
                Conte um pouco sobre sua experiência e serviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.professional_bio}
                onChange={(e) => setFormData(prev => ({ ...prev, professional_bio: e.target.value }))}
                placeholder="Ex: Veterinário com 10 anos de experiência em clínica geral e cirurgia..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>
                Como os clientes podem entrar em contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.professional_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, professional_phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.professional_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, professional_address: e.target.value }))}
                  placeholder="Rua, número, bairro, cidade - UF"
                />
              </div>
            </CardContent>
          </Card>

          {/* Aviso de Verificação */}
          {!profile.is_professional_verified && (
            <Card className="border-yellow-500/50 bg-yellow-500/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-600">
                      Aguardando Verificação
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Após preencher todas as informações, nossa equipe irá revisar seu perfil. 
                      Você receberá uma notificação quando for aprovado e poderá aparecer no diretório de serviços.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botão de Salvar */}
          <Button type="submit" className="w-full" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ProfessionalProfile;
