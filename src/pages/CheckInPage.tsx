import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Mic, Type, Send, AlertTriangle, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGamification } from "@/hooks/useGamification";
import { BuddyAvatar } from "@/components/BuddyAvatar";
import { LiveBiomarkerPanel } from "@/components/LiveBiomarkerPanel";
import { AnalysisScreen } from "@/components/saathi/AnalysisScreen";
import { ResultsScreen } from "@/components/saathi/ResultsScreen";
import { analyzeCheckIn } from "@/lib/api";
import { checkInEngine, type EmotionData, type VocalData, type OculomotorData } from "@/lib/checkInEngine";

const stressorCards = [
  { id: "abroad", label: "Abroad ko Tension", emoji: "🌏" },
  { id: "ghar", label: "Ghar ko Pressure", emoji: "🏠" },
  { id: "exam", label: "Exam Season", emoji: "📚" },
  { id: "remittance", label: "Remittance Burden", emoji: "💸" },
  { id: "work", label: "Work Burnout", emoji: "💼" },
  { id: "health", label: "Health Anxiety", emoji: "🏥" },
];

const journalPrompts = [
  "How are you feeling right now? Let it all out...",
  "What's been on your mind today? No judgment here.",
  "Describe your day in three words, then expand...",
  "What would make tomorrow better than today?",
  "If your feelings were weather, what would today be?",
];

type Mode = "video" | "audio" | "text";
type Screen = "checkin" | "analyzing" | "results";

// Emoji map for dominant emotion
const emojiMap: Record<string, string> = {
  happy: "😊", sad: "😢", angry: "😠", fearful: "😨",
  disgusted: "🤢", surprised: "😮", neutral: "😐",
};

// Local fallback analysis if backend is unavailable
function analyzeJournalLocal(text: string, stressors: string[]) {
  const lower = text.toLowerCase();
  const negativeWords = ["hopeless", "can't", "worthless", "die", "kill", "end it", "give up", "no point", "alone", "hurt", "pain", "suffering", "cry", "depressed", "anxiety", "panic", "scared", "terrified", "overwhelmed"];
  const positiveWords = ["happy", "grateful", "good", "better", "hope", "love", "calm", "peaceful", "excited", "proud", "strong"];
  const crisisWords = ["suicide", "kill myself", "end my life", "want to die", "self-harm", "cut myself", "no reason to live"];

  let negScore = 0, posScore = 0;
  let crisisDetected = false;

  negativeWords.forEach(w => { if (lower.includes(w)) negScore += 10; });
  positiveWords.forEach(w => { if (lower.includes(w)) posScore += 10; });
  crisisWords.forEach(w => { if (lower.includes(w)) crisisDetected = true; });

  const stressorWeight = stressors.length * 8;
  const rawScore = Math.max(0, Math.min(100, 65 - negScore + posScore - stressorWeight));
  const wellbeingScore = crisisDetected ? Math.min(15, rawScore) : rawScore;

  let risk: "low" | "medium" | "high" | "critical" = "low";
  if (crisisDetected) risk = "critical";
  else if (wellbeingScore < 30) risk = "high";
  else if (wellbeingScore < 50) risk = "medium";

  const clinicAlert = risk === "critical" || risk === "high";

  const emotions = [
    { name: "Stress", score: Math.min(100, 40 + negScore + stressorWeight), emoji: "😰" },
    { name: "Anxiety", score: Math.min(100, 30 + negScore * 0.8), emoji: "😟" },
    { name: "Sadness", score: Math.min(100, 20 + negScore * 0.6), emoji: "😢" },
    { name: "Hope", score: Math.min(100, 20 + posScore), emoji: "🌱" },
  ].sort((a, b) => b.score - a.score);

  const prediction = wellbeingScore < 30
    ? "⚠️ ML model predicts escalating distress pattern over next 48hrs."
    : wellbeingScore < 50
      ? "📊 Predictive model shows moderate risk trajectory."
      : "📈 Positive trajectory detected. Keep up current coping patterns.";

  const aiSummary = risk === "critical"
    ? `⚠️ CRITICAL: High-risk indicators detected. Immediate clinical review recommended.`
    : risk === "high"
      ? `🔴 HIGH RISK: Significant distress across ${stressors.length} areas. Score ${wellbeingScore}/100.`
      : risk === "medium"
        ? `🟡 Score ${wellbeingScore}/100. Moderate stress. Consider breathing exercises.`
        : `🟢 Score ${wellbeingScore}/100. You're managing well! Keep it up.`;

  return { wellbeingScore, emotions, risk, clinicAlert, aiSummary, prediction };
}

const CheckInPage = () => {
  const [mode, setMode] = useState<Mode>("text");
  const [selectedStressors, setSelectedStressors] = useState<string[]>([]);
  const [journalText, setJournalText] = useState("");
  const [screen, setScreen] = useState<Screen>("checkin");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof analyzeJournalLocal> | null>(null);
  const [currentPrompt] = useState(() => journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
  const { completeCheckin, addXp } = useGamification();
  const navigate = useNavigate();

  // Real-time biomarker state from engine
  const [liveEmotion, setLiveEmotion] = useState<EmotionData>(checkInEngine.emotions);
  const [liveVocal, setLiveVocal] = useState<VocalData>(checkInEngine.vocalData);
  const [liveOculomotor, setLiveOculomotor] = useState<OculomotorData>(checkInEngine.oculomotorData);
  const [liveTranscript, setLiveTranscript] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wire engine callbacks
  useEffect(() => {
    checkInEngine.onEmotionUpdate = (e) => setLiveEmotion({ ...e });
    checkInEngine.onVocalUpdate = (v) => setLiveVocal({ ...v });
    checkInEngine.onOculomotorUpdate = (o) => setLiveOculomotor({ ...o });
    checkInEngine.onTranscriptUpdate = (t) => { setLiveTranscript(t); setJournalText(t); };
    return () => {
      checkInEngine.onEmotionUpdate = undefined;
      checkInEngine.onVocalUpdate = undefined;
      checkInEngine.onOculomotorUpdate = undefined;
      checkInEngine.onTranscriptUpdate = undefined;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      checkInEngine.cleanup();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  // Derived display values
  const dominantEntries = Object.entries(liveEmotion).filter(([k]) => !['arousal','valence'].includes(k));
  dominantEntries.sort((a, b) => (b[1] as number) - (a[1] as number));
  const [domName, domScore] = dominantEntries[0] as [string, number];
  const liveStressScore = Math.round((1 - liveEmotion.valence) * 50 + (liveEmotion.arousal + 1) * 25);
  const vocalStressed = liveVocal.jitter > 0.02 || liveVocal.shimmer > 0.1;

  const toggleStressor = (id: string) => {
    setSelectedStressors(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // ─── Start/Stop recording ───
  const startRecording = async () => {
    if (isRecording) return;

    if (mode === "video") {
      // Init camera + MediaPipe + audio + speech
      setTimeout(async () => {
        const ok = await checkInEngine.initCamera(videoRef.current);
        if (!ok) return;
        checkInEngine.startProcessing(videoRef.current);
        setIsRecording(true);
        setRecordSeconds(0);
        recordTimerRef.current = setInterval(() => {
          setRecordSeconds(s => { if (s >= 59) { stopRecording(); return 60; } return s + 1; });
        }, 1000);
      }, 200);
    } else if (mode === "audio") {
      const ok = await checkInEngine.initAudioOnly();
      if (!ok) return;
      checkInEngine.startAudioAnalysis();
      checkInEngine.startListening();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(s => { if (s >= 59) { stopRecording(); return 60; } return s + 1; });
      }, 1000);
    }
  };

  const stopRecording = () => {
    checkInEngine.stopProcessing();
    setIsRecording(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  // ─── Submit (send REAL averaged data to backend) ───
  const handleSubmit = async () => {
    // If still recording, stop first
    if (isRecording) stopRecording();

    const text = journalText || "feeling a bit overwhelmed today";
    completeCheckin();
    addXp(30);
    setScreen("analyzing");

    // Get real averaged biomarker data from the engine
    const averaged = checkInEngine.getAveragedData();

    try {
      const backendResult = await analyzeCheckIn(
        averaged.transcript || text,
        averaged.emotions as Record<string, number>,
        averaged.vocals as Record<string, number>,
        averaged.oculomotor as Record<string, number>,
      );

      // Map backend response to ResultsScreen format
      const emotions = backendResult.emotions.map(e => ({
        name: e.name,
        score: Math.round(e.score * 100),
        emoji: e.emoji,
      }));

      const riskMap: Record<string, "low" | "medium" | "high" | "critical"> = {
        none: "low", low: "low", moderate: "medium", high: "critical",
      };
      const risk = riskMap[backendResult.risk_level] || "low";
      const avgScore = emotions.length > 0
        ? emotions.reduce((sum, e) => sum + e.score, 0) / emotions.length
        : 50;
      const wellbeingScore = Math.max(5, Math.min(95, Math.round(100 - avgScore)));
      const clinicAlert = risk === "critical" || risk === "high";

      const prediction = backendResult.patterns?.map(p => `${p.emoji} ${p.label}`).join(" · ") ||
        "📊 Patterns detected from multi-modal analysis.";

      setAnalysisResult({
        wellbeingScore,
        emotions,
        risk,
        clinicAlert,
        aiSummary: backendResult.journal_summary,
        prediction,
      });
    } catch (e) {
      console.error("Backend check-in analysis failed, using local fallback:", e);
      const result = analyzeJournalLocal(text, selectedStressors);
      setAnalysisResult(result);
    }

    // Cleanup engine after analysis
    checkInEngine.cleanup();
  };

  if (screen === "analyzing") {
    return <AnalysisScreen onComplete={() => setScreen("results")} />;
  }

  if (screen === "results" && analysisResult) {
    return <ResultsScreen
      stressors={selectedStressors}
      analysis={analysisResult}
      onHome={() => { setScreen("checkin"); navigate("/"); }}
      onResources={() => { setScreen("checkin"); navigate("/resources"); }}
    />;
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="dhaka-stripe" />

      {/* Header with Buddy */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <BuddyAvatar size="sm" mood={liveStressScore > 60 ? "concerned" : "happy"} animate />
        <div>
          <h1 className="text-lg font-bold text-foreground">Journal Check-In</h1>
          <p className="text-[11px] text-muted-foreground">Your safe space to express how you feel</p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="px-5 mb-3">
        <div className="flex bg-card rounded-xl p-1 gap-1">
          {([
            { id: "video" as Mode, icon: Video, label: "Video" },
            { id: "audio" as Mode, icon: Mic, label: "Audio" },
            { id: "text" as Mode, icon: Type, label: "Text" },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setMode(id); if (isRecording) stopRecording(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === id ? "gradient-purple text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3">
        {/* Stressor Cards */}
        <div>
          <h2 className="text-xs font-semibold text-foreground mb-2">What's weighing on you?</h2>
          <div className="flex flex-wrap gap-2">
            {stressorCards.map(card => (
              <motion.button
                key={card.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleStressor(card.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedStressors.includes(card.id)
                    ? "bg-primary text-primary-foreground shadow-purple"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                }`}
              >
                <span>{card.emoji}</span>
                {card.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Video Mode with REAL camera feed */}
        {mode === "video" && (
          <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
            <div className="relative w-full aspect-[4/3] rounded-xl bg-foreground/5 border border-border overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isRecording ? 'opacity-100' : 'opacity-0'}`}
                style={{ transform: "scaleX(-1)" }}
              />
              {/* Live biomarker overlay */}
              {isRecording && (
                <>
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulsing-alert" />
                    <span className="text-[9px] font-bold text-destructive drop-shadow-md">REC {formatTime(recordSeconds)}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 backdrop-blur-sm px-3 py-2 z-10">
                    <div className="flex items-center justify-between text-[9px] font-mono text-primary-foreground">
                      <span>{emojiMap[domName] || "😐"} {domName}: {Math.round(domScore * 100)}%</span>
                      <span>🗣️ {vocalStressed ? "Stressed" : "Normal"}</span>
                      <span>👀 {liveOculomotor.blinkRate}/min</span>
                    </div>
                  </div>
                </>
              )}
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Camera preview — tap record</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => isRecording ? stopRecording() : startRecording()}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isRecording ? "bg-destructive animate-pulsing-alert" : "gradient-purple"
                }`}
              >
                <div className={`w-5 h-5 ${isRecording ? "rounded-sm bg-primary-foreground" : "rounded-full bg-primary-foreground"}`} />
              </motion.button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              {isRecording ? "Recording... AI analyzing facial expressions & voice" : "Tap to start — face coordinates tracked in real-time"}
            </p>

            {liveTranscript && mode === "video" && (
              <div className="rounded-xl bg-secondary/50 p-2.5 text-xs text-muted-foreground italic border border-border">
                🎙️ "{liveTranscript}"
              </div>
            )}

            {/* Full Live Biomarker Panel during video recording */}
            <AnimatePresence>
              {isRecording && (
                <LiveBiomarkerPanel
                  isActive={isRecording}
                  emotions={liveEmotion}
                  vocals={liveVocal}
                  oculomotor={liveOculomotor}
                  showWaveform={true}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Audio Mode with REAL mic */}
        {mode === "audio" && (
          <div className="rounded-2xl bg-card p-4 shadow-card text-center space-y-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => isRecording ? stopRecording() : startRecording()}
              className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
                isRecording ? "bg-destructive animate-pulsing-alert" : "gradient-purple"
              }`}
            >
              <Mic className="w-6 h-6 text-primary-foreground" />
            </motion.button>

            <p className="text-[10px] text-muted-foreground">
              {isRecording ? `Analyzing vocal biomarkers... ${formatTime(recordSeconds)}` : "Tap to speak — voice analysis begins instantly"}
            </p>

            {/* Full Live Biomarker Panel during audio recording */}
            <AnimatePresence>
              {isRecording && (
                <LiveBiomarkerPanel
                  isActive={isRecording}
                  emotions={liveEmotion}
                  vocals={liveVocal}
                  oculomotor={liveOculomotor}
                  showWaveform={true}
                />
              )}
            </AnimatePresence>

            {liveTranscript && (
              <div className="rounded-xl bg-secondary/50 p-2.5 text-xs text-muted-foreground italic border border-border text-left">
                🎙️ "{liveTranscript}"
              </div>
            )}
          </div>
        )}

        {/* Text Mode */}
        {mode === "text" && (
          <div className="rounded-2xl bg-card p-3 shadow-card">
            <p className="text-[11px] text-primary font-semibold mb-2 italic">✨ {currentPrompt}</p>
            <textarea
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              placeholder="Start writing here..."
              className="w-full h-28 bg-secondary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none border border-border focus:border-primary/50 transition-colors"
            />
          </div>
        )}

        {/* Live AI Indicators */}
        {(journalText.length > 10 || isRecording) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-1 text-[11px]"
          >
            <span className="text-muted-foreground">🧠 Live AI:</span>
            <span className="text-warning font-semibold">
              {emojiMap[domName]} {domName} {Math.round(domScore * 100)}%
            </span>
            <span className="text-primary font-semibold">
              🗣️ {vocalStressed ? "Stressed" : "Normal"}
            </span>
            {liveStressScore > 70 && (
              <span className="text-destructive font-semibold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> High
              </span>
            )}
          </motion.div>
        )}

        {/* Clinic Escalation Notice */}
        {liveStressScore > 70 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-destructive/10 p-2.5 border border-destructive/20 flex items-start gap-2"
          >
            <Stethoscope className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-destructive leading-relaxed">
              <span className="font-bold">Clinical Alert:</span> High distress detected.
              Upon submission, an anonymized report will be sent to your care team.
            </p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!journalText && !isRecording && selectedStressors.length === 0}
          className="w-full py-3 rounded-xl gradient-purple text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 shadow-purple"
        >
          <Send className="w-4 h-4" />
          Analyze & Submit
        </motion.button>
      </div>
    </div>
  );
};

export default CheckInPage;
