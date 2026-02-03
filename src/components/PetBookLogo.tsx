import { cn } from "@/lib/utils";

interface PetBookLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const PetBookLogo = ({ className, size = "md" }: PetBookLogoProps) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/favicon.ico" 
        alt="PetBook Logo" 
        className={cn(sizes[size], "flex-shrink-0 object-contain")}
      />
      <div className="flex flex-col">
        <span className="font-heading font-bold text-xl gradient-text">PetBook</span>
        {size !== "sm" && (
          <span className="text-xs text-muted-foreground">A rede social do seu melhor amigo</span>
        )}
      </div>
    </div>
  );
};
