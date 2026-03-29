import { motion } from "framer-motion";

const emotions = [
  { name: "Anxious", percent: 32, color: "hsl(var(--warning))" },
  { name: "Stressed", percent: 28, color: "hsl(var(--destructive))" },
  { name: "Calm", percent: 18, color: "hsl(var(--success))" },
  { name: "Hopeful", percent: 12, color: "hsl(var(--primary))" },
  { name: "Sad", percent: 10, color: "hsl(var(--sky))" },
];

export function EmotionDistribution() {
  // Donut chart
  const total = emotions.reduce((a, b) => a + b.percent, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">Emotion Distribution</h3>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            {emotions.map((e, i) => {
              const dashLength = (e.percent / total) * circumference;
              const dashOffset = -(accumulated / total) * circumference;
              accumulated += e.percent;

              return (
                <motion.circle
                  key={e.name}
                  cx="70" cy="70" r={radius}
                  fill="none"
                  stroke={e.color}
                  strokeWidth="16"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground">5</span>
            <span className="text-[9px] text-muted-foreground">emotions</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {emotions.map((e, i) => (
            <motion.div
              key={e.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: e.color }} />
              <span className="text-[11px] text-foreground flex-1">{e.name}</span>
              <span className="text-[11px] font-bold text-foreground">{e.percent}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
