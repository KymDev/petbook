import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthDashboard } from './HealthDashboard';
import { HealthQRCode } from './HealthQRCode';
import { HealthRecordForm } from './HealthRecordForm';
import { QrCode, PlusCircle, History, ClipboardList, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";

export const HealthSection: React.FC<{ petId: string }> = ({ petId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'timeline' | 'qrcode' | 'add'>('timeline');

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Navegação Interna da Seção de Saúde */}
      <div className="flex bg-muted p-1 rounded-xl mb-6 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition whitespace-nowrap",
            activeTab === 'timeline' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ClipboardList size={18} />
          Prontuário
        </button>
        <button 
          onClick={() => setActiveTab('qrcode')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition whitespace-nowrap",
            activeTab === 'qrcode' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <QrCode size={18} />
          QR Code
        </button>
        <button 
          onClick={() => setActiveTab('add')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition whitespace-nowrap",
            activeTab === 'add' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PlusCircle size={18} />
          Novo Registro
        </button>
        <button 
          onClick={() => {
            // Abre o prontuário de saúde (HealthRecordsPage)
            navigate(`/pets/${petId}/saude`);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition whitespace-nowrap text-muted-foreground hover:text-foreground"
        >
          <FileText size={18} />
          Ficha de Saúde
        </button>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'timeline' && <HealthDashboard petId={petId} />}
        {activeTab === 'qrcode' && (
          <div className="flex flex-col items-center">
            <HealthQRCode petId={petId} />
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm">
              <strong>Dica:</strong> Use este QR Code em consultas. O veterinário terá acesso instantâneo ao histórico médico do seu pet sem precisar de login.
            </div>
          </div>
        )}
        {activeTab === 'add' && (
          <div className="bg-card p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4">Adicionar Registro Médico</h3>
            <HealthRecordForm petId={petId} onSave={() => setActiveTab('timeline')} />
          </div>
        )}
      </div>
    </div>
  );
};
