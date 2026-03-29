import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export function HRVCard() {
  const hrv = 42;
  const baseline = 58;
  const percentage = (hrv / baseline) * 100;
  const angle = (percentage / 100) * 180;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-destructive" />
        <h3 className="text-sm font-semibold text-foreground">Heart Rate Variability</h3>
      </div>

      <div className="flex items-center gap-5">
        {/* Semicircle gauge */}
        <div className="relative w-24 h-14 flex-shrink-0">
          <svg viewBox="0 0 100 55" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <motion.path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="141.37"
              initial={{ strokeDashoffset: 141.37 }}
              animate={{ strokeDashoffset: 141.37 - (141.37 * angle) / 180 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            {/* Center value */}
            <text x="50" y="48" textAnchor="middle" className="text-sm font-bold fill-foreground" fontSize="18">
              {hrv}
            </text>
            <text x="50" y="54" textAnchor="middle" className="fill-muted-foreground" fontSize="7">
              ms
            </text>
          </svg>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Baseline:</span>
            <span className="text-foreground font-semibold">{baseline}ms</span>
            <span className="text-destructive font-semibold">↓ {Math.round(((baseline - hrv) / baseline) * 100)}%</span>
          </div>
          <p className="text-[10px] text-destructive">Below baseline — elevated stress</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success" /> Apple Watch
            <span className="w-2 h-2 rounded-full bg-primary" /> Oura Ring
          </div>
        </div>
      </div>
    </div>
  );
}
