import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Database } from '@/integrations/supabase/types';
import { createServiceProvider, updateServiceProvider } from '@/integrations/supabase/serviceProvidersService';
import { toast } from 'sonner';

// Tipos do Supabase
type ServiceProvider = Database['public']['Tables']['service_providers']['Row'];
type ServiceType = Database['public']['Enums']['service_type'];

// Definir o Schema de Validação
const serviceProviderSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  service_type: z.enum(['veterinario', 'banho_tosa', 'passeador', 'loja', 'hotel'], {
    required_error: 'Selecione um tipo de serviço.',
  }),
  description: z.string().max(500).optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Email inválido.' }).optional().or(z.literal('')),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_verified: z.boolean().optional(),
});

type ServiceProviderFormValues = z.infer<typeof serviceProviderSchema>;

interface ServiceProviderFormProps {
  initialData?: ServiceProvider;
  onSuccess: () => void;
}

const serviceTypeOptions: { value: ServiceType; label: string }[] = [
  { value: 'veterinario', label: 'Veterinário' },
  { value: 'banho_tosa', label: 'Banho & Tosa' },
  { value: 'passeador', label: 'Passeador' },
  { value: 'loja', label: 'Loja Pet' },
  { value: 'hotel', label: 'Hotel Pet' },
];

const ServiceProviderForm: React.FC<ServiceProviderFormProps> = ({ initialData, onSuccess }) => {
  const isEdit = !!initialData;

  const form = useForm<ServiceProviderFormValues>({
    resolver: zodResolver(serviceProviderSchema),
    defaultValues: {
      name: initialData?.name || '',
      service_type: initialData?.service_type || 'veterinario',
      description: initialData?.description || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
      is_verified: initialData?.is_verified || false,
    },
  });

  const onSubmit = async (values: ServiceProviderFormValues) => {
    const providerData: Database['public']['Tables']['service_providers']['Insert'] = {
      name: values.name,
      service_type: values.service_type,
      description: values.description || null,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
      latitude: values.latitude || null,
      longitude: values.longitude || null,
      is_verified: values.is_verified || false,
    };

    let result;
    if (isEdit && initialData) {
      result = await updateServiceProvider(initialData.id, providerData);
    } else {
      result = await createServiceProvider(providerData);
    }

    if (result.error) {
      toast.error(`Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} provedor: ${result.error.message}`);
    } else {
      toast.success(`Provedor ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`);
      onSuccess();
      if (!isEdit) {
        form.reset(); // Limpa o formulário após o cadastro
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Provedor/Loja</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Clínica Veterinária Pet Feliz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Serviço</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serviceTypeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Breve descrição dos serviços oferecidos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(XX) XXXX-XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="contato@provedor.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Rua Exemplo, 123 - Cidade/UF" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="-23.5505"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="-46.6333"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_verified"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Provedor Verificado
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Marque se o provedor foi verificado pelo PetBook.
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Salvando...' : isEdit ? 'Atualizar Provedor' : 'Cadastrar Provedor'}
        </Button>
      </form>
    </Form>
  );
};

export default ServiceProviderForm;
