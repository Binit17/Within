import { useGamification } from "@/hooks/useGamification";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, RotateCcw } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const PLANT_STAGES = [
  { emoji: "🌱", label: "Seedling", height: 20 },
  { emoji: "🌿", label: "Sprout", height: 35 },
  { emoji: "🪴", label: "Growing", height: 50 },
  { emoji: "🌸", label: "Flowering", height: 65 },
  { emoji: "🌳", label: "Thriving", height: 80 },
];

export function PlantCard() {
  const { plantStage, streak, totalCheckins, justWatered, waterPlant, xp } = useGamification();
  const [isWatering, setIsWatering] = useState(false);
  const [waterDrops, setWaterDrops] = useState<number[]>([]);
  const [showSparkles, setShowSparkles] = useState(false);
  const [prevStage, setPrevStage] = useState(plantStage);
  const [stageUpgrade, setStageUpgrade] = useState(false);

  const stage = PLANT_STAGES[Math.min(plantStage, 4)];
  const progressToNext = plantStage < 4 ? ((totalCheckins % 2) / 2) * 100 : 100;
  const isFullyGrown = plantStage >= 4;

  // Detect stage change
  useEffect(() => {
    if (plantStage > prevStage) {
      setStageUpgrade(true);
      setTimeout(() => setStageUpgrade(false), 2000);
    }
    setPrevStage(plantStage);
  }, [plantStage, prevStage]);

  const handleWater = useCallback(() => {
    if (isWatering) return;

    // Rain animation
    setIsWatering(true);
    setWaterDrops(Array.from({ length: 12 }, (_, i) => i));

    // After drops land, grow
    setTimeout(() => {
      waterPlant();
      setShowSparkles(true);
    }, 900);

    setTimeout(() => {
      setIsWatering(false);
      setWaterDrops([]);
      setShowSparkles(false);
    }, 3000);
  }, [isWatering, waterPlant]);

  const handleReset = () => {
    localStorage.removeItem("saathi-gamification");
    window.location.reload();
  };

  return (
    <div className="rounded-2xl bg-card shadow-card relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <h3 className="font-bold text-sm text-foreground">My Garden</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
            <Sparkles className="w-3 h-3" /> {xp} XP
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-coral">
            <Flame className="w-3 h-3" /> {streak}
          </div>
          <button onClick={handleReset} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors" title="Reset demo">
            <RotateCcw className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Plant Scene */}
      <div className="relative mx-4 mt-2 rounded-2xl overflow-hidden" style={{ height: 200 }}>
        {/* Sky */}
        <div className="absolute inset-0" style={{ 
          background: "linear-gradient(180deg, hsl(200 70% 85%) 0%, hsl(190 50% 88%) 40%, hsl(120 30% 82%) 100%)" 
        }}>
          {/* Sun */}
          <motion.div
            className="absolute top-3 right-5 w-10 h-10 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(45 100% 72%), hsl(38 95% 58%))", boxShadow: "0 0 20px hsl(45 100% 72% / 0.4)" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          {/* Clouds */}
          <motion.div className="absolute top-4 left-4 text-xl opacity-50" animate={{ x: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity }}>☁️</motion.div>
          <motion.div className="absolute top-2 left-24 text-sm opacity-35" animate={{ x: [0, -5, 0] }} transition={{ duration: 8, repeat: Infinity }}>☁️</motion.div>
        </div>

        {/* Rain drops */}
        <AnimatePresence>
          {waterDrops.map((d) => (
            <motion.div
              key={`drop-${d}-${Date.now()}`}
              initial={{ y: -15, x: 20 + d * 22 + Math.random() * 10, opacity: 1, scale: 0.8 }}
              animate={{ y: 160, opacity: 0.2, scale: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 + Math.random() * 0.3, ease: "easeIn", delay: d * 0.05 }}
              className="absolute text-sm pointer-events-none z-20"
            >
              💧
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Growth sparkles */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`spark-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    x: 100 + (Math.random() - 0.5) * 140,
                    y: 60 + (Math.random() - 0.5) * 80,
                  }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.08 }}
                  className="absolute text-sm pointer-events-none z-20"
                >
                  {i % 3 === 0 ? "⭐" : "✨"}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Stage upgrade banner */}
        <AnimatePresence>
          {stageUpgrade && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 10, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-success text-success-foreground text-xs font-extrabold shadow-lg"
            >
              🎉 Stage Up! → {stage.label}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-14" style={{ 
          background: "linear-gradient(180deg, hsl(120 35% 50%) 0%, hsl(120 30% 40%) 60%, hsl(30 35% 45%) 100%)" 
        }}>
          {/* Soil mound */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-8 rounded-t-full" 
            style={{ background: "radial-gradient(ellipse, hsl(25 40% 38%), hsl(25 35% 30%))" }} />
          {/* Grass tufts */}
          <div className="absolute -top-1 left-8 text-sm">🌾</div>
          <div className="absolute -top-1 right-10 text-sm">🌾</div>
        </div>

        {/* Plant */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            key={`plant-${plantStage}`}
            initial={justWatered ? { scale: 0.3, opacity: 0, y: 20 } : { scale: 1 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 10, duration: 0.8 }}
          >
            <motion.div
              className="text-6xl text-center"
              animate={isWatering ? { rotate: [-5, 5, -5, 5, 0] } : { rotate: [-2, 2, -2] }}
              transition={isWatering ? { duration: 0.5 } : { duration: 3, repeat: Infinity }}
            >
              {stage.emoji}
            </motion.div>
          </motion.div>
        </div>

        {/* Ripple effect on soil when watering */}
        <AnimatePresence>
          {isWatering && (
            <>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={`ripple-${i}`}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.2 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full border-2 border-sky/40 z-10"
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Stage indicator */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">{stage.label}</span>
          <span className="text-[10px] text-muted-foreground">Stage {Math.min(plantStage, 4) + 1}/5</span>
        </div>

        {/* Stage dots */}
        <div className="flex gap-1.5 mb-2">
          {PLANT_STAGES.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-2 rounded-full transition-all duration-500 ${
                i <= plantStage ? "bg-success" : "bg-muted"
              }`} />
              <span className={`text-xs ${i <= plantStage ? "" : "grayscale opacity-40"}`}>{s.emoji}</span>
            </div>
          ))}
        </div>

        {/* Progress to next */}
        {!isFullyGrown && (
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Next: {PLANT_STAGES[Math.min(plantStage + 1, 4)].label}</span>
            <span>{totalCheckins % 2}/2 waterings</span>
          </div>
        )}
        {isFullyGrown && (
          <p className="text-[10px] text-success font-semibold text-center">🌳 Fully grown! Your garden is thriving!</p>
        )}
      </div>

      {/* Water Button */}
      <div className="px-4 pb-4 pt-2">
        <motion.button
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleWater}
          disabled={isWatering}
          className={`w-full py-3.5 rounded-2xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            isWatering
              ? "bg-sky/20 text-sky-deep cursor-wait"
              : "gradient-buddy text-primary-foreground shadow-buddy hover:shadow-float"
          }`}
        >
          {isWatering ? (
            <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
              💧 Watering...
            </motion.span>
          ) : (
            <>🌧️ Water Your Plant</>
          )}
        </motion.button>
        <p className="text-[9px] text-muted-foreground text-center mt-1.5">
          Tap to water — watch your plant grow through 5 stages!
        </p>
      </div>
    </div>
  );
}
