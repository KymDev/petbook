import React from 'react';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  Stethoscope,
  Scissors,
  Dog,
  ShoppingBag,
  Hotel
} from 'lucide-react';

type ServiceProvider = Database['public']['Tables']['service_providers']['Row'];

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

const serviceTypeConfig = {
  veterinario: { 
    label: 'Veterinário', 
    icon: Stethoscope, 
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-cyan-500'
  },
  banho_tosa: { 
    label: 'Banho & Tosa', 
    icon: Scissors, 
    color: 'bg-pink-500',
    gradient: 'from-pink-500 to-rose-500'
  },
  passeador: { 
    label: 'Passeador', 
    icon: Dog, 
    color: 'bg-green-500',
    gradient: 'from-green-500 to-emerald-500'
  },
  loja: { 
    label: 'Loja Pet', 
    icon: ShoppingBag, 
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-violet-500'
  },
  hotel: { 
    label: 'Hotel Pet', 
    icon: Hotel, 
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-amber-500'
  },
};

const ServiceProviderCard: React.FC<ServiceProviderCardProps> = ({ provider }) => {
  const config = serviceTypeConfig[provider.service_type];
  const Icon = config.icon;

  const handleContact = (type: 'phone' | 'email') => {
    if (type === 'phone' && provider.phone) {
      window.open(`tel:${provider.phone}`, '_self');
    } else if (type === 'email' && provider.email) {
      window.open(`mailto:${provider.email}`, '_self');
    }
  };

  const handleDirections = () => {
    if (provider.address) {
      const query = encodeURIComponent(provider.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <Card className="card-elevated border-0 overflow-hidden animate-fade-in hover:shadow-xl transition-all duration-300">
      {/* Header com gradiente */}
      <div className={`h-24 bg-gradient-to-r ${config.gradient} relative`}>
        <div className="absolute -bottom-8 left-6">
          <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
            <AvatarFallback className={`${config.color} text-white text-2xl font-bold`}>
              <Icon className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="pt-10 pb-6 space-y-4">
        {/* Nome e Badge */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{provider.name}</h3>
              {provider.is_verified && <VerifiedBadge size="md" />}
            </div>
            <Badge variant="secondary" className="mt-2">
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Descrição */}
        {provider.description && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {provider.description}
          </p>
        )}

        {/* Informações de Contato */}
        <div className="space-y-2 pt-2">
          {provider.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{provider.phone}</span>
            </div>
          )}
          {provider.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground truncate">{provider.email}</span>
            </div>
          )}
          {provider.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground line-clamp-2">{provider.address}</span>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {/* Botão de Solicitar Serviço (NOVO) */}
          <Button 
            onClick={() => console.log('TODO: Implementar modal de solicitação para o profissional:', provider.id)} // TODO: Implementar modal de solicitação
            className="flex-1 gradient-bg"
            size="sm"
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Solicitar Serviço
          </Button>

          {provider.phone && (
            <Button 
              onClick={() => handleContact('phone')}
              className="flex-1" // Removido gradient-bg para dar destaque ao Solicitar Serviço
              variant="outline"
              size="sm"
            >
              <Phone className="h-4 w-4 mr-2" />
              Ligar
            </Button>
          )}
          {provider.address && (
            <Button 
              onClick={handleDirections}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Rotas
            </Button>
          )}
          {provider.email && !provider.phone && (
            <Button 
              onClick={() => handleContact('email')}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceProviderCard;
