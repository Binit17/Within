import { useCycle } from "@/hooks/useCycle";

const phaseColors: Record<string, string> = {
  purple: "bg-primary/20 border-primary/30",
  green: "bg-success/20 border-success/30",
  amber: "bg-warning/20 border-warning/30",
  red: "bg-destructive/20 border-destructive/30",
};

export function CycleCard() {
  const { currentPhase, skipCycle } = useCycle();
  if (!currentPhase) return null;

  return (
    <div className={`rounded-2xl p-4 shadow-card border ${phaseColors[currentPhase.color] || "bg-card border-border"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentPhase.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{currentPhase.name} Phase</h3>
            <p className="text-xs text-muted-foreground">{currentPhase.headline}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded-full">
          Day {currentPhase.day}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{currentPhase.body}</p>
      <p className="text-[10px] text-accent-foreground mt-2">💡 {currentPhase.workTip}</p>
      <button
        onClick={() => skipCycle()}
        className="mt-3 w-full py-1.5 rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground hover:bg-secondary transition-colors"
      >
        Reset / Disable Cycle Tracking
      </button>
    </div>
  );
}
