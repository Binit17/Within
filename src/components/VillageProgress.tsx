import { useGamification } from "@/hooks/useGamification";

const VILLAGE_EMOJIS = [
  "🏕️", "🛖", "🏠", "🏡", "🏘️", "🏗️", "🏢", "🏪", "🏫", "🏥",
  "🏦", "🏨", "🏩", "🏰", "🏯", "🎪", "🗼", "🌆", "🌇", "🌃",
];
const VILLAGE_LABELS = [
  "Campsite", "Hut", "Cottage", "Garden Home", "Small Village", "Under Construction",
  "Office", "Shop", "School", "Hospital", "Bank", "Hotel", "Chapel", "Castle",
  "Palace", "Festival", "Tower", "Downtown", "Sunset City", "Metropolis",
];

export function VillageProgress({ className = "" }: { className?: string }) {
  const { villageLevel, totalSessions } = useGamification();
  const nextLevelSessions = villageLevel * 5;
  const progress = ((totalSessions % 5) / 5) * 100;

  return (
    <div className={`rounded-2xl bg-card p-4 shadow-card ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span>🏘️</span> Village
        </h3>
        <span className="text-[10px] font-semibold text-muted-foreground">Lvl {villageLevel}/20</span>
      </div>

      {/* Village display */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-4xl">{VILLAGE_EMOJIS[villageLevel - 1]}</div>
        <div>
          <p className="font-semibold text-sm">{VILLAGE_LABELS[villageLevel - 1]}</p>
          <p className="text-[10px] text-muted-foreground">{totalSessions} sessions completed</p>
        </div>
      </div>

      {/* Level progress */}
      {villageLevel < 20 && (
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Next: {VILLAGE_LABELS[villageLevel]}</span>
            <span>{totalSessions % 5}/5</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-lavender-deep transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
