import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { getVillageState, growVillage } from "@/lib/api";

interface GamificationState {
  streak: number;
  plantStage: number;
  totalCheckins: number;
  lastCheckinDate: string | null;
  villageLevel: number;
  totalSessions: number;
  xp: number;
  justWatered: boolean;
}

interface GamificationContextType extends GamificationState {
  completeCheckin: () => void;
  completeSession: () => void;
  addXp: (amount: number) => void;
  waterPlant: () => void;
  plantEmoji: string;
  plantLabel: string;
  plantDescription: string;
}

const PLANT_STAGES = ["🌱", "🌿", "🪴", "🌸", "🌳"];
const PLANT_LABELS = ["Seedling", "First Sprout", "Growing Strong", "Flowering", "Thriving Tree"];
const PLANT_DESCRIPTIONS = [
  "Your journey begins here",
  "Something beautiful is growing",
  "Showing up for yourself 💪",
  "Your consistency is blooming",
  "Look how far you've come 🎉",
];
const STORAGE_KEY = "saathi-gamification";

const STAGE_THRESHOLDS = [0, 2, 4, 6, 8];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getStage(checkins: number): number {
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (checkins >= STAGE_THRESHOLDS[i]) return i;
  }
  return 0;
}

function loadState(): GamificationState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, justWatered: false };
    }
  } catch {}
  return {
    streak: 0, plantStage: 0, totalCheckins: 0,
    lastCheckinDate: null,
    villageLevel: 1, totalSessions: 0, xp: 0, justWatered: false,
  };
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GamificationState>(loadState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, justWatered: false }));
  }, [state]);

  // Sync village state from backend on mount
  useEffect(() => {
    getVillageState()
      .then((village) => {
        setState((prev) => ({
          ...prev,
          villageLevel: village.level,
          totalSessions: village.sessions_completed,
          streak: village.streak || prev.streak,
        }));
      })
      .catch(() => {
        // Backend unavailable — keep localStorage state
      });
  }, []);

  const completeCheckin = useCallback(() => {
    setState(prev => {
      const today = getToday();
      if (prev.lastCheckinDate === today) return prev;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = prev.lastCheckinDate === yesterday.toISOString().slice(0, 10);

      const newStreak = isConsecutive ? prev.streak + 1 : 1;
      const newCheckins = prev.totalCheckins + 1;
      const newPlantStage = getStage(newCheckins);

      return {
        ...prev,
        streak: newStreak,
        totalCheckins: newCheckins,
        lastCheckinDate: today,
        plantStage: newPlantStage,
        xp: prev.xp + 25,
        justWatered: true,
      };
    });
  }, []);

  // Demo-friendly: always allows watering, grows plant each time
  const waterPlant = useCallback(() => {
    setState(prev => {
      const newCheckins = prev.totalCheckins + 1;
      const newPlantStage = getStage(newCheckins);

      return {
        ...prev,
        streak: prev.streak + 1,
        totalCheckins: newCheckins,
        plantStage: newPlantStage,
        xp: prev.xp + 25,
        justWatered: true,
        lastCheckinDate: getToday(),
      };
    });
  }, []);

  const completeSession = useCallback(() => {
    setState(prev => {
      const newSessions = prev.totalSessions + 1;
      const newVillageLevel = Math.min(20, Math.floor(newSessions / 5) + 1);
      return { ...prev, totalSessions: newSessions, villageLevel: newVillageLevel, xp: prev.xp + 50 };
    });
    // Also sync with backend
    growVillage(1)
      .then((result) => {
        setState((prev) => ({
          ...prev,
          villageLevel: result.level,
          totalSessions: result.sessions_completed,
        }));
      })
      .catch(() => {
        // Backend unavailable — local state already updated
      });
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(prev => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  useEffect(() => {
    if (state.justWatered) {
      const t = setTimeout(() => setState(p => ({ ...p, justWatered: false })), 3000);
      return () => clearTimeout(t);
    }
  }, [state.justWatered]);

  return (
    <GamificationContext.Provider value={{
      ...state,
      completeCheckin,
      completeSession,
      addXp,
      waterPlant,
      plantEmoji: PLANT_STAGES[Math.min(state.plantStage, 4)],
      plantLabel: PLANT_LABELS[Math.min(state.plantStage, 4)],
      plantDescription: PLANT_DESCRIPTIONS[Math.min(state.plantStage, 4)],
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("useGamification must be inside GamificationProvider");
  return ctx;
}
