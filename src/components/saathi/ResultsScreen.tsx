import { motion } from "framer-motion";
import { AlertTriangle, Stethoscope, Brain, TrendingUp } from "lucide-react";

interface AnalysisResult {
  wellbeingScore: number;
  emotions: { name: string; score: number; emoji: string }[];
  risk: "low" | "medium" | "high" | "critical";
  clinicAlert: boolean;
  aiSummary: string;
  prediction: string;
}

interface ResultsScreenProps {
  stressors: string[];
  analysis: AnalysisResult;
  onHome: () => void;
  onResources: () => void;
}

const riskColors = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
  critical: "text-destructive",
};

const riskBg = {
  low: "bg-success/10 border-success/20",
  medium: "bg-warning/10 border-warning/20",
  high: "bg-destructive/10 border-destructive/20",
  critical: "bg-destructive/20 border-destructive/30",
};

const emotionColors: Record<string, string> = {
  Stress: "bg-destructive",
  Anxiety: "bg-warning",
  Sadness: "bg-sky",
  Hope: "bg-primary",
};

export function ResultsScreen({ stressors, analysis, onHome, onResources }: ResultsScreenProps) {
  const { wellbeingScore, emotions, risk, clinicAlert, aiSummary, prediction } = analysis;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="dhaka-stripe" />
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Your Results</h1>
        <p className="text-sm text-muted-foreground">AI-powered analysis complete</p>
      </div>

      <div className="px-5 space-y-4">
        {/* Wellbeing Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl p-5 shadow-card border text-center ${riskBg[risk]}`}
        >
          <p className="text-xs text-muted-foreground mb-2">Wellbeing Score</p>
          <div className={`text-5xl font-black ${riskColors[risk]}`}>{wellbeingScore}</div>
          <p className="text-xs text-muted-foreground">/100</p>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${wellbeingScore}%` }}
              transition={{ duration: 1 }}
              className={`h-full rounded-full ${wellbeingScore > 60 ? "bg-success" : wellbeingScore > 30 ? "bg-warning" : "bg-destructive"}`}
            />
          </div>
          <p className={`text-xs font-semibold mt-2 ${riskColors[risk]}`}>
            {risk === "critical" ? "🚨 Critical — Immediate support needed" :
             risk === "high" ? "⚠️ High Risk — Please reach out for help" :
             risk === "medium" ? "⚡ Moderate — Consider wellness activities" :
             "✅ You're doing well — Keep it up!"}
          </p>
        </motion.div>

        {/* Clinical Alert */}
        {clinicAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-destructive/15 p-4 shadow-card border border-destructive/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-destructive">Clinical Report Sent</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  An anonymized wellness report has been automatically sent to your care team. 
                  This includes your wellbeing score, detected emotions, and journal context. 
                  Your clinician will review it within 24 hours.
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-destructive font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  Risk Level: {risk.toUpperCase()}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Detected Emotions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card p-4 shadow-card"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">🧠 Detected Emotions</h3>
          <div className="space-y-3">
            {emotions.map((e, i) => (
              <motion.div
                key={e.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span>{e.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{e.name}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{e.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${e.score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.15 }}
                    className={`h-full rounded-full ${emotionColors[e.name] || "bg-primary"}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Prediction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card p-4 shadow-card border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">ML Prediction</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{prediction}</p>
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card p-4 shadow-card border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">AI Journal Analysis</h3>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{aiSummary}</p>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onResources}
            className="flex-1 py-3 rounded-xl gradient-leaf text-primary-foreground font-semibold text-sm shadow-leaf"
          >
            See Resources
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm"
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  );
}
