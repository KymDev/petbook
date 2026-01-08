import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Calendar, User, FileText, Tag, Hash, Weight, AlertCircle, Pill, Trash2, Loader2, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface HealthRecord {
  id: string;
  record_date: string;
  title: string;
  record_type: string;
  notes: string;
  version: number;
  weight?: string;
  professional_name?: string;
  attachment_url?: string;
  allergies?: string;
  medications?: string;
  health_standards_vaccines?: { name: string };
  health_standards_exams?: { name: string };
}

interface HealthRecordDetailsProps {
  record: HealthRecord;
  onClose: () => void;
  onDelete?: () => void;
}

export const HealthRecordDetails: React.FC<HealthRecordDetailsProps> = ({ record, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      toast.success("Registro excluído com sucesso!");
      if (onDelete) onDelete();
      onClose();
    } catch (error: any) {
      console.error("Erro ao excluir registro:", error);
      toast.error("Erro ao excluir o registro médico");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRecordBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vacina': return "bg-blue-50 text-blue-700 border-blue-100";
      case 'exame': return "bg-purple-50 text-purple-700 border-purple-100";
      default: return "bg-primary/5 text-primary border-primary/10";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <ChevronLeft size={20} />
          </Button>
          <h3 className="text-lg font-bold text-foreground">Detalhes do Registro</h3>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8">
                <Trash2 size={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Registro Médico</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita e o histórico do pet será alterado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Excluir Permanentemente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <span className={cn("w-fit text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mb-2", getRecordBadgeClass(record.record_type))}>
            {record.record_type}
          </span>
          <h2 className="text-2xl font-bold text-foreground leading-tight">
            {record.health_standards_vaccines?.name || record.health_standards_exams?.name || record.title}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar size={14} />
            <span>{new Date(record.record_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {record.weight && (
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <Weight size={20} />
              </div>
              <div>
                <p className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Peso Registrado</p>
                <p className="font-bold text-amber-900">{record.weight}</p>
              </div>
            </div>
          )}

          {record.professional_name && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Profissional</p>
                <p className="font-bold text-blue-900">{record.professional_name}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {record.allergies && (
            <div className="flex items-start gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100">
              <AlertCircle className="text-red-500 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Alergias Identificadas</p>
                <p className="text-sm text-red-900 font-medium mt-1">{record.allergies}</p>
              </div>
            </div>
          )}

          {record.medications && (
            <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <Pill className="text-indigo-500 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Medicamentos Prescritos</p>
                <p className="text-sm text-indigo-900 font-medium mt-1">{record.medications}</p>
              </div>
            </div>
          )}

          {record.notes && (
            <div className="p-5 bg-muted/30 rounded-2xl border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Observações Clínicas</p>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{record.notes}</p>
            </div>
          )}
        </div>

        {record.attachment_url && (
          <a 
            href={record.attachment_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all"
          >
            <FileText size={20} />
            Visualizar Anexo / Receita
          </a>
        )}

        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest pt-4">
          <Hash size={10} />
          Versão do Prontuário: {record.version}
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={onClose} variant="outline" className="w-full h-12 rounded-xl font-bold">Voltar ao Prontuário</Button>
      </div>
    </div>
  );
};
