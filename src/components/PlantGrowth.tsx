import { useGamification } from "@/hooks/useGamification";
import { Droplets, Flame, Sparkles } from "lucide-react";

export function PlantGrowth({ className = "" }: { className?: string }) {
  const { plantEmoji, plantLabel, plantStage, streak, totalCheckins, justWatered, xp, completeCheckin, lastCheckinDate } = useGamification();

  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = lastCheckinDate === today;

  const progressToNext = plantStage < 4 ? ((totalCheckins % 3) / 3) * 100 : 100;

  return (
    <div className={`rounded-2xl bg-card p-5 shadow-card relative overflow-hidden ${className}`}>
      {/* Watering animation */}
      {justWatered && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center animate-bounce-in">
          <div className="text-6xl opacity-60">💧</div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <h3 className="font-bold text-sm">My Plant</h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-primary">
          <Sparkles className="w-3 h-3" /> {xp} XP
        </div>
      </div>

      {/* Plant display */}
      <div className="flex items-end justify-center gap-6 mb-4">
        <div className="text-center">
          <div className={`text-6xl transition-all duration-700 ${justWatered ? "animate-wiggle" : "animate-float"}`}>
            {plantEmoji}
          </div>
          <p className="text-xs font-semibold text-foreground mt-2">{plantLabel}</p>
          <p className="text-[10px] text-muted-foreground">Stage {plantStage + 1}/5</p>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Flame className="w-3.5 h-3.5 text-coral" />
            <span className="font-bold">{streak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Droplets className="w-3.5 h-3.5 text-sky-deep" />
            <span className="font-bold">{totalCheckins}</span>
            <span className="text-muted-foreground">check-ins</span>
          </div>
        </div>
      </div>

      {/* Progress bar to next stage */}
      {plantStage < 4 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Next stage</span>
            <span>{totalCheckins % 3}/3 check-ins</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-mint-deep transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}

      {/* Check-in button */}
      <button
        onClick={completeCheckin}
        disabled={checkedInToday}
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
          checkedInToday
            ? "bg-mint/30 text-mint-deep cursor-default"
            : "gradient-buddy text-primary-foreground hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {checkedInToday ? "✅ Checked in today!" : "🌧️ Water your plant (Check in)"}
      </button>
    </div>
  );
}
