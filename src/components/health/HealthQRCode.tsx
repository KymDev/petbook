import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Necessário instalar: pnpm add qrcode.react

export const HealthQRCode: React.FC<{ petId: string }> = ({ petId }) => {
  // URL que aponta para a visualização pública/temporária do prontuário
  const shareUrl = `${window.location.origin}/pet/${petId}/health`;

  return (
    <div className="flex flex-col items-center p-6 bg-white border-2 border-dashed border-blue-200 rounded-2xl">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Acesso Rápido Veterinário</h3>
      <div className="bg-white p-4 rounded-xl shadow-md">
        <QRCodeSVG 
          value={shareUrl} 
          size={200}
          level={"H"}
          includeMargin={true}
        />
      </div>
      <p className="mt-4 text-sm text-gray-500 text-center">
        Apresente este QR Code ao veterinário para liberar acesso temporário ao histórico médico.
      </p>
      <button 
        onClick={() => window.print()}
        className="mt-4 text-blue-600 font-medium hover:underline"
      >
        Imprimir Cartão de Saúde
      </button>
    </div>
  );
};
