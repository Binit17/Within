import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/hooks/useGamification";
import { useCycle } from "@/hooks/useCycle";
import { useNavigate } from "react-router-dom";
import { Heart, Moon, Footprints, Activity, Watch, Bluetooth, Check, X, Stethoscope } from "lucide-react";
import { PlantCard } from "@/components/saathi/PlantCard";

import { CycleCard } from "@/components/saathi/CycleCard";
import { CalendarEventCard } from "@/components/saathi/CalendarEventCard";
import { WeeklyMoodTracker } from "@/components/saathi/WeeklyMoodTracker";
import { CycleOnboarding } from "@/components/saathi/CycleOnboarding";
import { NotificationPanel } from "@/components/NotificationPanel";
import buddySmall from "@/assets/buddy-puppy.png";
import buddyHero from "@/assets/buddy-hero.png";

const devices = [
  { name: "Apple Watch", icon: "⌚", status: "connected", data: "HR 72 bpm · Steps 8,432" },
  { name: "Oura Ring", icon: "💍", status: "connected", data: "HRV 42ms · Sleep 7.5h" },
  { name: "Fitbit", icon: "📟", status: "available", data: "Tap to connect" },
];

function DeviceConnectionCard() {
  const [connectedDevices, setConnectedDevices] = useState<Record<string, boolean>>({
    "Apple Watch": true,
    "Oura Ring": true,
    "Fitbit": false,
  });

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bluetooth className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Connected Devices</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-semibold">2 Active</span>
      </div>
      <div className="space-y-2">
        {devices.map(device => {
          const isConnected = connectedDevices[device.name];
          return (
            <button
              key={device.name}
              onClick={() => setConnectedDevices(prev => ({ ...prev, [device.name]: !prev[device.name] }))}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                isConnected ? "bg-primary/5 border border-primary/20" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <span className="text-xl">{device.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-foreground">{device.name}</p>
                <p className="text-[10px] text-muted-foreground">{isConnected ? device.data : "Tap to connect"}</p>
              </div>
              {isConnected ? (
                <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const { totalCheckins } = useGamification();
  const { enabled: cycleEnabled, skipCycle } = useCycle();
  const [showCycleOnboarding, setShowCycleOnboarding] = useState(false);
  const [doctorPopup, setDoctorPopup] = useState<any>(null);

  // Check for doctor notifications
  useEffect(() => {
    const check = () => {
      const raw = localStorage.getItem("doctor_notifications");
      if (raw) {
        const notifs = JSON.parse(raw);
        if (notifs.length > 0) {
          setDoctorPopup(notifs[notifs.length - 1]);
        }
      }
    };
    check();
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, []);

  const dismissDoctorPopup = () => {
    localStorage.removeItem("doctor_notifications");
    setDoctorPopup(null);
  };

  const [vitals, setVitals] = useState({
    hr: 72, sleep: 7.5, steps: 8432, o2: 98,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => ({
        hr: 68 + Math.floor(Math.random() * 10),
        sleep: prev.sleep,
        steps: Math.min(10000, prev.steps + Math.floor(Math.random() * 30)),
        o2: 96 + Math.floor(Math.random() * 4),
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stressScore = 38;
  const stressEmoji = stressScore < 25 ? "😌" : stressScore < 50 ? "🙂" : stressScore < 75 ? "😰" : "😫";
  const stressLabel = stressScore < 25 ? "Calm" : stressScore < 50 ? "Mild" : stressScore < 75 ? "Stressed" : "High";

  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.35 },
  });

  return (
    <div className="min-h-screen pb-24 bg-background">
      <motion.div {...fadeIn(0)} className="px-5 pt-5 pb-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground font-display">Within</h1>
          <p className="text-sm text-muted-foreground">How are you today? 🌿</p>
        </div>
        <button onClick={() => navigate("/profile")} className="flex items-center gap-2 hover:scale-105 transition-transform">
          <div className="relative">
            <div className="w-11 h-11 rounded-full border-2 border-primary overflow-hidden bg-muted flex items-center justify-center">
              <img src={buddySmall} alt="Buddy" className="w-9 h-9 object-contain" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
          </div>
          <span className="text-xs font-semibold text-foreground">Isha Thapa</span>
        </button>
      </motion.div>

      <div className="px-5 space-y-4 mt-3">
        {/* Wellness Score Hero */}
        <motion.div {...fadeIn(0.05)}>
          <button
            onClick={() => navigate("/chat")}
            className="w-full rounded-3xl gradient-hero p-5 shadow-buddy text-left relative overflow-hidden"
          >
            <p className="text-xs font-bold text-primary-foreground/80 uppercase tracking-wider">Wellness Score</p>
            <p className="text-6xl font-black text-primary-foreground mt-1 font-display">72</p>
            <p className="text-sm text-primary-foreground/80 mt-1">Tap to talk to Buddy 🐾</p>
            <img src={buddyHero} alt="Buddy" className="absolute right-3 bottom-2 w-28 h-28 object-contain drop-shadow-lg" width={512} height={512} />
          </button>
        </motion.div>

        {/* Stress Level */}
        <motion.div {...fadeIn(0.1)}>
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-foreground">Stress Level</span>
              <span className="text-2xl">{stressEmoji}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--warning)), hsl(var(--primary)))" }}
                initial={{ width: 0 }}
                animate={{ width: `${stressScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-primary font-semibold">{stressLabel}</span>
              <span className="text-xs font-bold text-foreground">{stressScore}/100</span>
            </div>
          </div>
        </motion.div>

        {/* Vitals */}
        <motion.div {...fadeIn(0.15)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4 shadow-card" style={{ background: "hsl(var(--coral-light))" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Heart className="w-4 h-4 text-coral" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Heart Rate</span>
              </div>
              <motion.p key={vitals.hr} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-3xl font-black text-foreground">
                {vitals.hr} <span className="text-sm font-semibold text-muted-foreground">bpm</span>
              </motion.p>
              <p className="text-xs text-muted-foreground mt-0.5">Resting</p>
            </div>
            <div className="rounded-2xl p-4 shadow-card" style={{ background: "hsl(var(--lavender-light))" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Moon className="w-4 h-4 text-lavender" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Sleep</span>
              </div>
              <p className="text-3xl font-black text-foreground">{vitals.sleep} <span className="text-sm font-semibold text-muted-foreground">hrs</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">Good quality</p>
            </div>
            <div className="rounded-2xl p-4 shadow-card" style={{ background: "hsl(var(--mint-light))" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Footprints className="w-4 h-4 text-mint-deep" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Steps</span>
              </div>
              <motion.p key={vitals.steps} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-3xl font-black text-foreground">
                {vitals.steps.toLocaleString()}
              </motion.p>
              <p className="text-xs text-muted-foreground mt-0.5">Goal: 10,000</p>
            </div>
            <div className="rounded-2xl p-4 shadow-card" style={{ background: "hsl(var(--sky-light))" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="w-4 h-4 text-sky-deep" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Blood O₂</span>
              </div>
              <motion.p key={vitals.o2} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-3xl font-black text-foreground">
                {vitals.o2}<span className="text-sm font-semibold text-muted-foreground">%</span>
              </motion.p>
              <p className="text-xs text-muted-foreground mt-0.5">Normal</p>
            </div>
          </div>
        </motion.div>

        {/* Plant */}
        <motion.div {...fadeIn(0.2)}>
          <PlantCard />
        </motion.div>

        {/* Connected Devices */}
        <motion.div {...fadeIn(0.12)}>
          <DeviceConnectionCard />
        </motion.div>

        {/* Notifications */}
        <motion.div {...fadeIn(0.22)}>
          <NotificationPanel />
        </motion.div>

        {/* Cycle — now with skip option visible */}
        {cycleEnabled ? (
          <motion.div {...fadeIn(0.25)}>
            <CycleCard />
          </motion.div>
        ) : (
          <motion.div {...fadeIn(0.25)}>
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🌙</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Cycle-Aware Insights</p>
                  <p className="text-[10px] text-muted-foreground">Optional — personalized tracking for menstrual health</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCycleOnboarding(true)}
                  className="flex-1 py-2 rounded-xl gradient-purple text-primary-foreground text-xs font-bold"
                >
                  Enable
                </button>
                <button
                  onClick={() => skipCycle()}
                  className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-secondary transition-colors"
                >
                  Not for me
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Calendar */}
        <motion.div {...fadeIn(0.28)}>
          <CalendarEventCard />
        </motion.div>

        {/* Weekly Mood */}
        <motion.div {...fadeIn(0.3)}>
          <WeeklyMoodTracker />
        </motion.div>
      </div>

      <AnimatePresence>
        {showCycleOnboarding && (
          <CycleOnboarding onClose={() => setShowCycleOnboarding(false)} />
        )}
      </AnimatePresence>

      {/* Doctor Resources Popup */}
      <AnimatePresence>
        {doctorPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-5"
            onClick={dismissDoctorPopup}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-card rounded-3xl p-5 shadow-float"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full gradient-buddy flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">From Your Doctor</h3>
                    <p className="text-[10px] text-muted-foreground">Dr. Nepal • just now</p>
                  </div>
                </div>
                <button onClick={dismissDoctorPopup} className="p-1 rounded-full bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-3">{doctorPopup.message}</p>

              <div className="space-y-2">
                {doctorPopup.resources?.map((r: any, i: number) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => {
                      dismissDoctorPopup();
                      if (r.action.startsWith("/")) navigate(r.action);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">{r.title}</p>
                      <p className="text-[10px] text-muted-foreground">{r.description}</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary">Open →</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <img src={buddySmall} alt="Buddy" className="w-6 h-6 object-contain" />
                <p className="text-[10px] text-muted-foreground">"Your doctor cares about you. Try one of these!" 🐾</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
