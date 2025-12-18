import { supabase } from './client';
import { Database } from './types';

// Tipos auxiliares para facilitar o uso
type ServiceProvider = Database['public']['Tables']['service_providers']['Row'];
type ServiceProviderInsert = Database['public']['Tables']['service_providers']['Insert'];
type ServiceProviderUpdate = Database['public']['Tables']['service_providers']['Update'];
type ServiceType = Database['public']['Enums']['service_type'];

/**
 * Obtém todos os provedores de serviço.
 * @returns Uma lista de provedores de serviço ou um erro.
 */
export async function getAllServiceProviders(): Promise<{ data: ServiceProvider[] | null; error: any }> {
  const { data, error } = await supabase
    .from('service_providers')
    .select('*')
    .order('name', { ascending: true });

  return { data, error };
}

/**
 * Obtém provedores de serviço filtrados por tipo.
 * @param serviceType O tipo de serviço.
 * @returns Uma lista de provedores de serviço ou um erro.
 */
export async function getServiceProvidersByType(serviceType: ServiceType): Promise<{ data: ServiceProvider[] | null; error: any }> {
  const { data, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('service_type', serviceType)
    .order('name', { ascending: true });

  return { data, error };
}

/**
 * Cria um novo provedor de serviço (requer permissão de admin, conforme RLS).
 * @param providerData Os dados do novo provedor.
 * @returns O provedor criado ou um erro.
 */
export async function createServiceProvider(providerData: ServiceProviderInsert): Promise<{ data: ServiceProvider | null; error: any }> {
  const { data, error } = await supabase
    .from('service_providers')
    .insert(providerData)
    .select()
    .single();

  return { data, error };
}

/**
 * Atualiza um provedor de serviço existente (requer permissão de admin, conforme RLS).
 * @param providerId O ID do provedor a ser atualizado.
 * @param providerData Os dados a serem atualizados.
 * @returns O provedor atualizado ou um erro.
 */
export async function updateServiceProvider(providerId: string, providerData: ServiceProviderUpdate): Promise<{ data: ServiceProvider | null; error: any }> {
  const { data, error } = await supabase
    .from('service_providers')
    .update(providerData)
    .eq('id', providerId)
    .select()
    .single();

  return { data, error };
}

/**
 * Deleta um provedor de serviço (requer permissão de admin, conforme RLS).
 * @param providerId O ID do provedor a ser deletado.
 * @returns Um erro, se houver.
 */
export async function deleteServiceProvider(providerId: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('service_providers')
    .delete()
    .eq('id', providerId);

  return { error };
}
