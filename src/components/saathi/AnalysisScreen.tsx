import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const steps = [
  { label: "Analyzing facial expressions...", emoji: "😊", duration: 2000, detail: "CNN model processing micro-expressions" },
  { label: "Processing vocal biomarkers...", emoji: "🎙️", duration: 2000, detail: "Extracting pitch, tremor & speech patterns" },
  { label: "NLP sentiment analysis...", emoji: "📖", duration: 1500, detail: "Transformer model reading context" },
  { label: "Running predictive models...", emoji: "🧠", duration: 1500, detail: "Reinforcement learning + trend prediction" },
  { label: "Generating clinical insights...", emoji: "✨", duration: 1000, detail: "Compiling report for care team" },
];

export function AnalysisScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete();
      return;
    }

    setProgress(0);
    const duration = steps[currentStep].duration;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep(s => s + 1), 300);
          return 100;
        }
        return p + (100 / (duration / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep, onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-8">
      <div className="fixed top-0 left-0 right-0 dhaka-stripe" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center w-full max-w-sm"
      >
        <div className="text-4xl mb-4 animate-pulse-soft">🧠</div>
        <h2 className="text-lg font-bold text-foreground mb-2">AI Analysis in Progress</h2>
        <p className="text-xs text-muted-foreground mb-8">Using ML models to understand your emotional state</p>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-left"
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-lg">{step.emoji}</span>
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${
                    i < currentStep ? "text-primary" : i === currentStep ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                  {i === currentStep && (
                    <p className="text-[9px] text-muted-foreground">{step.detail}</p>
                  )}
                </div>
                {i < currentStep && <span className="text-primary text-xs">✓</span>}
              </div>
              <div className="ml-9 h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${i < currentStep ? "bg-primary" : i === currentStep ? "bg-primary" : "bg-secondary"}`}
                  style={{ width: i < currentStep ? "100%" : i === currentStep ? `${progress}%` : "0%" }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
