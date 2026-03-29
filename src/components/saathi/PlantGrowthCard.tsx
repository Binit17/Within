import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/hooks/useGamification";
import buddyImg from "@/assets/buddy-puppy.png";

// --- SVG Plant Illustrations ---
function SeedlingSVG() {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full">
      {/* Soil */}
      <ellipse cx="50" cy="110" rx="30" ry="6" fill="#8B6914" opacity="0.5" />
      {/* Stem */}
      <path d="M50 110 L50 85" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" />
      {/* Left leaf */}
      <motion.path
        d="M50 90 C40 82, 32 85, 35 78 C38 71, 48 75, 50 85"
        fill="#66BB6A"
        initial={{ rotate: 0 }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{ transformOrigin: "50px 90px" }}
      />
      {/* Right leaf */}
      <motion.path
        d="M50 88 C60 80, 68 83, 65 76 C62 69, 52 73, 50 83"
        fill="#81C784"
        initial={{ rotate: 0 }}
        animate={{ rotate: [2, -2, 2] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ transformOrigin: "50px 88px" }}
      />
    </svg>
  );
}

function SproutSVG() {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full">
      <ellipse cx="50" cy="112" rx="30" ry="6" fill="#8B6914" opacity="0.5" />
      {/* Main stem */}
      <path d="M50 112 L50 65" stroke="#43A047" strokeWidth="3" strokeLinecap="round" />
      {/* Branch left */}
      <path d="M50 85 L38 75" stroke="#43A047" strokeWidth="2" strokeLinecap="round" />
      {/* Branch right */}
      <path d="M50 75 L62 68" stroke="#43A047" strokeWidth="2" strokeLinecap="round" />
      {/* Leaves */}
      {[
        { d: "M50 68 C42 55, 30 58, 34 50 C38 42, 48 50, 50 62", fill: "#66BB6A", delay: 0 },
        { d: "M50 68 C58 55, 70 58, 66 50 C62 42, 52 50, 50 62", fill: "#81C784", delay: 0.3 },
        { d: "M38 75 C28 68, 22 72, 26 64 C30 56, 36 62, 38 72", fill: "#4CAF50", delay: 0.6 },
        { d: "M62 68 C72 61, 78 65, 74 57 C70 49, 64 55, 62 65", fill: "#A5D6A7", delay: 0.9 },
        { d: "M50 82 C40 72, 28 76, 32 68 C36 60, 48 66, 50 78", fill: "#66BB6A", delay: 1.2 },
      ].map((leaf, i) => (
        <motion.path
          key={i}
          d={leaf.d}
          fill={leaf.fill}
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: leaf.delay }}
          style={{ transformOrigin: "50px 70px" }}
        />
      ))}
    </svg>
  );
}

function GrowingPlantSVG() {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full">
      {/* Main stem */}
      <path d="M50 115 L50 40" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
      {/* Branches */}
      <path d="M50 80 L32 68" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 65 L70 55" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 50 L30 42" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" />
      {/* Lush leaves */}
      {[
        { d: "M50 42 C38 25, 20 30, 28 18 C36 6, 48 20, 50 35", fill: "#43A047" },
        { d: "M50 42 C62 25, 80 30, 72 18 C64 6, 52 20, 50 35", fill: "#66BB6A" },
        { d: "M32 68 C18 58, 10 65, 16 54 C22 43, 30 52, 32 64", fill: "#4CAF50" },
        { d: "M70 55 C82 45, 90 52, 84 41 C78 30, 72 40, 70 50", fill: "#81C784" },
        { d: "M30 42 C16 35, 8 42, 14 30 C20 18, 28 28, 30 38", fill: "#66BB6A" },
        { d: "M50 58 C40 45, 25 50, 32 38 C39 26, 48 38, 50 52", fill: "#A5D6A7" },
        { d: "M50 55 C60 42, 75 47, 68 35 C61 23, 52 35, 50 48", fill: "#4CAF50" },
      ].map((leaf, i) => (
        <motion.path
          key={i}
          d={leaf.d}
          fill={leaf.fill}
          animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 2.5 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
          style={{ transformOrigin: "50px 50px" }}
        />
      ))}
    </svg>
  );
}

function FloweringPlantSVG() {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      {/* Stem */}
      <path d="M50 125 L50 35" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 85 L28 72" stroke="#388E3C" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 70 L75 58" stroke="#388E3C" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 55 L25 45" stroke="#388E3C" strokeWidth="3" strokeLinecap="round" />
      {/* Leaves */}
      {[
        { d: "M50 38 C35 18, 15 25, 25 12 C35 -1, 48 15, 50 30", fill: "#43A047" },
        { d: "M50 38 C65 18, 85 25, 75 12 C65 -1, 52 15, 50 30", fill: "#66BB6A" },
        { d: "M28 72 C12 60, 2 68, 10 55 C18 42, 26 56, 28 68", fill: "#4CAF50" },
        { d: "M75 58 C90 46, 98 55, 90 42 C82 29, 77 44, 75 54", fill: "#81C784" },
        { d: "M25 45 C10 38, 2 46, 10 32 C18 18, 23 32, 25 40", fill: "#66BB6A" },
      ].map((leaf, i) => (
        <motion.path
          key={i}
          d={leaf.d}
          fill={leaf.fill}
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 3 + i * 0.2, repeat: Infinity, delay: i * 0.1 }}
          style={{ transformOrigin: "50px 50px" }}
        />
      ))}
      {/* Flowers */}
      {[
        { cx: 50, cy: 22, color: "#F48FB1" },
        { cx: 35, cy: 35, color: "#F8BBD0" },
        { cx: 65, cy: 30, color: "#FFB3C1" },
        { cx: 22, cy: 52, color: "#F48FB1" },
        { cx: 78, cy: 45, color: "#F8BBD0" },
      ].map((flower, i) => (
        <motion.g
          key={`flower-${i}`}
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          style={{ transformOrigin: `${flower.cx}px ${flower.cy}px` }}
        >
          {/* Petals */}
          {[0, 72, 144, 216, 288].map((angle, j) => (
            <ellipse
              key={j}
              cx={flower.cx + Math.cos((angle * Math.PI) / 180) * 5}
              cy={flower.cy + Math.sin((angle * Math.PI) / 180) * 5}
              rx="4"
              ry="6"
              fill={flower.color}
              transform={`rotate(${angle} ${flower.cx} ${flower.cy})`}
              opacity="0.9"
            />
          ))}
          {/* Center */}
          <circle cx={flower.cx} cy={flower.cy} r="3" fill="#FFD54F" />
        </motion.g>
      ))}
    </svg>
  );
}

function ThrivingTreeSVG() {
  return (
    <svg viewBox="0 0 120 140" className="w-full h-full">
      {/* Trunk */}
      <path d="M60 135 L60 60" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
      <path d="M60 90 L40 78" stroke="#6D4C41" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 80 L82 70" stroke="#6D4C41" strokeWidth="3" strokeLinecap="round" />
      {/* Canopy layers */}
      <motion.ellipse cx="60" cy="42" rx="42" ry="32" fill="#388E3C" opacity="0.9"
        animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 4, repeat: Infinity }} style={{ transformOrigin: "60px 42px" }} />
      <motion.ellipse cx="45" cy="35" rx="28" ry="22" fill="#43A047" opacity="0.8"
        animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }} style={{ transformOrigin: "45px 35px" }} />
      <motion.ellipse cx="75" cy="38" rx="25" ry="20" fill="#4CAF50" opacity="0.7"
        animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} style={{ transformOrigin: "75px 38px" }} />
      <motion.ellipse cx="55" cy="28" rx="20" ry="16" fill="#66BB6A" opacity="0.8"
        animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3.8, repeat: Infinity, delay: 0.3 }} style={{ transformOrigin: "55px 28px" }} />
      {/* Flowers at base */}
      {[30, 45, 75, 90].map((x, i) => (
        <motion.g key={`base-flower-${i}`} animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}>
          <circle cx={x} cy={128} r="3" fill={i % 2 === 0 ? "#F48FB1" : "#FFD54F"} />
          <line x1={x} y1={131} x2={x} y2={135} stroke="#4CAF50" strokeWidth="1.5" />
        </motion.g>
      ))}
    </svg>
  );
}

const PLANT_COMPONENTS = [SeedlingSVG, SproutSVG, GrowingPlantSVG, FloweringPlantSVG, ThrivingTreeSVG];
const PLANT_NAMES = ["Tiny Seedling", "Little Sprout", "Growing Strong", "In Full Bloom", "Thriving Tree"];

// --- Dhaka Pattern Pot SVG ---
function DhakaPotSVG() {
  return (
    <svg viewBox="0 0 120 70" className="w-full h-full">
      {/* Pot body */}
      <path d="M20 10 L15 60 Q15 68 30 68 L90 68 Q105 68 105 60 L100 10 Z" fill="#C67B30" />
      {/* Pot rim */}
      <rect x="16" y="6" width="88" height="8" rx="3" fill="#D4883A" />
      {/* Dhaka textile patterns — geometric diagonals */}
      {/* Row 1 — crimson diamonds */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <g key={`diamond-${i}`}>
          <polygon
            points={`${28 + i * 13},25 ${34 + i * 13},18 ${40 + i * 13},25 ${34 + i * 13},32`}
            fill="#DC143C"
            opacity="0.85"
          />
          <polygon
            points={`${34 + i * 13},18 ${36 + i * 13},18 ${42 + i * 13},25 ${36 + i * 13},32`}
            fill="#FFD700"
            opacity="0.5"
          />
        </g>
      ))}
      {/* Row 2 — gold zigzag line */}
      <polyline
        points="22,38 30,32 38,38 46,32 54,38 62,32 70,38 78,32 86,38 94,32 98,38"
        fill="none"
        stroke="#FFD700"
        strokeWidth="2"
        opacity="0.9"
      />
      {/* Row 3 — forest green triangles */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <polygon
          key={`tri-${i}`}
          points={`${24 + i * 11},55 ${30 + i * 11},45 ${36 + i * 11},55`}
          fill="#228B22"
          opacity="0.7"
        />
      ))}
      {/* Additional crimson diagonal stripes */}
      {[0, 1, 2, 3].map(i => (
        <line
          key={`stripe-${i}`}
          x1={25 + i * 22}
          y1={42}
          x2={35 + i * 22}
          y2={52}
          stroke="#DC143C"
          strokeWidth="1.5"
          opacity="0.6"
        />
      ))}
      {/* Pot shadow */}
      <ellipse cx="60" cy="68" rx="38" ry="4" fill="rgba(0,0,0,0.1)" />
    </svg>
  );
}

// --- Watering Can SVG ---
function WateringCanSVG() {
  return (
    <svg viewBox="0 0 80 60" className="w-full h-full">
      {/* Body */}
      <rect x="15" y="18" width="40" height="30" rx="6" fill="#60B8FF" />
      <rect x="15" y="18" width="40" height="8" rx="4" fill="#7CC8FF" />
      {/* Handle */}
      <path d="M45 18 C45 5, 55 5, 55 18" stroke="#4A9FDF" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Spout */}
      <path d="M15 30 L2 22 L0 20" stroke="#4A9FDF" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Spout head */}
      <ellipse cx="0" cy="19" rx="5" ry="4" fill="#60B8FF" />
      {/* Spout holes */}
      {[0, 1, 2].map(i => (
        <circle key={i} cx={-2 + i * 2} cy={18 + (i % 2)} r="0.8" fill="#4A9FDF" />
      ))}
      {/* Shine */}
      <rect x="20" y="22" width="8" height="3" rx="1.5" fill="white" opacity="0.4" />
    </svg>
  );
}

// --- Main Component ---
export function PlantGrowthCard() {
  const { plantStage, totalCheckins, streak, xp, waterPlant } = useGamification();
  const [isWatering, setIsWatering] = useState(false);
  const [showCan, setShowCan] = useState(false);
  const [showDrops, setShowDrops] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showBuddy, setShowBuddy] = useState(false);
  const [prevStage, setPrevStage] = useState(plantStage);
  const [stageChanged, setStageChanged] = useState(false);
  const [plantVivid, setPlantVivid] = useState(false);

  const stageIdx = Math.min(plantStage, 4);
  const PlantSVG = PLANT_COMPONENTS[stageIdx];
  const nextStageIn = plantStage < 4 ? 2 - (totalCheckins % 2) : 0;

  useEffect(() => {
    if (plantStage > prevStage) {
      setStageChanged(true);
      setShowSparkles(true);
      setShowBanner(true);
      setShowBuddy(true);
      setTimeout(() => setShowSparkles(false), 2500);
      setTimeout(() => setShowBanner(false), 3500);
      setTimeout(() => setShowBuddy(false), 4000);
      setTimeout(() => setStageChanged(false), 2000);
    }
    setPrevStage(plantStage);
  }, [plantStage, prevStage]);

  const handleWater = useCallback(() => {
    if (isWatering) return;
    setIsWatering(true);

    // Step 1: Can enters
    setShowCan(true);

    // Step 2: After can hovers, drops fall
    setTimeout(() => setShowDrops(true), 600);

    // Step 3: Plant reacts — splash & vivid
    setTimeout(() => {
      setShowSplash(true);
      setPlantVivid(true);
      waterPlant();
    }, 1400);

    // Step 5: Can exits, settle
    setTimeout(() => {
      setShowDrops(false);
      setShowSplash(false);
    }, 2200);

    setTimeout(() => {
      setShowCan(false);
      setPlantVivid(false);
      setIsWatering(false);
    }, 3000);
  }, [isWatering, waterPlant]);

  const handleReset = () => {
    localStorage.removeItem("saathi-gamification");
    window.location.reload();
  };

  return (
    <div className="rounded-2xl bg-card shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
          🪴 Nurture Garden
        </h3>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="font-bold text-primary">✨ {xp} XP</span>
          <span className="font-bold text-coral">🔥 {streak}</span>
        </div>
      </div>

      {/* Scene */}
      <div className="relative mx-4 rounded-2xl overflow-hidden" style={{ height: 260, background: "linear-gradient(180deg, #87CEEB 0%, #B5E8D5 50%, #90C695 80%, #6B8E23 100%)" }}>
        {/* Sky details */}
        <motion.div className="absolute top-3 right-6 w-12 h-12 rounded-full"
          style={{ background: "radial-gradient(circle, #FFE082, #FFB300)", boxShadow: "0 0 30px #FFE08280" }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div className="absolute top-5 left-4 text-xl opacity-40" animate={{ x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }}>☁️</motion.div>
        <motion.div className="absolute top-2 left-28 text-base opacity-30" animate={{ x: [0, -6, 0] }} transition={{ duration: 10, repeat: Infinity }}>☁️</motion.div>

        {/* Watering Can */}
        <AnimatePresence>
          {showCan && (
            <motion.div
              className="absolute z-30"
              style={{ width: 70, height: 52, top: 20, right: 30 }}
              initial={{ x: 80, y: -40, rotate: 0, opacity: 0 }}
              animate={showDrops
                ? { x: 0, y: 0, rotate: -35, opacity: 1 }
                : { x: 0, y: 0, rotate: 0, opacity: 1 }
              }
              exit={{ x: 80, y: -40, rotate: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 14 }}
            >
              <WateringCanSVG />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Water Drops */}
        <AnimatePresence>
          {showDrops && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`waterdrop-${i}`}
                  className="absolute z-20 pointer-events-none"
                  style={{ right: 60 + i * 3, top: 55 }}
                  initial={{ y: 0, x: 0, opacity: 1, scale: 1, rotate: 0 }}
                  animate={{
                    y: 120 + Math.random() * 20,
                    x: -(30 + i * 8 + Math.random() * 15),
                    opacity: [1, 0.8, 0.3],
                    scale: [1, 0.8, 0.5],
                    rotate: [0, 15, -10, 5],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.7 + Math.random() * 0.2,
                    delay: i * 0.1,
                    ease: "easeIn",
                  }}
                >
                  <svg width="12" height="16" viewBox="0 0 12 16">
                    <path d="M6 0 C6 0, 0 8, 0 10 C0 13.3, 2.7 16, 6 16 C9.3 16, 12 13.3, 12 10 C12 8, 6 0, 6 0Z"
                      fill={i % 2 === 0 ? "#60B8FF" : "#A8D8FF"} />
                  </svg>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Soil splash ripples */}
        <AnimatePresence>
          {showSplash && (
            <>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={`splash-${i}`}
                  className="absolute z-15 pointer-events-none"
                  style={{ bottom: 58, left: "50%", transform: "translateX(-50%)" }}
                  initial={{ scale: 0, opacity: 0.7 }}
                  animate={{ scale: 2 + i, opacity: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                >
                  <div className="w-8 h-3 rounded-full border-2 border-sky/50" />
                </motion.div>
              ))}
              {/* Soil particles */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`soil-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-earth pointer-events-none z-15"
                  style={{ bottom: 62, left: `calc(50% + ${(i - 3) * 8}px)` }}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -(10 + Math.random() * 20), x: (i - 3) * 6, opacity: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Stage up sparkles */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute pointer-events-none z-30 text-sm"
                  style={{ left: "50%", top: "45%" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    x: (Math.random() - 0.5) * 180,
                    y: (Math.random() - 0.5) * 140,
                  }}
                  transition={{ duration: 1.2, delay: i * 0.08 }}
                >
                  {i % 3 === 0 ? "⭐" : i % 3 === 1 ? "✨" : "💚"}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Stage up banner */}
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 8, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 12 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-success text-success-foreground text-xs font-extrabold shadow-lg whitespace-nowrap"
            >
              🎉 Your plant grew! → {PLANT_NAMES[stageIdx]}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ground & pot area */}
        <div className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: "linear-gradient(180deg, #6B8E23, #556B2F)" }}>
        </div>

        {/* Dhaka Pot */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10" style={{ width: 110, height: 65 }}>
          <DhakaPotSVG />
        </div>

        {/* Plant inside pot */}
        <motion.div
          className="absolute z-10 left-1/2 -translate-x-1/2"
          style={{ width: 90, height: 100, bottom: 48 }}
          animate={stageChanged
            ? { scale: [0.9, 1.15, 1] }
            : isWatering
              ? { scale: [1, 1.02, 1] }
              : {}
          }
          transition={stageChanged
            ? { type: "spring", stiffness: 200, damping: 10 }
            : { duration: 0.5 }
          }
        >
          <div className={`transition-all duration-700 ${plantVivid ? "saturate-150 brightness-110" : ""}`}>
            <PlantSVG />
          </div>
        </motion.div>

        {/* Buddy celebration */}
        <AnimatePresence>
          {showBuddy && (
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="absolute bottom-4 right-2 z-40 flex items-end gap-1"
            >
              <div className="bg-card rounded-xl px-2 py-1 shadow-card text-[9px] font-bold text-foreground max-w-[100px]">
                Look how far you've come! 🌸
              </div>
              <img src={buddyImg} alt="Buddy" className="w-10 h-10 object-contain animate-tail-wag" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage Progress */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-foreground">{PLANT_NAMES[stageIdx]}</span>
          <span className="text-[10px] text-muted-foreground font-semibold">Stage {stageIdx + 1}/5</span>
        </div>
        {/* Stage progress dots */}
        <div className="flex gap-1 mb-2">
          {PLANT_NAMES.map((name, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-700 ${
              i <= stageIdx ? "bg-success" : "bg-muted"
            }`} />
          ))}
        </div>
        {plantStage < 4 && (
          <p className="text-[10px] text-muted-foreground text-center">
            {nextStageIn} more watering{nextStageIn !== 1 ? "s" : ""} to {PLANT_NAMES[Math.min(stageIdx + 1, 4)]} {stageIdx < 3 ? "🌿" : "🌸"}
          </p>
        )}
        {plantStage >= 4 && (
          <p className="text-[10px] text-success font-bold text-center">🌳 Fully grown & thriving!</p>
        )}
      </div>

      {/* Water Button */}
      <div className="px-4 pb-4 pt-1">
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
            <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
              💧 Watering...
            </motion.span>
          ) : (
            <>🌧️ Water Today</>
          )}
        </motion.button>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <p className="text-[9px] text-muted-foreground">Tap to water your plant & watch it grow!</p>
          <button onClick={handleReset} className="text-[9px] text-muted-foreground hover:text-foreground underline">Reset</button>
        </div>
      </div>
    </div>
  );
}
