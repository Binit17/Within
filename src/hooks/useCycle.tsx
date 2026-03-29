import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

interface CycleState {
  enabled: boolean;
  lastPeriodDate: string | null;
  cycleLength: number;
}

interface CyclePhase {
  name: string;
  emoji: string;
  color: string;
  headline: string;
  body: string;
  workTip: string;
  tags: string[];
  day: number;
}

interface CycleContextType extends CycleState {
  currentPhase: CyclePhase | null;
  enableCycle: (lastPeriod: string, length: number) => void;
  skipCycle: () => void;
}

const CYCLE_STORAGE = "saathi-cycle";

const phases = [
  { name: "Menstrual", emoji: "🌙", color: "purple", headline: "Rest & Reflect", body: "Your body needs rest. Be gentle with yourself.", workTip: "Focus on light tasks and planning", tags: ["rest", "gentle", "reflection"] },
  { name: "Follicular", emoji: "☀️", color: "green", headline: "Rising Energy", body: "Energy is building. Great time for new projects.", workTip: "Tackle creative and challenging work", tags: ["energy", "creativity", "growth"] },
  { name: "Ovulatory", emoji: "🌟", color: "amber", headline: "Peak Performance", body: "You're at your communicative best.", workTip: "Schedule presentations and meetings", tags: ["social", "confidence", "peak"] },
  { name: "Luteal", emoji: "🍂", color: "red", headline: "Wind Down", body: "Sensitivity may increase. Practice self-care.", workTip: "Organize, review, and complete tasks", tags: ["self-care", "completion", "rest"] },
];

function loadCycleState(): CycleState {
  try {
    const saved = localStorage.getItem(CYCLE_STORAGE);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { enabled: false, lastPeriodDate: null, cycleLength: 28 };
}

function getPhase(lastPeriod: string, cycleLength: number): CyclePhase {
  const start = new Date(lastPeriod);
  const today = new Date();
  const dayInCycle = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) % cycleLength;
  
  const menstrualEnd = 5;
  const follicularEnd = Math.floor(cycleLength * 0.45);
  const ovulatoryEnd = Math.floor(cycleLength * 0.55);

  let phaseIndex = 3; // luteal default
  if (dayInCycle < menstrualEnd) phaseIndex = 0;
  else if (dayInCycle < follicularEnd) phaseIndex = 1;
  else if (dayInCycle < ovulatoryEnd) phaseIndex = 2;

  return { ...phases[phaseIndex], day: dayInCycle + 1 };
}

const CycleContext = createContext<CycleContextType | null>(null);

export function CycleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CycleState>(loadCycleState);

  useEffect(() => {
    localStorage.setItem(CYCLE_STORAGE, JSON.stringify(state));
  }, [state]);

  const currentPhase = state.enabled && state.lastPeriodDate
    ? getPhase(state.lastPeriodDate, state.cycleLength)
    : null;

  const enableCycle = useCallback((lastPeriod: string, length: number) => {
    setState({ enabled: true, lastPeriodDate: lastPeriod, cycleLength: length });
  }, []);

  const skipCycle = useCallback(() => {
    setState(prev => ({ ...prev, enabled: false }));
  }, []);

  return (
    <CycleContext.Provider value={{ ...state, currentPhase, enableCycle, skipCycle }}>
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error("useCycle must be inside CycleProvider");
  return ctx;
}
