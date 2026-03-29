import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const distortions = [
  { name: "Catastrophizing", count: 8, max: 12, color: "hsl(var(--destructive))" },
  { name: "All-or-Nothing", count: 6, max: 12, color: "hsl(var(--warning))" },
  { name: "Mind Reading", count: 5, max: 12, color: "hsl(var(--primary))" },
  { name: "Overgeneralization", count: 4, max: 12, color: "hsl(var(--coral))" },
  { name: "Emotional Reasoning", count: 3, max: 12, color: "hsl(var(--lavender))" },
];

export function CBTBreakdown() {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">CBT Cognitive Distortions</h3>
      </div>
      <p className="text-[10px] text-muted-foreground mb-4">Detected in journal entries this week</p>

      {/* Radar-like radial layout */}
      <div className="relative w-44 h-44 mx-auto mb-4">
        <svg viewBox="0 0 160 160" className="w-full h-full">
          {/* Background rings */}
          {[30, 50, 70].map(r => (
            <circle key={r} cx="80" cy="80" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
          ))}

          {/* Data arcs */}
          {distortions.map((d, i) => {
            const angle = (i / distortions.length) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const radius = (d.count / d.max) * 65 + 10;
            const x = 80 + Math.cos(rad) * radius;
            const y = 80 + Math.sin(rad) * radius;
            const labelR = 75;
            const lx = 80 + Math.cos(rad) * labelR;
            const ly = 80 + Math.sin(rad) * labelR;

            return (
              <g key={d.name}>
                <motion.line
                  x1="80" y1="80" x2={x} y2={y}
                  stroke={d.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ x2: 80, y2: 80 }}
                  animate={{ x2: x, y2: y }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                />
                <motion.circle
                  cx={x} cy={y} r="5"
                  fill={d.color}
                  initial={{ r: 0 }}
                  animate={{ r: 5 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.15 }}
                />
                <text
                  x={lx} y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="5.5"
                  fill="hsl(var(--muted-foreground))"
                >
                  {d.name}
                </text>
              </g>
            );
          })}

          {/* Center */}
          <circle cx="80" cy="80" r="12" fill="hsl(var(--primary))" opacity="0.15" />
          <text x="80" y="82" textAnchor="middle" fontSize="8" fill="hsl(var(--primary))" fontWeight="bold">CBT</text>
        </svg>
      </div>

      {/* Legend chips */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {distortions.map(d => (
          <div key={d.name} className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/60">
            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-[9px] text-foreground font-semibold">{d.count}×</span>
          </div>
        ))}
      </div>
    </div>
  );
}
