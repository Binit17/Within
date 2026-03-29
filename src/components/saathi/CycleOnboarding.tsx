import { useState } from "react";
import { motion } from "framer-motion";
import { useCycle } from "@/hooks/useCycle";
import { X } from "lucide-react";

export function CycleOnboarding({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"intro" | "setup">("intro");
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const { enableCycle, skipCycle } = useCycle();

  const handleEnable = () => {
    if (lastPeriod) {
      enableCycle(lastPeriod, cycleLength);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-5"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-card border border-border"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground">
          <X className="w-5 h-5" />
        </button>

        {step === "intro" ? (
          <>
            <div className="text-center mb-6">
              <span className="text-4xl mb-3 block">🌙</span>
              <h2 className="text-lg font-bold text-foreground">Cycle-Aware Insights</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Would you like Saathi to provide cycle-aware insights?
                This works for tracking your own cycle or supporting someone else's.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setStep("setup")}
                className="w-full py-3 rounded-xl gradient-purple text-primary-foreground font-semibold text-sm"
              >
                Yes, enable
              </button>
              <button
                onClick={() => { skipCycle(); onClose(); }}
                className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm"
              >
                Skip for now
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-foreground mb-4">Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Last period start date</label>
                <input
                  type="date"
                  value={lastPeriod}
                  onChange={e => setLastPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm outline-none border border-border focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">
                  Cycle length: <span className="text-primary">{cycleLength} days</span>
                </label>
                <input
                  type="range"
                  min={21}
                  max={40}
                  value={cycleLength}
                  onChange={e => setCycleLength(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>21</span>
                  <span>40</span>
                </div>
              </div>
              <button
                onClick={handleEnable}
                disabled={!lastPeriod}
                className="w-full py-3 rounded-xl gradient-purple text-primary-foreground font-semibold text-sm disabled:opacity-40"
              >
                Save & Enable
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
