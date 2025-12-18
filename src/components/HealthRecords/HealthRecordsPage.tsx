import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHealthRecords, deleteHealthRecord } from '@/integrations/supabase/healthRecordsService';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Edit, CalendarIcon, FileText, Link } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import HealthRecordForm from './HealthRecordForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Tipos do Supabase
type HealthRecord = Database['public']['Tables']['health_records']['Row'];

// Mapeamento de ícones e cores para os tipos de registro
const recordTypeMap: Record<string, { label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string }> = {
  vaccine: { label: 'Vacina', icon: Plus, color: 'text-blue-500' },
  vet_visit: { label: 'Consulta', icon: FileText, color: 'text-green-500' },
  medication: { label: 'Medicação', icon: Plus, color: 'text-red-500' },
  diet: { label: 'Dieta', icon: FileText, color: 'text-yellow-500' },
  grooming: { label: 'Higiene', icon: FileText, color: 'text-purple-500' },
  other: { label: 'Outro', icon: FileText, color: 'text-gray-500' },
};

interface HealthRecordsPageProps {
  // O ID do pet deve ser passado como prop, assumindo que a página é acessada via /pets/:petId/health
  petId: string;
  petName: string; // Para melhor UX
}

const HealthRecordsPage: React.FC<HealthRecordsPageProps> = ({ petId, petName }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | undefined>(undefined);

  // Use useQuery para buscar os dados
  const { data: records, isLoading, refetch } = useQuery({
    queryKey: ['healthRecords', petId],
    queryFn: () => getHealthRecords(petId).then(res => {
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    }),
    enabled: !!petId,
  });

  const handleDelete = async (recordId: string) => {
    const { error } = await deleteHealthRecord(recordId);
    if (error) {
      toast.error(`Erro ao deletar registro: ${error.message}`);
    } else {
      toast.success('Registro deletado com sucesso!');
      refetch();
    }
  };

  const handleOpenForm = (record?: HealthRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingRecord(undefined);
    setIsFormOpen(false);
  };

  const handleSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Registros de Saúde de {petName}
        </h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm(undefined)}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Editar' : 'Novo'} Registro de Saúde</DialogTitle>
            </DialogHeader>
            <HealthRecordForm
              petId={petId}
              initialData={editingRecord}
              onSuccess={handleSuccess}
              onClose={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {records && records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record) => {
            const typeInfo = recordTypeMap[record.record_type] || recordTypeMap.other;
            const Icon = typeInfo.icon;

            return (
              <Card key={record.id} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${typeInfo.color}`} />
                    <CardTitle className="text-xl font-semibold">{record.title}</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(record)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso deletará permanentemente o registro de saúde "{record.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(record.id)} className="bg-red-500 hover:bg-red-600">
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{format(new Date(record.record_date), 'dd/MM/yyyy')}</span>
                  </div>
                  <p className="text-sm font-medium">Tipo: {typeInfo.label}</p>
                  {record.notes && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.notes}</p>
                  )}
                  {record.attachment_url && (
                    <a href={record.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:underline text-sm">
                      <Link className="mr-1 h-4 w-4" /> Ver Anexo
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-10 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Nenhum Registro de Saúde Encontrado</h2>
          <p className="text-gray-500">Comece a registrar a saúde de {petName} clicando no botão "Adicionar Registro".</p>
        </div>
      )}
    </div>
  );
};

export default HealthRecordsPage;
