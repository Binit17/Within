import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, Video, Smile, BookOpen, AlertTriangle, Camera, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FacialCoordinates } from "@/components/saathi/FacialCoordinates";
import { LiveBiomarkerPanel } from "@/components/LiveBiomarkerPanel";
import { useGamification } from "@/hooks/useGamification";
import {
  createSession,
  endSession,
  sendChat,
  type SessionData,
} from "@/lib/api";
import { checkInEngine, type EmotionData, type VocalData, type OculomotorData } from "@/lib/checkInEngine";
import buddyImg from "@/assets/buddy-puppy.png";

interface Message {
  id: number;
  role: "user" | "buddy";
  text: string;
  emotion?: string;
  timestamp: Date;
  suggestion?: { label: string; route: string };
  alert?: boolean;
}

type InputMode = "text" | "audio" | "video";

// Emoji map for dominant emotion display
const emojiMap: Record<string, string> = {
  happy: "😊", sad: "😢", angry: "😠", fearful: "😨",
  disgusted: "🤢", surprised: "😮", neutral: "😐",
};

function getDominantEmotion(emotions: EmotionData): { name: string; emoji: string; score: number } {
  const entries = Object.entries(emotions).filter(([k]) => !['arousal','valence'].includes(k));
  entries.sort((a, b) => (b[1] as number) - (a[1] as number));
  const [name, score] = entries[0] as [string, number];
  return { name, emoji: emojiMap[name] || "😐", score: Math.round(score * 100) };
}

const ChatPage = () => {
  const navigate = useNavigate();
  const { completeSession } = useGamification();

  // Session state
  const [session, setSession] = useState<SessionData | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "buddy",
      text: "Hey there! 🐾 I'm Buddy, your wellness companion. How are you feeling today? You can type, record audio, or even show me through video!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [isRecording, setIsRecording] = useState(false);
  const [showFacialCoords, setShowFacialCoords] = useState(false);
  const [showBioPanel, setShowBioPanel] = useState(false);
  const [clinicAlerted, setClinicAlerted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Live biomarker display — driven by real engine
  const [liveEmotion, setLiveEmotion] = useState<EmotionData>(checkInEngine.emotions);
  const [liveVocal, setLiveVocal] = useState<VocalData>(checkInEngine.vocalData);
  const [liveOculomotor, setLiveOculomotor] = useState<OculomotorData>(checkInEngine.oculomotorData);
  const [liveTranscript, setLiveTranscript] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Wire engine callbacks to React state
  useEffect(() => {
    checkInEngine.onEmotionUpdate = (e) => setLiveEmotion({ ...e });
    checkInEngine.onVocalUpdate = (v) => setLiveVocal({ ...v });
    checkInEngine.onOculomotorUpdate = (o) => setLiveOculomotor({ ...o });
    checkInEngine.onTranscriptUpdate = (t) => setLiveTranscript(t);
    return () => {
      checkInEngine.onEmotionUpdate = undefined;
      checkInEngine.onVocalUpdate = undefined;
      checkInEngine.onOculomotorUpdate = undefined;
      checkInEngine.onTranscriptUpdate = undefined;
    };
  }, []);

  // Create a backend session on mount
  useEffect(() => {
    let cancelled = false;
    createSession("Isha Thapa")
      .then((s) => {
        if (!cancelled) {
          setSession(s);
          setBackendOnline(true);
        }
      })
      .catch(() => {
        if (!cancelled) setBackendOnline(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Cleanup engine on unmount
  useEffect(() => {
    return () => {
      checkInEngine.cleanup();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  // Derived biomarker display values
  const dominant = getDominantEmotion(liveEmotion);
  const vocalStressed = liveVocal.jitter > 0.02 || liveVocal.shimmer > 0.1;
  const vocalLabel = (vocalStressed ? "Stressed" : "Normal") + (liveVocal.meanF0 > 0 ? ` · ${Math.round(liveVocal.meanF0)}Hz` : "");

  // End session handler
  const handleEndSession = useCallback(async () => {
    if (!session || sessionEnded) return;
    checkInEngine.cleanup();
    try {
      const result = await endSession(session.id);
      setSessionEnded(true);
      completeSession();

      if (result.village.leveled_up) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "buddy",
            text: `🎉 Your village just grew to Level ${result.village.level}! You've completed ${result.village.sessions_completed} conversations. Keep going! 🏘️`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "buddy",
            text: `Session ended! 🐾 Your village is Level ${result.village.level} with ${result.village.sessions_completed} conversations completed. See you next time! 🌿`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (e) {
      console.error("End session failed:", e);
    }
  }, [session, sessionEnded, completeSession]);

  // Send message to backend with REAL biomarker data
  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = overrideText || input;
      if (!text.trim()) return;

      const userMsg: Message = { id: Date.now(), role: "user", text, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // Grab current real biomarker snapshots from the engine
      const emotionSnapshot = {
        timestamp: Date.now() / 1000,
        ...checkInEngine.emotions,
      };
      const vocalMetrics = {
        timestamp: Date.now() / 1000,
        jitter: checkInEngine.vocalData.jitter,
        shimmer: checkInEngine.vocalData.shimmer,
        mean_f0: checkInEngine.vocalData.meanF0,
        energy: checkInEngine.vocalData.energy,
      };
      const oculomotorSnapshot = {
        timestamp: Date.now() / 1000,
        blink_rate: checkInEngine.oculomotorData.blinkRate,
        gaze_avoidance_pct: checkInEngine.oculomotorData.gazeAvoidancePct,
      };

      if (!session || !backendOnline) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              role: "buddy",
              text: "I'm having trouble connecting right now. Please make sure the backend server is running (uvicorn on port 8000). 🔧",
              timestamp: new Date(),
              alert: true,
            },
          ]);
          setIsTyping(false);
        }, 800);
        return;
      }

      try {
        const response = await sendChat(
          session.id,
          text,
          emotionSnapshot,
          vocalMetrics,
          oculomotorSnapshot,
        );

        if (response.risk_level === "high" && !clinicAlerted) {
          setClinicAlerted(true);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "buddy",
            text: response.reply,
            timestamp: new Date(),
            alert: response.risk_level === "high",
            suggestion:
              response.risk_level === "high"
                ? { label: "🚨 Talk to someone now", route: "/resources" }
                : undefined,
          },
        ]);
      } catch (e) {
        console.error("Chat error:", e);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "buddy",
            text: "Sorry, I ran into an issue. Let me try again in a moment. 🐾",
            timestamp: new Date(),
            alert: true,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, session, backendOnline, clinicAlerted]
  );

  // ─── Audio Recording (real mic + speech recognition + vocal analysis) ───
  const startAudioRecording = useCallback(async () => {
    if (isRecording) return;
    const ok = await checkInEngine.initAudioOnly();
    if (!ok) return;
    checkInEngine.startAudioAnalysis();
    checkInEngine.startListening();
    setIsRecording(true);
    setRecordSeconds(0);
    setLiveTranscript("");
    recordTimerRef.current = setInterval(() => {
      setRecordSeconds((s) => {
        if (s >= 59) {
          // Auto-stop after 60s
          stopAudioRecording();
          return 60;
        }
        return s + 1;
      });
    }, 1000);
  }, [isRecording]);

  const stopAudioRecording = useCallback(() => {
    checkInEngine.stopAudioAnalysis();
    checkInEngine.stopListening();
    setIsRecording(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }

    // Send transcript as chat message
    const transcript = checkInEngine.transcript.trim();
    if (transcript) {
      sendMessage(transcript);
    }
  }, [sendMessage]);

  const toggleAudioRecording = () => {
    if (isRecording) stopAudioRecording();
    else startAudioRecording();
  };

  // ─── Video Recording (real camera + MediaPipe + speech + vocal) ───
  const startVideoRecording = useCallback(async () => {
    if (isRecording) return;
    setShowFacialCoords(true);

    // Wait a tick for videoRef to mount
    setTimeout(async () => {
      const ok = await checkInEngine.initCamera(videoRef.current);
      if (!ok) return;
      checkInEngine.startProcessing(videoRef.current);
      setIsRecording(true);
      setRecordSeconds(0);
      setLiveTranscript("");
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 59) {
            stopVideoRecording();
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    }, 200);
  }, [isRecording]);

  const stopVideoRecording = useCallback(() => {
    checkInEngine.stopProcessing();
    setIsRecording(false);
    setShowFacialCoords(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }

    const transcript = checkInEngine.transcript.trim();
    if (transcript) {
      sendMessage(transcript);
    }

    // Stop camera tracks
    if (checkInEngine.mediaStream) {
      checkInEngine.mediaStream.getTracks().forEach(t => t.stop());
    }
  }, [sendMessage]);

  const toggleVideo = () => {
    if (isRecording) stopVideoRecording();
    else startVideoRecording();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20">
      {/* Header */}
      <div className="gradient-buddy px-5 pt-5 pb-3 flex items-center gap-3 shadow-buddy rounded-b-3xl">
        <img src={buddyImg} alt="Buddy" className="w-10 h-10 object-contain" />
        <div className="flex-1">
          <h2 className="font-bold text-primary-foreground text-sm">Buddy</h2>
          <p className="text-[10px] text-primary-foreground/70">
            {!backendOnline
              ? "⚠️ Offline"
              : isTyping
              ? "thinking..."
              : isRecording
              ? "listening..."
              : "Online 🐾"}
          </p>
        </div>
        {/* Mode toggle */}
        <div className="flex gap-1">
          {[
            { mode: "text" as InputMode, icon: Smile },
            { mode: "audio" as InputMode, icon: Mic },
            { mode: "video" as InputMode, icon: Camera },
          ].map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => { setInputMode(mode); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                inputMode === mode ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <Icon className="w-4 h-4 text-primary-foreground" />
            </button>
          ))}
        </div>
        {session && !sessionEnded && (
          <button
            onClick={handleEndSession}
            className="px-3 py-1.5 rounded-full bg-white/20 text-[10px] font-bold text-primary-foreground hover:bg-white/30 transition-colors"
          >
            End Session
          </button>
        )}
      </div>

      {/* Real-time Biomarker Bar (clickable toggle) */}
      <button
        onClick={() => setShowBioPanel((p) => !p)}
        className="w-full flex items-center gap-3 px-5 py-1.5 bg-muted/50 text-[10px] font-semibold text-muted-foreground font-mono-bio hover:bg-muted/80 transition-colors"
      >
        <Activity className="w-3 h-3 text-primary" />
        <span>{dominant.emoji} {dominant.name}: {dominant.score}%</span>
        <span>🗣️ {vocalLabel}</span>
        <span>👀 {liveOculomotor.blinkRate}/min · {liveOculomotor.gazeAvoidancePct}% off</span>
        {!backendOnline && (
          <span className="text-destructive ml-auto">⚠️ Backend offline</span>
        )}
        <span className="ml-auto">
          {showBioPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>

      {/* Expandable Live Biomarker Panel */}
      <AnimatePresence>
        {showBioPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 py-2 overflow-hidden"
          >
            <LiveBiomarkerPanel
              isActive={isRecording}
              emotions={liveEmotion}
              vocals={liveVocal}
              oculomotor={liveOculomotor}
              showWaveform={isRecording}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clinic alert banner */}
      <AnimatePresence>
        {clinicAlerted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-destructive/10 border-b border-destructive/20 px-5 py-2 flex items-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <p className="text-[10px] text-destructive font-semibold">
              Clinical report sent to your care team
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video overlay with REAL camera feed */}
      <AnimatePresence>
        {showFacialCoords && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 220, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-card border-b border-border relative"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full rounded-xl object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {isRecording && (
              <div className="absolute top-4 left-6 flex items-center gap-1.5 z-10">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulsing-alert" />
                <span className="text-[9px] font-bold text-destructive drop-shadow-md">
                  REC {formatTime(recordSeconds)}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live transcript during recording */}
      <AnimatePresence>
        {isRecording && liveTranscript && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="px-5 py-2 bg-secondary/50 border-b border-border"
          >
            <p className="text-[10px] text-muted-foreground">🎙️ Live transcript:</p>
            <p className="text-xs text-foreground italic">"{liveTranscript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
            >
              {msg.role === "buddy" && (
                <img
                  src={buddyImg}
                  alt="Buddy"
                  className="w-8 h-8 object-contain mr-2 mt-1 flex-shrink-0"
                />
              )}
              <div
                className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "gradient-buddy text-primary-foreground rounded-br-md"
                    : msg.alert
                    ? "bg-destructive/10 text-foreground rounded-bl-md shadow-card border border-destructive/20"
                    : "bg-card text-foreground rounded-bl-md shadow-card"
                }`}
              >
                {msg.text}
                {msg.emotion && <span className="ml-1">{msg.emotion}</span>}
              </div>
            </div>
            {msg.suggestion && (
              <div className="ml-12 mt-1">
                <button
                  onClick={() => navigate(msg.suggestion!.route)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-colors"
                >
                  <BookOpen className="w-3 h-3" />
                  {msg.suggestion.label}
                </button>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-slide-up">
            <img
              src={buddyImg}
              alt="Buddy"
              className="w-8 h-8 object-contain mr-2 mt-1 flex-shrink-0"
            />
            <div className="bg-card px-4 py-3 rounded-2xl rounded-bl-md shadow-card">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Journal Quick Entry */}
      <div className="px-4 pb-1">
        <button
          onClick={() => navigate("/journal")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/50 border border-border text-xs font-semibold text-accent-foreground hover:bg-accent transition-colors"
        >
          <span>📓</span> Open full journal for deeper check-in
          <span className="ml-auto text-muted-foreground">→</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="px-4 pb-3 pt-2 bg-card border-t border-border">
        {inputMode === "text" && (
          <div className="flex items-center gap-2 bg-muted rounded-2xl px-3 py-2">
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder={sessionEnded ? "Session ended" : "Tell Buddy how you feel..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={sessionEnded}
            />
            <Button
              size="icon"
              className="rounded-full w-8 h-8 gradient-buddy"
              onClick={() => sendMessage()}
              disabled={!input.trim() || sessionEnded}
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </Button>
          </div>
        )}

        {inputMode === "audio" && (
          <div className="flex items-center gap-3 justify-center">
            {isRecording && (
              <div className="flex gap-0.5 items-center h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [3, Math.random() * 24 + 4, 3] }}
                    transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.03 }}
                    className="w-1 bg-primary/60 rounded-full"
                  />
                ))}
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleAudioRecording}
              disabled={sessionEnded}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isRecording ? "bg-destructive animate-pulsing-alert" : "gradient-buddy shadow-buddy"
              }`}
            >
              <Mic className="w-6 h-6 text-primary-foreground" />
            </motion.button>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">
                {isRecording ? `Listening... ${formatTime(recordSeconds)}` : "Tap to speak"}
              </p>
              {isRecording && (
                <p className="text-[9px] text-primary">Jitter: {(liveVocal.jitter * 100).toFixed(1)}% · Shimmer: {(liveVocal.shimmer * 100).toFixed(1)}%</p>
              )}
            </div>
          </div>
        )}

        {inputMode === "video" && (
          <div className="flex items-center gap-3 justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleVideo}
              disabled={sessionEnded}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isRecording
                  ? "bg-destructive animate-pulsing-alert"
                  : "gradient-purple shadow-purple"
              }`}
            >
              <Video className="w-6 h-6 text-primary-foreground" />
            </motion.button>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">
                {isRecording ? `Recording... ${formatTime(recordSeconds)}` : "Tap to start video"}
              </p>
              {isRecording && (
                <p className="text-[9px] text-primary">
                  {dominant.emoji} {dominant.name} {dominant.score}% · Blinks: {liveOculomotor.blinkRate}/min
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
