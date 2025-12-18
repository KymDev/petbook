import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PetBookLogo } from "@/components/PetBookLogo";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const AuthConfirm = () => {
  const { user, loading, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showChangeEmail, setShowChangeEmail] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Usuário já confirmou e está logado → vai escolher tipo de cadastro
      navigate("/signup-choice");
    }
  }, [user, loading, navigate]);

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setResending(true);
    try {
      await resendConfirmationEmail(user.email);
      toast.success("Email de confirmação reenviado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao reenviar email");
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Digite um novo email");
      return;
    }

    if (newEmail === user?.email) {
      toast.error("Digite um email diferente");
      return;
    }

    setChangingEmail(true);
    try {
      // Aqui você pode implementar a lógica de mudar email
      // Por enquanto, vamos voltar para auth e deixar o usuário se cadastrar novamente
      toast.success("Por favor, faça o cadastro novamente com o novo email");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Erro ao mudar email");
    } finally {
      setChangingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center px-4 py-8">
      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-heading font-bold mb-2">
              Verifique seu e-mail
            </h1>
            <p className="text-muted-foreground">
              Enviamos um link de confirmação para ativar sua conta
            </p>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Email enviado</CardTitle>
                  <CardDescription>Clique no link para confirmar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Display */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Email de confirmação enviado para:</p>
                <p className="text-lg font-semibold text-foreground break-all">{user?.email}</p>
              </div>

              {/* Instructions */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm font-semibold text-foreground">O que fazer agora:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Abra seu email</li>
                  <li>Procure por um email do PetBook</li>
                  <li>Clique no link de confirmação</li>
                  <li>Pronto! Sua conta será ativada</li>
                </ol>
              </div>

              {/* Resend Button */}
              <Button
                onClick={handleResendEmail}
                disabled={resending}
                variant="outline"
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Reenviar Email de Confirmação
                  </>
                )}
              </Button>

              {/* Change Email Section */}
              {!showChangeEmail ? (
                <Button
                  onClick={() => setShowChangeEmail(true)}
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Não é o email correto? Mudar email
                </Button>
              ) : (
                <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Você será redirecionado para criar uma nova conta com o novo email
                    </p>
                  </div>
                  <Input
                    type="email"
                    placeholder="Novo email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={changingEmail}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleChangeEmail}
                      disabled={changingEmail}
                      className="flex-1"
                    >
                      {changingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Mudando...
                        </>
                      ) : (
                        "Confirmar"
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowChangeEmail(false);
                        setNewEmail("");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          <p>
            Não recebeu o email? Verifique sua pasta de spam ou clique em "Reenviar Email"
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthConfirm;
