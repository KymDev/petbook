import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PetBookLogo } from "@/components/PetBookLogo";
import { User, Briefcase, ArrowRight, Heart, Store } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupChoice() {
  const navigate = useNavigate();

  const handleNormalSignup = () => {
    navigate("/create-pet");
  };

  const handleProfessionalSignup = () => {
    navigate("/professional-signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center px-4 py-8">
      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <PetBookLogo size="lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Bem-vindo ao PetBook!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha como você quer começar sua jornada conosco
          </p>
        </motion.div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Normal User Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden relative bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Mais Popular
                  </span>
                </div>
                <CardTitle className="text-2xl">Guardião de Pet</CardTitle>
                <CardDescription className="text-base mt-2">
                  Cadastre seus pets e conecte-se com a comunidade
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">Crie perfis para seus pets</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">Compartilhe momentos e histórias</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">Encontre serviços para seus pets</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">Conecte com outros guardiões</span>
                  </div>
                </div>
                <Button
                  onClick={handleNormalSignup}
                  className="w-full h-11 text-base font-semibold group/btn"
                >
                  <span>Começar como Guardião</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Professional Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-2 border-secondary/30 hover:border-secondary/60 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden relative bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                    <Briefcase className="w-8 h-8 text-secondary" />
                  </div>
                  <span className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                    Para Profissionais
                  </span>
                </div>
                <CardTitle className="text-2xl">Profissional</CardTitle>
                <CardDescription className="text-base mt-2">
                  Ofereça seus serviços e cresça seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                    <span className="text-sm text-foreground/80">Configure seu perfil profissional</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                    <span className="text-sm text-foreground/80">Defina sua especialidade e localização</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                    <span className="text-sm text-foreground/80">Mostre seus serviços e valores</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                    <span className="text-sm text-foreground/80">Conecte com clientes em potencial</span>
                  </div>
                </div>
                <Button
                  onClick={handleProfessionalSignup}
                  variant="outline"
                  className="w-full h-11 text-base font-semibold border-secondary/30 hover:border-secondary/60 hover:bg-secondary/5 group/btn"
                >
                  <span>Começar como Profissional</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>
            Você pode mudar entre os tipos de conta a qualquer momento nas configurações
          </p>
        </motion.div>
      </div>
    </div>
  );
}
