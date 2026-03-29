import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle } from "lucide-react";

const factors = [
  { label: "HRV Decline", weight: "30%", value: 82, emoji: "💓" },
  { label: "Mood Decline", weight: "30%", value: 68, emoji: "😔" },
  { label: "Event Pressure", weight: "25%", value: 75, emoji: "📅" },
  { label: "Cycle Phase", weight: "15%", value: 55, emoji: "🌙" },
];

function getScoreColor(score: number): string {
  if (score >= 70) return "hsl(var(--destructive))";
  if (score >= 40) return "hsl(var(--warning))";
  return "hsl(var(--success))";
}

export function BurnoutGauge({ score }: { score: number }) {
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (circumference * score) / 100;

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-destructive" />
          <h3 className="font-bold text-foreground">Predictive Burnout Score</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-destructive font-semibold">
          <TrendingUp className="w-3 h-3" /> Trending up
        </div>
      </div>

      {/* Donut gauge */}
      <div className="relative w-40 h-40 mx-auto mb-4">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
          <motion.circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-black"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/100</span>
          <span className="text-[10px] font-semibold text-destructive mt-0.5">High Risk</span>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
        <p className="text-xs text-destructive">
          ⚠️ Est. 4 days to critical threshold
        </p>
      </div>

      {/* Factor chips instead of bars */}
      <div className="grid grid-cols-2 gap-2">
        {factors.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="rounded-xl bg-secondary/50 p-3 flex items-center gap-2"
          >
            <span className="text-lg">{f.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-foreground truncate">{f.label}</p>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold" style={{ color: getScoreColor(f.value) }}>{f.value}%</span>
                <span className="text-[9px] text-muted-foreground">({f.weight})</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
