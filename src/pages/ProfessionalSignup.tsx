import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, MapPin, Award, DollarSign, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const PROFESSIONAL_TYPES = [
  { value: "veterinarian", label: "Veterinário(a)" },
  { value: "pet_groomer", label: "Pet Groomer" },
  { value: "pet_trainer", label: "Treinador(a) de Pets" },
  { value: "pet_sitter", label: "Pet Sitter" },
  { value: "pet_shop", label: "Pet Shop" },
  { value: "dog_walker", label: "Dog Walker" },
  { value: "pet_photographer", label: "Fotógrafo(a) de Pets" },
  { value: "other", label: "Outro" },
];

const SPECIALTIES = [
  "Cães",
  "Gatos",
  "Pássaros",
  "Roedores",
  "Répteis",
  "Peixes",
  "Coelhos",
  "Hamsters",
];

export default function ProfessionalSignup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfessionalProfile, refreshProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    professional_service_type: "",
    professional_bio: "",
    professional_phone: "",
    professional_address: "",
    professional_city: "",
    professional_state: "",
    professional_zip: "",
    professional_specialties: [] as string[],
    professional_price_range: "",
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      professional_service_type: value,
    }));
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      professional_specialties: prev.professional_specialties.includes(specialty)
        ? prev.professional_specialties.filter((s) => s !== specialty)
        : [...prev.professional_specialties, specialty],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.professional_service_type) {
      toast.error("Selecione sua profissão");
      return;
    }

    if (!formData.professional_bio.trim()) {
      toast.error("Preencha sua bio profissional");
      return;
    }

    if (!formData.professional_phone.trim()) {
      toast.error("Preencha seu telefone");
      return;
    }

    if (!formData.professional_city.trim()) {
      toast.error("Preencha sua cidade");
      return;
    }

    if (!formData.professional_state.trim()) {
      toast.error("Preencha seu estado");
      return;
    }

    if (formData.professional_specialties.length === 0) {
      toast.error("Selecione pelo menos uma especialidade");
      return;
    }

    setLoading(true);
    try {
      await updateProfessionalProfile({
        account_type: "professional",
        professional_bio: formData.professional_bio,
        professional_phone: formData.professional_phone,
        professional_address: formData.professional_address,
        professional_city: formData.professional_city,
        professional_state: formData.professional_state,
        professional_zip: formData.professional_zip,
        professional_specialties: formData.professional_specialties,
        professional_service_type: formData.professional_service_type,
        professional_price_range: formData.professional_price_range,
      });

      toast.success("Perfil profissional criado com sucesso!");
      await refreshProfile(); // Força a atualização do contexto após o sucesso
      navigate("/feed");
    } catch (error) {
      console.error("Erro ao criar perfil profissional:", error);
      toast.error("Erro ao criar perfil profissional");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex flex-col items-center justify-center px-4 py-8">
      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/signup-choice")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Briefcase className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <h1 className="text-4xl font-heading font-bold mb-2">
              Cadastro Profissional
            </h1>
            <p className="text-muted-foreground">
              Complete seu perfil para começar a oferecer seus serviços
            </p>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-secondary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para criar seu perfil profissional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Professional Type */}
                <div className="space-y-2">
                  <Label htmlFor="professional_service_type" className="flex items-center gap-2 font-semibold">
                    <Award className="w-4 h-4" />
                    Tipo de Profissional *
                  </Label>
                  <Select value={formData.professional_service_type} onValueChange={handleSelectChange}>
                    <SelectTrigger id="professional_service_type" className="h-11">
                      <SelectValue placeholder="Selecione sua profissão" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONAL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="professional_bio" className="font-semibold">Bio Profissional *</Label>
                  <Textarea
                    id="professional_bio"
                    name="professional_bio"
                    placeholder="Descreva sua experiência, especialidades e o que torna você único..."
                    value={formData.professional_bio}
                    onChange={handleInputChange}
                    className="min-h-24 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.professional_bio.length}/500 caracteres
                  </p>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <Label htmlFor="professional_phone" className="font-semibold">Telefone/WhatsApp *</Label>
                  <Input
                    id="professional_phone"
                    name="professional_phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.professional_phone}
                    onChange={handleInputChange}
                    className="h-11"
                  />
                </div>

                {/* Location - MANDATORY */}
                <div className="space-y-3 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <Label className="flex items-center gap-2 font-semibold text-base">
                    <MapPin className="w-4 h-4" />
                    Localização *
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="professional_city" className="text-sm">Cidade *</Label>
                      <Input
                        id="professional_city"
                        name="professional_city"
                        placeholder="São Paulo"
                        value={formData.professional_city}
                        onChange={handleInputChange}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="professional_state" className="text-sm">Estado *</Label>
                      <Input
                        id="professional_state"
                        name="professional_state"
                        placeholder="SP"
                        value={formData.professional_state}
                        onChange={handleInputChange}
                        maxLength={2}
                        className="h-10 uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="professional_address" className="text-sm">Endereço (opcional)</Label>
                    <Input
                      id="professional_address"
                      name="professional_address"
                      placeholder="Rua, número, bairro"
                      value={formData.professional_address}
                      onChange={handleInputChange}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="professional_zip" className="text-sm">CEP (opcional)</Label>
                    <Input
                      id="professional_zip"
                      name="professional_zip"
                      placeholder="00000-000"
                      value={formData.professional_zip}
                      onChange={handleInputChange}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 font-semibold">
                    <Award className="w-4 h-4" />
                    Especialidades *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Selecione as espécies que você trabalha
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALTIES.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.professional_specialties.includes(specialty)
                            ? "border-secondary bg-secondary text-secondary-foreground shadow-md"
                            : "border-border bg-background text-foreground hover:border-secondary/50"
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label htmlFor="professional_price_range" className="flex items-center gap-2 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    Faixa de Preço (opcional)
                  </Label>
                  <Input
                    id="professional_price_range"
                    name="professional_price_range"
                    placeholder="Ex: R$ 50 - R$ 150"
                    value={formData.professional_price_range}
                    onChange={handleInputChange}
                    className="h-11"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando perfil...
                    </>
                  ) : (
                    "Criar Perfil Profissional"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>
            Você poderá editar essas informações a qualquer momento no seu perfil profissional
          </p>
        </motion.div>
      </div>
    </div>
  );
}
