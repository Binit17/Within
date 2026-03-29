import { motion } from "framer-motion";

export function StressMeter({ score = 68, className = "" }: { score?: number; className?: string }) {
  const emoji = score < 25 ? "😌" : score < 50 ? "🙂" : score < 75 ? "😰" : "😫";
  const label = score < 25 ? "Calm" : score < 50 ? "Mild" : score < 75 ? "Stressed" : "High Stress";
  const color = score < 25 ? "hsl(var(--success))" : score < 50 ? "hsl(var(--warning))" : score < 75 ? "hsl(var(--coral))" : "hsl(var(--destructive))";
  const angle = (score / 100) * 180;

  return (
    <div className={`rounded-2xl bg-card p-4 shadow-card ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-foreground">Stress Level</span>
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Gauge */}
        <div className="relative w-28 h-16 flex-shrink-0">
          <svg viewBox="0 0 100 55" className="w-full h-full">
            <defs>
              <linearGradient id="stressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--success))" />
                <stop offset="50%" stopColor="hsl(var(--warning))" />
                <stop offset="100%" stopColor="hsl(var(--destructive))" />
              </linearGradient>
            </defs>
            <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeLinecap="round" />
            <motion.path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="url(#stressGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="141.37"
              initial={{ strokeDashoffset: 141.37 }}
              animate={{ strokeDashoffset: 141.37 - (141.37 * angle) / 180 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <text x="50" y="42" textAnchor="middle" fontSize="20" className="font-bold fill-foreground">{score}</text>
            <text x="50" y="53" textAnchor="middle" fontSize="7" className="fill-muted-foreground">/100</text>
          </svg>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <span className="text-4xl mb-1">{emoji}</span>
          <span className="text-[10px] text-muted-foreground">Based on vitals + journal</span>
        </div>
      </div>
    </div>
  );
}
