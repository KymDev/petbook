import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllServiceProviders } from '@/integrations/supabase/serviceProvidersService';
import { Database } from '@/integrations/supabase/types';
import { MainLayout } from '@/components/layout/MainLayout';
import { Loader2, Search, Filter, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import ServiceProviderCard from '@/components/Services/ServiceProviderCard';

// Tipos do Supabase
type ServiceProvider = Database['public']['Tables']['service_providers']['Row'];
type ServiceType = Database['public']['Enums']['service_type'];

const serviceTypeOptions: { value: ServiceType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os Serviços' },
  { value: 'veterinario', label: 'Veterinário' },
  { value: 'banho_tosa', label: 'Banho & Tosa' },
  { value: 'passeador', label: 'Passeador' },
  { value: 'loja', label: 'Loja Pet' },
  { value: 'hotel', label: 'Hotel Pet' },
];

const ServiceProvidersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ServiceType | 'all'>('all');

  // 1. Busca de dados
  const { data: providers, isLoading } = useQuery({
    queryKey: ['serviceProviders'],
    queryFn: async () => {
      const { data, error } = await getAllServiceProviders();
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // 2. Filtragem e Busca
  const filteredProviders = useMemo(() => {
    if (!providers) return [];

    return providers.filter(provider => {
      // Filtro por Tipo
      const typeMatch = selectedType === 'all' || provider.service_type === selectedType;

      // Filtro por Termo de Busca (Nome ou Descrição)
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = provider.name.toLowerCase().includes(searchLower) ||
                          (provider.description && provider.description.toLowerCase().includes(searchLower));

      return typeMatch && searchMatch;
    });
  }, [providers, searchTerm, selectedType]);

  return (
    <MainLayout>
      <div className="container max-w-xl py-6 space-y-6">
        <h1 className="text-3xl font-bold font-heading">Diretório de Serviços Pet</h1>
        <p className="text-muted-foreground">Encontre veterinários, passeadores, lojas e mais perto de você.</p>

        {/* Filtros e Busca */}
        <Card className="p-4 shadow-sm">
          <CardContent className="p-0 space-y-3">
            {/* Busca por Texto */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou serviço..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro por Tipo */}
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as ServiceType | 'all')}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Botão de Localização (Futura Implementação) */}
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Localização (Ex: São Paulo)" className="pl-10" disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Provedores */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredProviders.length > 0 ? (
          <div className="grid gap-4">
            {filteredProviders.map(provider => (
              <ServiceProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Nenhum Provedor Encontrado</h2>
            <p className="text-gray-500">Tente ajustar os filtros ou a busca.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ServiceProvidersPage;
