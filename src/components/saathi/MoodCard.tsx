import { motion } from "framer-motion";

const moods = [
  { emoji: "😌", label: "Calm", value: 15, color: "hsl(var(--success))" },
  { emoji: "😟", label: "Anxious", value: 62, color: "hsl(var(--warning))" },
  { emoji: "😤", label: "Frustrated", value: 45, color: "hsl(var(--coral))" },
  { emoji: "😔", label: "Sad", value: 30, color: "hsl(var(--sky))" },
];

export function MoodCard() {
  const dominant = moods.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Today's Mood</h3>
        <span className="text-xs text-muted-foreground">Dominant: {dominant.label}</span>
      </div>

      {/* Radial mood display */}
      <div className="flex items-center justify-center gap-6">
        {moods.map((m, i) => {
          const size = 36 + (m.value / 100) * 28;
          return (
            <motion.div
              key={m.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="rounded-full flex items-center justify-center shadow-card"
                style={{
                  width: size,
                  height: size,
                  background: `${m.color}20`,
                  border: `2px solid ${m.color}`,
                }}
              >
                <span style={{ fontSize: size * 0.45 }}>{m.emoji}</span>
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground">{m.label}</span>
              <span className="text-[10px] font-bold text-foreground">{m.value}%</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
