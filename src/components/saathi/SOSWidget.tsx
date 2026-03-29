import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Mic, MicOff, Phone, Stethoscope, Shield } from "lucide-react";
import { BuddyAvatar } from "@/components/BuddyAvatar";
import { useNavigate } from "react-router-dom";

const crisisWords = ["suicide", "kill myself", "end my life", "want to die", "self-harm", "cut myself", "no reason to live", "hurt myself", "give up", "can't go on", "end it all"];

export function SOSWidget() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout>();

  // Simulate voice transcription
  const simulatedPhrases = [
    "I've been feeling really down lately",
    "everything feels hopeless",
    "I don't know if I can go on",
    "I want to give up on everything",
  ];

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    setCrisisDetected(false);
    setReportSent(false);

    let phraseIdx = 0;
    let currentText = "";

    timerRef.current = setInterval(() => {
      if (phraseIdx < simulatedPhrases.length) {
        currentText += (currentText ? "... " : "") + simulatedPhrases[phraseIdx];
        setTranscript(currentText);

        const lower = currentText.toLowerCase();
        const detected = crisisWords.some(w => lower.includes(w));
        if (detected) {
          setCrisisDetected(true);
          setTimeout(() => {
            setReportSent(true);
            setIsListening(false);
            clearInterval(timerRef.current);
          }, 1500);
        }
        phraseIdx++;
      } else {
        setIsListening(false);
        clearInterval(timerRef.current);
      }
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
    clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden shadow-card">
      {/* Header */}
      <div className="gradient-danger px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-destructive-foreground" />
          <span className="text-sm font-bold text-destructive-foreground">SOS Quick Help</span>
        </div>
        <button
          onClick={() => navigate("/emergency")}
          className="text-[10px] text-destructive-foreground/80 underline"
        >
          Full SOS →
        </button>
      </div>

      <div className="bg-card p-4">
        {/* Voice trigger */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isListening ? stopListening : startListening}
            className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
              isListening ? "bg-destructive animate-pulsing-alert" : "bg-destructive/10 hover:bg-destructive/20"
            } transition-colors`}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 text-destructive-foreground" />
            ) : (
              <Mic className="w-6 h-6 text-destructive" />
            )}
          </motion.button>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">
              {isListening ? "Listening..." : "Tap to talk — AI monitors for distress"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Auto-alerts your care team if critical signals detected
            </p>
          </div>

          <BuddyAvatar size="sm" mood={crisisDetected ? "concerned" : isListening ? "calm" : "happy"} animate={isListening} />
        </div>

        {/* Transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground italic border border-border">
                "{transcript}"
              </div>

              {/* Live waveform */}
              {isListening && (
                <div className="flex justify-center gap-0.5 mt-2 h-6 items-center">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [3, Math.random() * 20 + 4, 3] }}
                      transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.03 }}
                      className="w-1 bg-destructive/40 rounded-full"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crisis detected */}
        <AnimatePresence>
          {crisisDetected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 rounded-xl bg-destructive/10 border border-destructive/30 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-xs font-bold text-destructive">
                  {reportSent ? "🚨 Clinical Report Sent" : "⚠️ Distress Detected..."}
                </span>
              </div>
              {reportSent && (
                <p className="text-[10px] text-muted-foreground">
                  An anonymized report has been sent to your care team. They'll review within 24 hours.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions */}
        <div className="flex gap-2 mt-3">
          <a
            href="tel:988"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
          >
            <Phone className="w-3 h-3" /> Call 988
          </a>
          <button
            onClick={() => navigate("/emergency")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            <Stethoscope className="w-3 h-3" /> Exercises
          </button>
        </div>
      </div>
    </div>
  );
}
