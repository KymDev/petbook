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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { createHealthRecord, updateHealthRecord } from '@/integrations/supabase/healthRecordsService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Tipos do Supabase
type HealthRecord = Database['public']['Tables']['health_records']['Row'];
type HealthRecordInsert = Database['public']['Tables']['health_records']['Insert'];

// Definir o Schema de Validação
const healthRecordSchema = z.object({
  title: z.string().min(2, { message: 'O título deve ter pelo menos 2 caracteres.' }),
  record_type: z.enum(['vaccine', 'vet_visit', 'medication', 'diet', 'grooming', 'other'], {
    required_error: 'Selecione um tipo de registro.',
  }),
  record_date: z.date({
    required_error: 'A data do registro é obrigatória.',
  }),
  notes: z.string().max(500).optional(),
  attachment_url: z.string().url({ message: 'URL de anexo inválida.' }).optional().or(z.literal('')),
});

type HealthRecordFormValues = z.infer<typeof healthRecordSchema>;

interface HealthRecordFormProps {
  petId: string;
  initialData?: HealthRecord;
  onSuccess: () => void;
  onClose: () => void;
}

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ petId, initialData, onSuccess, onClose }) => {
  const isEdit = !!initialData;

  const form = useForm<HealthRecordFormValues>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      title: initialData?.title || '',
      record_type: initialData?.record_type || 'vaccine',
      record_date: initialData?.record_date ? new Date(initialData.record_date) : new Date(),
      notes: initialData?.notes || '',
      attachment_url: initialData?.attachment_url || '',
    },
  });

  const onSubmit = async (values: HealthRecordFormValues) => {
    const recordData: HealthRecordInsert = {
      pet_id: petId,
      title: values.title,
      record_type: values.record_type,
      record_date: values.record_date.toISOString(),
      notes: values.notes || null,
      attachment_url: values.attachment_url || null,
    };

    let result;
    if (isEdit && initialData) {
      result = await updateHealthRecord(initialData.id, recordData);
    } else {
      result = await createHealthRecord(recordData);
    }

    if (result.error) {
      toast.error(`Erro ao ${isEdit ? 'atualizar' : 'criar'} registro: ${result.error.message}`);
    } else {
      toast.success(`Registro de saúde ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
      onSuccess();
      onClose();
    }
  };

  // Lista de tipos de registro para o Select
  const recordTypes = [
    { value: 'vaccine', label: 'Vacina' },
    { value: 'vet_visit', label: 'Consulta Veterinária' },
    { value: 'medication', label: 'Medicação' },
    { value: 'diet', label: 'Dieta/Alimentação' },
    { value: 'grooming', label: 'Higiene/Tosa' },
    { value: 'other', label: 'Outro' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Vacina V8 Anual" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="record_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Registro</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {recordTypes.map((type) => (
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
          name="record_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Registro</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : <span>Selecione uma data</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes importantes sobre o registro..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachment_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Anexo (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: https://storage.supabase.co/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Salvando...' : isEdit ? 'Atualizar Registro' : 'Criar Registro'}
        </Button>
      </form>
    </Form>
  );
};

export default HealthRecordForm;
