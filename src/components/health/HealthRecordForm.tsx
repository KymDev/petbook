import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, User, Weight, Calendar, AlertCircle, Pill, ClipboardList, Syringe, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export const HealthRecordForm: React.FC<{ petId: string, onSave: () => void }> = ({ petId, onSave }) => {
  const [type, setType] = useState('vaccine');
  const [standards, setStandards] = useState<any[]>([]);
  const [selectedStandardId, setSelectedStandardId] = useState('');
  const [professionalName, setProfessionalName] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStandards();
  }, [type]);

  const fetchStandards = async () => {
    const table = type === 'vaccine' ? 'health_standards_vaccines' : 'health_standards_exams';
    const { data } = await supabase.from(table).select('*');
    setStandards(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        pet_id: petId,
        record_type: type === 'vaccine' ? 'vacina' : 'exame',
        record_date: date,
        notes: notes,
        weight: weight ? `${weight}kg` : null,
        professional_name: professionalName,
        title: standards.find(s => s.id === selectedStandardId)?.name || 'Registro Manual',
        allergies: allergies || null,
        medications: medications || null
      };

      if (type === 'vaccine') payload.vaccine_id = selectedStandardId;
      else payload.exam_id = selectedStandardId;

      const { error } = await supabase.from('health_records').insert(payload);
      
      if (error) throw error;

      toast.success("Registro salvo com sucesso!");
      onSave();
      setNotes('');
      setAllergies('');
      setMedications('');
      setWeight('');
      setProfessionalName('');
      setSelectedStandardId('');
    } catch (error: any) {
      console.error("Erro ao salvar registro:", error);
      toast.error("Erro ao salvar registro médico.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-muted p-1 rounded-xl mb-2">
        <button 
          type="button"
          onClick={() => setType('vaccine')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition",
            type === 'vaccine' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Syringe size={16} />
          Vacina
        </button>
        <button 
          type="button"
          onClick={() => setType('exam')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition",
            type === 'exam' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FlaskConical size={16} />
          Exame
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} />
              Data do Procedimento
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              {type === 'vaccine' ? <Syringe size={14} /> : <FlaskConical size={14} />}
              {type === 'vaccine' ? 'Selecione a Vacina' : 'Selecione o Exame'}
            </label>
            <select 
              value={selectedStandardId} 
              onChange={(e) => setSelectedStandardId(e.target.value)}
              required
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="">Escolha uma opção...</option>
              {standards.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Weight size={14} />
              Peso Atual (kg)
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                value={weight} 
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ex: 12.5"
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User size={14} />
              Profissional Responsável
            </label>
            <input 
              type="text" 
              value={professionalName} 
              onChange={(e) => setProfessionalName(e.target.value)}
              placeholder="Nome do veterinário"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500" />
              Alergias
            </label>
            <input 
              type="text" 
              value={allergies} 
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Ex: Penicilina, Frango"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Pill size={14} className="text-blue-500" />
              Medicamentos em Uso
            </label>
            <input 
              type="text" 
              value={medications} 
              onChange={(e) => setMedications(e.target.value)}
              placeholder="Ex: Apoquel 5.4mg"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <ClipboardList size={14} />
            Observações Adicionais
          </label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguma observação importante sobre este registro?"
            className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            rows={3}
          />
        </div>

        <Button 
          type="submit"
          className="w-full h-12 text-base font-bold gradient-bg shadow-md hover:shadow-lg transition-all rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            'Confirmar Registro Médico'
          )}
        </Button>
      </form>
    </div>
  );
};
