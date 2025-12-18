import { Briefcase, BadgeCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfessionalBadgeProps {
  isProfessional: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const ProfessionalBadge = ({
  isProfessional,
  size = "md",
  showText = true,
  className,
}: ProfessionalBadgeProps) => {
  if (!isProfessional) return null;

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/30 shadow-sm",
        className
      )}
    >
      <div className={cn("flex items-center justify-center rounded-full bg-secondary/20", sizeClasses[size])}>
        <Briefcase className={cn("text-secondary", {
          "w-3 h-3": size === "sm",
          "w-4 h-4": size === "md",
          "w-5 h-5": size === "lg",
        })} />
      </div>
      {showText && (
        <span className={cn("font-semibold text-secondary-foreground", textSizeClasses[size])}>
          Profissional
        </span>
      )}
      <BadgeCheck className={cn("text-secondary", {
        "w-3 h-3": size === "sm",
        "w-4 h-4": size === "md",
        "w-5 h-5": size === "lg",
      })} />
    </div>
  );
};

export const ProfessionalBadgeSmall = ({ isProfessional }: { isProfessional: boolean }) => {
  if (!isProfessional) return null;

  return (
    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary/20 border border-secondary/40 text-secondary font-bold text-xs">
      P
    </div>
  );
};

// Selo de verificação profissional - Versão compacta com ícone
export const ProfessionalVerifiedBadge = ({ 
  isProfessional, 
  size = "md",
  variant = "default" 
}: { 
  isProfessional: boolean; 
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal";
}) => {
  if (!isProfessional) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (variant === "minimal") {
    return (
      <BadgeCheck 
        className={cn(
          "text-secondary fill-secondary/20",
          sizeClasses[size]
        )} 
      />
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/30">
      <BadgeCheck className={cn("text-secondary", sizeClasses[size])} />
      <span className="text-xs font-semibold text-secondary">Verificado</span>
    </div>
  );
};
