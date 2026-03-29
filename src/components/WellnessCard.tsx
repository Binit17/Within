import { ReactNode } from "react";

interface WellnessCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  color: string;
  className?: string;
}

export function WellnessCard({ icon, label, value, sublabel, color, className = "" }: WellnessCardProps) {
  return (
    <div className={`rounded-2xl p-4 shadow-card ${color} ${className} transition-transform hover:scale-[1.03] duration-200`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {sublabel && <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>}
    </div>
  );
}
