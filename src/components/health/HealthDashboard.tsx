import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, ChevronRight, Syringe, FlaskConical, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { HealthRecordDetails } from './HealthRecordDetails';
import { cn } from "@/lib/utils";

interface HealthRecord {
  id: string;
  record_date: string;
  title: string;
  record_type: string;
  notes: string;
  version: number;
  professional_name?: string;
  attachment_url?: string;
  allergies?: string;
  medications?: string;
  health_standards_vaccines?: { name: string };
  health_standards_exams?: { name: string };
}

export const HealthDashboard: React.FC<{ petId: string }> = ({ petId }) => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    fetchHealthTimeline();
  }, [petId]);

  const fetchHealthTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select(`
          *,
          health_standards_vaccines(name),
          health_standards_exams(name)
        `)
        .eq('pet_id', petId)
        .order('record_date', { ascending: false });

      if (error) throw error;
      if (data) setRecords(data as any);
    } catch (error: any) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao carregar histórico de saúde");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-health-report', {
        body: { petId, format: 'json' }
      });
      
      if (error) throw error;

      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical_report_${petId}.json`;
        a.click();
        toast.success("Relatório exportado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao exportar relatório:", error);
      toast.error("Erro ao exportar relatório médico");
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vacina': return <Syringe size={18} className="text-blue-500" />;
      case 'exame': return <FlaskConical size={18} className="text-purple-500" />;
      default: return <ClipboardList size={18} className="text-primary" />;
    }
  };

  const getRecordBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vacina': return "bg-blue-50 text-blue-700 border-blue-100";
      case 'exame': return "bg-purple-50 text-purple-700 border-purple-100";
      default: return "bg-primary/5 text-primary border-primary/10";
    }
  };

  if (selectedRecord) {
    return (
      <div className="p-6 bg-card rounded-2xl shadow-sm border animate-in fade-in zoom-in-95 duration-200">
        <HealthRecordDetails 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
          onDelete={fetchHealthTimeline}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-card rounded-2xl shadow-sm border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prontuário de Saúde</h2>
          <p className="text-sm text-muted-foreground">Histórico completo de vacinas e exames</p>
        </div>
        <Button 
          onClick={generateReport}
          variant="outline"
          className="gap-2 rounded-xl border-primary/20 hover:bg-primary/5 text-primary"
        >
          <FileDown size={18} />
          Exportar PDF
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
            <ClipboardList className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum registro encontrado.</p>
          </div>
        ) : records.map((record) => (
          <div 
            key={record.id} 
            onClick={() => setSelectedRecord(record)}
            className="group relative flex items-center gap-4 p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-primary/10"
          >
            <div className={cn("p-3 rounded-xl border", getRecordBadgeClass(record.record_type))}>
              {getRecordIcon(record.record_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border", getRecordBadgeClass(record.record_type))}>
                  {record.record_type}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                  v{record.version}
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                {record.health_standards_vaccines?.name || record.health_standards_exams?.name || record.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{new Date(record.record_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                {record.professional_name && (
                  <>
                    <span>•</span>
                    <span className="truncate">Dr(a). {record.professional_name}</span>
                  </>
                )}
              </div>
            </div>
            
            <ChevronRight size={18} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>
    </div>
  );
};
