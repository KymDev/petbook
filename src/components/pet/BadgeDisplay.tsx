import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PawPrint, Star, CalendarCheck } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type BadgeType = Database["public"]["Enums"]["badge_type"];

interface BadgeDisplayProps {
  badgeType: BadgeType;
}

const badgeMap: Record<BadgeType, { icon: React.ReactNode; label: string; description: string }> = {
  primeiro_dia: {
    icon: <PawPrint className="h-3 w-3" />,
    label: "Primeiro Dia",
    description: "Concedido por publicar o primeiro story do pet.",
  },
  pet_ativo: {
    icon: <CalendarCheck className="h-3 w-3" />,
    label: "Pet Ativo",
    description: "Concedido por ter atividade em 3 dias consecutivos.",
  },
  pet_em_destaque: {
    icon: <Star className="h-3 w-3" />,
    label: "Pet em Destaque",
    description: "Concedido por ter 5 ou mais visualizações em stories.",
  },
};

export function BadgeDisplay({ badgeType }: BadgeDisplayProps) {
  const badgeInfo = badgeMap[badgeType];

  if (!badgeInfo) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="flex items-center gap-1 cursor-default">
            {badgeInfo.icon}
            {badgeInfo.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{badgeInfo.label}</p>
          <p className="text-sm text-muted-foreground">{badgeInfo.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
