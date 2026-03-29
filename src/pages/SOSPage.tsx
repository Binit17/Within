import { useState, useEffect, useRef } from "react";
import { Phone, Heart, Wind, Brain, Waves } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import buddyImg from "@/assets/buddy-puppy.png";

const exercises = [
  { id: "breathe", label: "Deep Breathing", icon: Wind, color: "bg-mint-light", duration: 60, description: "Inhale 4s, hold 4s, exhale 4s" },
  { id: "body", label: "Body Scan", icon: Brain, color: "bg-lavender-light", duration: 120, description: "Progressive muscle relaxation" },
  { id: "mindful", label: "Mindfulness", icon: Waves, color: "bg-sky-light", duration: 90, description: "Focus on the present moment" },
  { id: "ground", label: "5-4-3-2-1", icon: Heart, color: "bg-coral-light", duration: 60, description: "Grounding technique" },
];

const SOSPage = () => {
  const [active, setActive] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [stressDrop, setStressDrop] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startExercise = (id: string, duration: number) => {
    setActive(id);
    setTimer(duration);
    setStressDrop(0);
  };

  const { completeSession, addXp } = useGamification();

  useEffect(() => {
    if (active && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(t => t - 1);
        setStressDrop(d => d + 0.5);
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
    if (timer === 0 && active) {
      completeSession();
      addXp(30);
      setActive(null);
    }
  }, [active, timer, completeSession, addXp]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const activeExercise = exercises.find(e => e.id === active);

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="gradient-danger px-5 pt-6 pb-5 rounded-b-3xl">
        <h1 className="text-2xl font-extrabold text-destructive-foreground">SOS Relief</h1>
        <p className="text-sm text-destructive-foreground/80 mt-1">You're safe. Let's calm down together. 🐾</p>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {active && activeExercise && (
          <div className="rounded-2xl bg-card p-6 shadow-card animate-bounce-in text-center">
            <img src={buddyImg} alt="Buddy" className="w-20 h-20 object-contain mx-auto" />
            <h3 className="font-bold text-lg mt-3 text-foreground">{activeExercise.label}</h3>
            <p className="text-sm text-muted-foreground mb-4">{activeExercise.description}</p>

            {active === "breathe" && (
              <div className="mx-auto w-32 h-32 rounded-full bg-mint-light flex items-center justify-center mb-4 animate-breathe">
                <span className="text-3xl font-bold text-mint-deep">{formatTime(timer)}</span>
              </div>
            )}
            {active !== "breathe" && (
              <div className="text-4xl font-bold text-primary mb-4">{formatTime(timer)}</div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-success font-semibold">
              <span>Stress reduced: -{Math.round(stressDrop)}%</span>
              <span>⭐ +{Math.round(stressDrop * 2)} XP</span>
            </div>

            <p className="text-xs text-muted-foreground mt-3 italic">"You're doing great! Keep breathing..." — Buddy 🐾</p>

            <button
              className="mt-4 px-6 py-2 rounded-full bg-secondary text-sm font-semibold text-secondary-foreground hover:bg-muted transition-colors"
              onClick={() => { setActive(null); clearInterval(intervalRef.current); }}
            >
              Stop
            </button>
          </div>
        )}

        {!active && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {exercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => startExercise(ex.id, ex.duration)}
                  className={`${ex.color} rounded-2xl p-4 text-left shadow-card hover:scale-[1.03] transition-transform`}
                >
                  <ex.icon className="w-6 h-6 text-foreground/60 mb-2" />
                  <h3 className="font-bold text-sm text-foreground">{ex.label}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">{ex.description}</p>
                  <p className="text-[10px] text-foreground/50 mt-1">{formatTime(ex.duration)}</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-destructive/5 p-4 shadow-card border border-destructive/20">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="font-bold text-sm text-foreground">Emergency Helpline</h3>
                  <p className="text-xs text-muted-foreground">988 Suicide & Crisis Lifeline</p>
                </div>
              </div>
              <a
                href="tel:988"
                className="mt-3 block text-center py-2 rounded-xl gradient-danger text-destructive-foreground font-semibold text-sm"
              >
                Call Now
              </a>
            </div>

            <div className="flex items-center gap-3 p-4 bg-buddy-light rounded-2xl">
              <img src={buddyImg} alt="Buddy" className="w-10 h-10 object-contain" />
              <p className="text-sm text-foreground">"Remember, tough moments pass. You're stronger than you think!" 🧡</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SOSPage;
