import React from 'react';
import { HeartPulse } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from 'react-router-dom';

interface GuardianPetHeaderProps {
  petName: string;
}

export const GuardianPetHeader: React.FC<GuardianPetHeaderProps> = ({ petName }) => {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  return (
    <div className="w-full bg-white p-4 border-b flex justify-between items-center sticky top-14 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">{petName}</h1>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={() => navigate(`/pet/${petId}/health`)}
          variant="outline"
          className="flex items-center gap-2 bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700 rounded-full font-semibold transition-colors"
        >
          <HeartPulse size={20} />
          <span>Saúde</span>
        </Button>
      </div>
    </div>
  );
};
