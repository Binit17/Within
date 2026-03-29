import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Phone, Shield, Heart, CheckCircle2 } from "lucide-react";

const crisisResources = [
  { name: "Mental Health Helpline Nepal", number: "1166", emoji: "🇳🇵" },
  { name: "Lifeline Nepal", number: "16600116611", emoji: "💚" },
  { name: "TPO Nepal", number: "Contact via tponepal.org", emoji: "🏥" },
  { name: "988 Suicide & Crisis Lifeline", number: "988", emoji: "🌍" },
];

const recoveryTodos = [
  "Take 3 deep breaths",
  "Drink a glass of water",
  "Text or call someone you trust",
  "Step outside for 2 minutes",
  "Write one thing you're grateful for",
];

const EmergencyPage = () => {
  const [checked, setChecked] = useState<boolean[]>(new Array(recoveryTodos.length).fill(false));
  const [feelingSafer, setFeelingSafer] = useState(false);
  const navigate = useNavigate();

  const toggleCheck = (i: number) => {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  if (feelingSafer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <span className="text-6xl block mb-4">💚</span>
          <h2 className="text-xl font-bold text-foreground mb-2">We're glad you're feeling safer</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Remember, साथी is always here for you. You're never alone.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-xl gradient-purple text-primary-foreground font-semibold"
          >
            Back Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="dhaka-stripe" />

      {/* Header */}
      <div className="px-5 pt-8 pb-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-5xl mb-4 inline-block"
        >
          🚨
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">We're Here For You</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
          You're going through something really tough right now. That takes incredible strength to acknowledge.
          You don't have to face this alone.
        </p>
      </div>

      <div className="px-5 space-y-4">
        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-4 shadow-card border border-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center text-primary-foreground font-bold">
              RK
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Rina Karki</h3>
              <p className="text-xs text-muted-foreground">Sister • Emergency Contact</p>
            </div>
          </div>
          <a href="tel:+977" className="mt-3 block w-full py-2.5 rounded-xl gradient-purple text-center text-primary-foreground font-semibold text-sm">
            <Phone className="w-4 h-4 inline mr-1" /> Call Rina
          </a>
        </motion.div>

        {/* Crisis Resources */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Crisis Resources</h3>
          </div>
          <div className="space-y-2">
            {crisisResources.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <span>{r.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.number}</p>
                  </div>
                </div>
                {r.number.match(/^\d+$/) && (
                  <a href={`tel:${r.number}`} className="px-3 py-1.5 rounded-lg gradient-danger text-destructive-foreground text-xs font-semibold">
                    Call
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recovery To-Do */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-sm text-foreground">Recovery Steps</h3>
          </div>
          <div className="space-y-2">
            {recoveryTodos.map((todo, i) => (
              <button
                key={i}
                onClick={() => toggleCheck(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  checked[i] ? "bg-success/10" : "bg-secondary"
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 transition-colors ${
                  checked[i] ? "text-success" : "text-muted-foreground"
                }`} />
                <span className={`text-sm ${checked[i] ? "text-success line-through" : "text-foreground"}`}>
                  {todo}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feeling safer */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setFeelingSafer(true)}
          className="w-full py-3.5 rounded-xl bg-success text-success-foreground font-semibold text-sm"
        >
          💚 I'm feeling safer now
        </motion.button>
      </div>
    </div>
  );
};

export default EmergencyPage;
