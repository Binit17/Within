import { Heart, Moon, Footprints, Activity, Wifi } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const devices = [
  { name: "Apple Watch", emoji: "⌚", connected: true },
  { name: "Oura Ring", emoji: "💍", connected: true },
  { name: "iPhone Health", emoji: "📱", connected: true },
];

interface Vital {
  icon: typeof Heart;
  label: string;
  baseValue: number;
  unit: string;
  color: string;
  source: string;
  format: (v: number) => string;
  max: number;
}

const vitalsConfig: Vital[] = [
  { icon: Heart, label: "Heart Rate", baseValue: 72, unit: "bpm", color: "hsl(var(--coral))", source: "⌚", format: v => `${v}`, max: 120 },
  { icon: Moon, label: "Sleep", baseValue: 5.2, unit: "hrs", color: "hsl(var(--lavender))", source: "💍", format: v => `${v.toFixed(1)}`, max: 9 },
  { icon: Footprints, label: "Steps", baseValue: 3421, unit: "", color: "hsl(var(--mint-deep))", source: "📱", format: v => v.toLocaleString(), max: 10000 },
  { icon: Activity, label: "Blood O₂", baseValue: 97, unit: "%", color: "hsl(var(--sky-deep))", source: "⌚", format: v => `${v}`, max: 100 },
];

export function VitalsGrid() {
  const [values, setValues] = useState(vitalsConfig.map(v => v.baseValue));

  useEffect(() => {
    const interval = setInterval(() => {
      setValues(prev => prev.map((v, i) => {
        if (i === 0) return 68 + Math.floor(Math.random() * 10);
        if (i === 1) return v;
        if (i === 2) return Math.min(10000, v + Math.floor(Math.random() * 50));
        if (i === 3) return 95 + Math.floor(Math.random() * 4);
        return v;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Connected devices row */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
        <Wifi className="w-3 h-3 text-success flex-shrink-0" />
        {devices.map(d => (
          <div key={d.name} className="flex items-center gap-1 bg-card rounded-full px-2 py-0.5 flex-shrink-0 shadow-card">
            <span className="text-[10px]">{d.emoji}</span>
            <span className="text-[9px] text-foreground font-semibold">{d.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {vitalsConfig.map(({ icon: Icon, label, unit, color, source, format, max }, i) => {
          const pct = (values[i] / max) * 100;
          const circumference = 2 * Math.PI * 20;
          const offset = circumference - (circumference * Math.min(pct, 100)) / 100;

          return (
            <div key={label} className="rounded-2xl bg-card p-3 shadow-card relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-success animate-pulse-soft" />
                <span className="text-[7px] text-success font-semibold">LIVE</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Mini ring chart */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                    <motion.circle
                      cx="24" cy="24" r="20"
                      fill="none"
                      stroke={color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <Icon className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color }} />
                </div>

                <div>
                  <motion.p key={values[i]} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-lg font-bold text-foreground leading-none">
                    {format(values[i])}
                    <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>
                  </motion.p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                  <p className="text-[8px] text-muted-foreground/60">{source}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
