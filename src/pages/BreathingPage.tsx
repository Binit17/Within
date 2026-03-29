import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGamification } from "@/hooks/useGamification";

type Phase = "inhale" | "hold1" | "exhale" | "hold2";

const phases: { name: Phase; label: string; duration: number }[] = [
  { name: "inhale", label: "Inhale", duration: 4 },
  { name: "hold1", label: "Hold", duration: 4 },
  { name: "exhale", label: "Exhale", duration: 4 },
  { name: "hold2", label: "Hold", duration: 4 },
];

const BreathingPage = () => {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { completeSession, addXp } = useGamification();
  const navigate = useNavigate();

  const currentPhase = phases[phaseIndex];

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setPhaseIndex(pi => {
            const next = (pi + 1) % 4;
            if (next === 0) setCycles(c => c + 1);
            return next;
          });
          return phases[(phaseIndex + 1) % 4].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isActive, phaseIndex]);

  const handleStop = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    if (cycles > 0) {
      completeSession();
      addXp(20);
    }
  };

  const circleScale = currentPhase.name === "inhale" ? 1.4
    : currentPhase.name === "exhale" ? 1
    : currentPhase.name === "hold1" ? 1.4 : 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-5">
      <div className="fixed top-0 left-0 right-0 dhaka-stripe" />

      <h1 className="text-xl font-bold text-foreground mb-2">Box Breathing</h1>
      <p className="text-sm text-muted-foreground mb-10">4-4-4-4 breathing pattern</p>

      {/* Breathing Circle */}
      <div className="relative mb-10">
        <motion.div
          animate={isActive ? { scale: circleScale } : { scale: 1 }}
          transition={{ duration: currentPhase?.duration || 4, ease: "easeInOut" }}
          className="w-48 h-48 rounded-full border-2 border-primary/30 flex items-center justify-center"
          style={{ background: "radial-gradient(circle, hsl(252 95% 68% / 0.15), transparent)" }}
        >
          <motion.div
            animate={isActive ? { scale: circleScale } : { scale: 1 }}
            transition={{ duration: currentPhase?.duration || 4, ease: "easeInOut" }}
            className="w-32 h-32 rounded-full gradient-purple flex items-center justify-center shadow-purple"
          >
            <span className="text-4xl font-bold text-primary-foreground">
              {isActive ? countdown : "▶"}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Phase label */}
      <motion.p
        key={phaseIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold text-primary mb-2"
      >
        {isActive ? currentPhase.label : "Ready?"}
      </motion.p>

      {isActive && (
        <p className="text-xs text-muted-foreground mb-6">Cycle {cycles + 1} • {currentPhase.label}</p>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isActive ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setIsActive(true); setPhaseIndex(0); setCountdown(4); setCycles(0); }}
            className="px-10 py-3 rounded-xl gradient-purple text-primary-foreground font-semibold"
          >
            Start
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            className="px-10 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold"
          >
            Stop
          </motion.button>
        )}
      </div>

      {cycles > 0 && !isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-success font-semibold">✨ {cycles} cycles completed! +{cycles * 20} XP</p>
          <button onClick={() => navigate("/")} className="text-xs text-primary mt-2 underline">Back home</button>
        </motion.div>
      )}
    </div>
  );
};

export default BreathingPage;
