import { Video, Mic, Type } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <h3 className="text-sm font-semibold text-foreground mb-3">Quick Check-In</h3>
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Video, label: "Video", color: "gradient-purple" },
          { icon: Mic, label: "Audio", color: "gradient-amber" },
          { icon: Type, label: "Text", color: "gradient-success" },
        ].map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            onClick={() => navigate("/journal")}
            className={`${color} rounded-xl p-3 flex flex-col items-center gap-2 text-primary-foreground hover:opacity-90 transition-opacity`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
