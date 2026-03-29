import { motion } from "framer-motion";

const stats = [
  { label: "Check-ins", value: "12", emoji: "📝", color: "bg-primary/10" },
  { label: "Avg Mood", value: "56", emoji: "😐", color: "bg-warning/10" },
  { label: "Avg HRV", value: "45ms", emoji: "💓", color: "bg-coral/10" },
  { label: "Streak", value: "4 days", emoji: "🔥", color: "bg-success/10" },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`rounded-xl ${s.color} p-3 shadow-card text-center`}
        >
          <span className="text-lg">{s.emoji}</span>
          <p className="text-sm font-bold text-foreground mt-1">{s.value}</p>
          <p className="text-[9px] text-muted-foreground">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
