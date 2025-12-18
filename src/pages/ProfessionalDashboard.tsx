import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertCircle, 
  Calendar, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ServiceRequest {
  id: string;
  pet_id: string;
  pet_name: string;
  pet_avatar: string | null;
  guardian_name: string;
  service_type: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"; // Adicionado 'cancelled'
  created_at: string;
  phone?: string;
}

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedServices: 0,
    rating: 4.8,
  });

  useEffect(() => {
    if (profile?.account_type === 'professional') {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Buscar Solicitações de Serviço
    const { data: requestsData, error: requestsError } = await supabase
      .from('service_requests')
      .select(`
        id,
        service_type,
        message,
        status,
        created_at,
        pet:pet_id(id, name, avatar_url, guardian_name:guardian_name, guardian_phone:guardian_phone)
      `)
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error("Erro ao buscar solicitações:", requestsError);
      setLoading(false);
      return;
    }

    // Mapear e tipar os dados (ajustando para a nova estrutura de select)
    const mappedRequests: ServiceRequest[] = requestsData.map((req: any) => ({
      id: req.id,
      pet_id: req.pet.id,
      pet_name: req.pet.name,
      pet_avatar: req.pet.avatar_url,
      guardian_name: req.pet.guardian_name || 'Guardião Desconhecido', // Assumindo que pets tem guardian_name
      service_type: req.service_type,
      message: req.message,
      status: req.status,
      created_at: req.created_at,
      phone: req.pet.guardian_phone, // Assumindo que pets tem guardian_phone
    }));

    // 2. Calcular Estatísticas
    const totalRequests = mappedRequests.length;
    const pendingRequests = mappedRequests.filter(r => r.status === 'pending').length;
    const completedServices = mappedRequests.filter(r => r.status === 'completed').length;

    // 3. Buscar Avaliações (para o rating)
    const { data: reviewsData } = await supabase
      .from('service_reviews')
      .select('rating')
      .eq('professional_id', user.id);

    let averageRating = 0;
    if (reviewsData && reviewsData.length > 0) {
      const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
      averageRating = parseFloat((totalRating / reviewsData.length).toFixed(1));
    }

    setRequests(mappedRequests);
    setStats({
      totalRequests,
      pendingRequests,
      completedServices,
      rating: averageRating || 5.0, // Default 5.0 se não houver avaliações
    });
    
    setLoading(false);
  };

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

  const getStatusBadge = (status: ServiceRequest['status']) => {
    const variants = {
      pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      accepted: { label: "Aceito", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Recusado", variant: "destructive" as const, icon: XCircle },
      completed: { label: "Concluído", variant: "outline" as const, icon: CheckCircle },
      cancelled: { label: "Cancelado", variant: "destructive" as const, icon: XCircle }, // Adicionado 'cancelled'
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading">Painel de Atendimento</h1>
            <p className="text-muted-foreground">Gerencie suas solicitações e agendamentos</p>
          </div>
          <Button onClick={() => navigate('/professional-profile')}>
            Editar Perfil
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Aguardando resposta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedServices}</div>
              <p className="text-xs text-muted-foreground">Serviços finalizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                {stats.rating}
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground">Média de avaliações</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Solicitações
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          {/* Solicitações */}
          <TabsContent value="requests" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Carregando...</p>
                </CardContent>
              </Card>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação</h3>
                  <p className="text-muted-foreground">
                    Você ainda não recebeu solicitações de serviço.
                  </p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.pet_avatar || undefined} />
                          <AvatarFallback>{request.pet_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{request.pet_name}</CardTitle>
                          <CardDescription>Guardião: {request.guardian_name}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-1">Serviço solicitado:</p>
                      <Badge variant="outline">{request.service_type}</Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold mb-1">Mensagem:</p>
                      <p className="text-sm text-muted-foreground">{request.message}</p>
                    </div>

                    {request.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{request.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1" size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aceitar
                        </Button>
                        <Button variant="outline" className="flex-1" size="sm">
                          <XCircle className="h-4 w-4 mr-2" />
                          Recusar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Agenda */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Agenda de Atendimentos</CardTitle>
                <CardDescription>Seus compromissos agendados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Funcionalidade de agenda em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Meus Clientes</CardTitle>
                <CardDescription>Pets e guardiões que você atende</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>Lista de clientes em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas e Desempenho</CardTitle>
                <CardDescription>Análise dos seus serviços</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Estatísticas detalhadas em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProfessionalDashboard;
