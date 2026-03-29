import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, Phone, Video, MessageCircle, Stethoscope, ArrowRight, X, BookOpen, Moon, Music, Users, Target, Brain, Volume2, VolumeX, CheckCircle2, Send, Shield, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import buddyImg from "@/assets/buddy-puppy.png";

type Category = "all" | "crisis" | "breathing" | "therapy" | "self-care" | "connect";

const categories: { id: Category; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "crisis", label: "Crisis", emoji: "🚨" },
  { id: "connect", label: "Connect", emoji: "👨‍⚕️" },
  { id: "breathing", label: "Exercises", emoji: "🧘" },
  { id: "therapy", label: "Therapy", emoji: "🧠" },
  { id: "self-care", label: "Self-Care", emoji: "💚" },
];

const resources = [
  { emoji: "🚨", title: "Emergency Helpline", description: "988 Suicide & Crisis Lifeline — 24/7", category: "crisis" as Category, action: "tel:988", actionLabel: "Call Now", color: "bg-destructive/10 border-destructive/20" },
  { emoji: "🇳🇵", title: "Nepal Crisis Line", description: "Call 1166 — Free, confidential", category: "crisis" as Category, action: "tel:1166", actionLabel: "Call Now", color: "bg-destructive/10 border-destructive/20" },
  { emoji: "💬", title: "Peer Support", description: "Anonymous group chat", category: "connect" as Category, action: "peer", actionLabel: "Join", color: "bg-success/10 border-success/20" },
  { emoji: "🧘", title: "Breathing", description: "4-7-8, Box & more", category: "breathing" as Category, action: "/breathing", actionLabel: "Start", color: "bg-mint-light border-mint/20" },
  { emoji: "🧠", title: "Body Scan", description: "Head-to-toe relaxation", category: "breathing" as Category, action: "bodyscan", actionLabel: "Start", color: "bg-lavender-light border-lavender/20" },
  { emoji: "🎯", title: "5-4-3-2-1", description: "Grounding for panic", category: "breathing" as Category, action: "grounding", actionLabel: "Start", color: "bg-coral-light border-coral/20" },
  { emoji: "📓", title: "CBT Journal", description: "Challenge negative thoughts", category: "therapy" as Category, action: "/journal", actionLabel: "Open", color: "bg-primary/10 border-primary/20" },
  { emoji: "🌿", title: "Burnout Guide", description: "Recognize & recover", category: "therapy" as Category, action: "burnout", actionLabel: "Read", color: "bg-success/10 border-success/20" },
  { emoji: "🌙", title: "Sleep Hygiene", description: "Improve sleep quality", category: "self-care" as Category, action: "sleep", actionLabel: "Read", color: "bg-lavender-light border-lavender/20" },
  { emoji: "🎵", title: "Calm Sounds", description: "Lo-fi & nature sounds", category: "self-care" as Category, action: "sounds", actionLabel: "Listen", color: "bg-sky-light border-sky/20" },
];

type InlineType = "steps" | "guided" | "sounds" | "chat";

interface InlineResource {
  title: string;
  type: InlineType;
  steps: string[];
}

const inlineContent: Record<string, InlineResource> = {
  bodyscan: {
    title: "Guided Body Scan",
    type: "guided",
    steps: [
      "Find a quiet, comfortable spot. Close your eyes.",
      "Take 3 deep breaths to settle in.",
      "Focus on your toes — notice any tension. Relax them.",
      "Move slowly up: feet → calves → thighs → hips.",
      "Continue: belly → chest → hands → arms → shoulders.",
      "Scan your neck, jaw, face. Release any tightness.",
      "Notice your whole body as one. Breathe deeply.",
      "Open your eyes gently when ready. You did great! 🌟",
    ],
  },
  grounding: {
    title: "5-4-3-2-1 Grounding",
    type: "guided",
    steps: [
      "👀 Name 5 things you can SEE around you.",
      "✋ Touch 4 things — feel their textures.",
      "👂 Listen for 3 sounds — distant or close.",
      "👃 Notice 2 things you can SMELL.",
      "👅 Notice 1 thing you can TASTE.",
      "Take a slow breath. You're here. You're safe. 💚",
    ],
  },
  burnout: {
    title: "Burnout Recovery Guide",
    type: "steps",
    steps: [
      "🔍 Recognize: exhaustion, cynicism, reduced performance.",
      "⏸️ Pause: take a real break — even 10 minutes counts.",
      "📋 Prioritize: list tasks, cut what's not essential.",
      "🗣️ Talk: share your feelings with someone you trust.",
      "🌿 Restore: walk in nature, sleep more, eat well.",
      "⏰ Boundaries: set work hours. Protect your off-time.",
      "💚 Seek help if it persists — you deserve support.",
    ],
  },
  sleep: {
    title: "Sleep Hygiene Guide",
    type: "steps",
    steps: [
      "🌅 Wake up at the same time every day.",
      "☀️ Get sunlight within 30 min of waking up.",
      "☕ No caffeine after 2 PM.",
      "📱 Screen off 1 hour before bed.",
      "🛁 Warm shower/bath 90 min before sleep.",
      "🌡️ Keep room cool: 65–68°F / 18–20°C.",
      "🧘 Try a body scan or breathing in bed.",
      "📖 Can't sleep after 20 min? Get up and read.",
    ],
  },
  sounds: {
    title: "Focus & Calm Sounds",
    type: "sounds",
    steps: [
      "🌧️ Rain Sounds",
      "🌊 Ocean Waves",
      "🎹 Lo-fi Beats",
      "🐦 Forest Birds",
      "🔥 Fireplace Crackling",
      "🎶 White Noise",
    ],
  },
  peer: {
    title: "Peer Support Group",
    type: "chat",
    steps: [],
  },
};

// Guided exercise component with timed steps
function GuidedExercise({ data, onClose }: { data: InlineResource; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
  const [completed, setCompleted] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const isStarted = currentStep >= 0;
  const isFinished = completed.length === data.steps.length;

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const startExercise = () => {
    setCurrentStep(0);
    setCompleted([]);
  };

  const completeStep = () => {
    setCompleted(prev => [...prev, currentStep]);
    if (currentStep < data.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(-1); // finished
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-foreground">{data.title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-full bg-muted hover:bg-muted/80">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {!isStarted && !isFinished && (
        <div className="text-center py-6">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-20 mx-auto rounded-full gradient-buddy flex items-center justify-center mb-4"
          >
            <span className="text-3xl">🧘</span>
          </motion.div>
          <p className="text-sm text-muted-foreground mb-4">Ready to begin? Follow each step at your own pace.</p>
          <button onClick={startExercise} className="px-6 py-2.5 rounded-xl gradient-buddy text-primary-foreground font-bold text-sm">
            Begin Exercise
          </button>
        </div>
      )}

      {isStarted && (
        <div className="space-y-3">
          {data.steps.map((step, i) => {
            const isDone = completed.includes(i);
            const isCurrent = i === currentStep;
            return (
              <motion.div
                key={i}
                initial={isCurrent ? { opacity: 0, y: 10 } : {}}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 items-start p-3 rounded-xl transition-all ${
                  isCurrent ? "bg-primary/10 border border-primary/20" : isDone ? "bg-success/5 opacity-70" : "opacity-30"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDone ? "bg-success/20" : isCurrent ? "gradient-buddy" : "bg-muted"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <span className="text-[11px] font-bold text-primary-foreground">{i + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step}</p>
                  {isCurrent && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={completeStep}
                      className="mt-2 px-4 py-1.5 rounded-lg gradient-buddy text-primary-foreground text-xs font-bold"
                    >
                      {i < data.steps.length - 1 ? "Next →" : "Complete ✓"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {isFinished && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
          <span className="text-5xl block mb-3">🌟</span>
          <h3 className="text-lg font-bold text-foreground mb-1">Well done!</h3>
          <p className="text-sm text-muted-foreground mb-4">You completed all {data.steps.length} steps. Take a moment to notice how you feel.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={startExercise} className="px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-bold">
              Repeat
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl gradient-buddy text-primary-foreground text-xs font-bold">
              Done
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
        <img src={buddyImg} alt="Buddy" className="w-7 h-7 object-contain" />
        <p className="text-xs text-muted-foreground">
          {isFinished ? "\"Amazing work! I'm so proud of you!\" 🐾" : "\"Take your time. I'm right here with you.\" 🐾"}
        </p>
      </div>
    </div>
  );
}

// Sound player component
function SoundPlayer({ data, onClose }: { data: InlineResource; onClose: () => void }) {
  const [playing, setPlaying] = useState<number | null>(null);
  const [volume, setVolume] = useState(70);

  const soundMeta = [
    { freq: 200, label: "Rain", color: "from-sky-400 to-blue-500" },
    { freq: 150, label: "Ocean", color: "from-cyan-400 to-teal-500" },
    { freq: 300, label: "Lo-fi", color: "from-purple-400 to-indigo-500" },
    { freq: 400, label: "Birds", color: "from-green-400 to-emerald-500" },
    { freq: 100, label: "Fire", color: "from-orange-400 to-red-500" },
    { freq: 250, label: "White", color: "from-gray-400 to-gray-500" },
  ];

  // Generate simple oscillator sound (demo)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const playSound = (index: number) => {
    // Stop current
    stopSound();

    if (playing === index) {
      setPlaying(null);
      return;
    }

    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Use different wave types for variety
      const waves: OscillatorType[] = ["sine", "sine", "triangle", "sine", "sawtooth", "sine"];
      osc.type = waves[index] || "sine";
      osc.frequency.setValueAtTime(soundMeta[index].freq, ctx.currentTime);

      // Add gentle LFO for organic feel
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.3 + index * 0.1, ctx.currentTime);
      lfoGain.gain.setValueAtTime(10 + index * 5, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime((volume / 100) * 0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
      setPlaying(index);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const stopSound = () => {
    try {
      oscRef.current?.stop();
      audioCtxRef.current?.close();
    } catch {}
    oscRef.current = null;
    audioCtxRef.current = null;
  };

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.setValueAtTime((volume / 100) * 0.15, audioCtxRef.current?.currentTime || 0);
    }
  }, [volume]);

  useEffect(() => {
    return () => stopSound();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-foreground">🎵 Focus & Calm Sounds</h2>
        <button onClick={() => { stopSound(); onClose(); }} className="p-1.5 rounded-full bg-muted hover:bg-muted/80">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {data.steps.map((step, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => playSound(i)}
            className={`relative p-4 rounded-2xl border text-left transition-all overflow-hidden ${
              playing === i
                ? "border-primary bg-primary/10 shadow-buddy"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            {playing === i && (
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
              >
                {[...Array(3)].map((_, j) => (
                  <motion.div
                    key={j}
                    className={`absolute bottom-0 w-1 rounded-full bg-gradient-to-t ${soundMeta[i].color}`}
                    style={{ left: `${25 + j * 25}%` }}
                    animate={{ height: ["20%", "60%", "30%", "80%", "20%"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: j * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
            <div className="relative z-10">
              <span className="text-2xl block mb-1">{step.split(" ")[0]}</span>
              <p className="text-sm font-bold text-foreground">{soundMeta[i].label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {playing === i ? "Playing..." : "Tap to play"}
              </p>
            </div>
            {playing === i && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute top-2 right-2"
              >
                <Volume2 className="w-4 h-4 text-primary" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-3 px-2 mb-2">
        <VolumeX className="w-4 h-4 text-muted-foreground" />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none bg-muted accent-primary"
        />
        <Volume2 className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <img src={buddyImg} alt="Buddy" className="w-7 h-7 object-contain" />
        <p className="text-xs text-muted-foreground">"Close your eyes and let the sounds wash over you." 🐾</p>
      </div>
    </div>
  );
}

// Steps display component
function StepsDisplay({ data, onClose }: { data: InlineResource; onClose: () => void }) {
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  const toggleStep = (i: number) => {
    setCheckedSteps(prev => prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-foreground">{data.title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-full bg-muted hover:bg-muted/80">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-2.5">
        {data.steps.map((step, i) => {
          const checked = checkedSteps.includes(i);
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => toggleStep(i)}
              className={`w-full flex gap-3 items-start text-left p-3 rounded-xl transition-all ${
                checked ? "bg-success/10 border border-success/20" : "bg-secondary/50 hover:bg-secondary"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                checked ? "bg-success/20" : "gradient-buddy"
              }`}>
                {checked ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <span className="text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                )}
              </div>
              <p className={`text-sm leading-relaxed transition-all ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}>{step}</p>
            </motion.button>
          );
        })}
      </div>

      {checkedSteps.length === data.steps.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4 p-3 rounded-xl bg-success/10">
          <p className="text-sm font-bold text-success">✨ All steps completed! Great job!</p>
        </motion.div>
      )}

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
        <img src={buddyImg} alt="Buddy" className="w-7 h-7 object-contain" />
        <p className="text-xs text-muted-foreground">"Take your time with this. I'm right here with you." 🐾</p>
      </div>
    </div>
  );
}

// Simulated peer chat with bot peers
const peerNames = ["Anon_Lotus", "CalmMind42", "NightOwl_7", "Sunrise_K", "GentleRain"];
const peerMessages = [
  { from: "CalmMind42", text: "Hey everyone 💚 rough day but glad to be here", time: "2 min ago" },
  { from: "NightOwl_7", text: "Same here. Finals are killing me 😅", time: "1 min ago" },
  { from: "Sunrise_K", text: "You're not alone! I failed an exam last week and it felt like the end of the world, but it's getting better", time: "1 min ago" },
  { from: "GentleRain", text: "Breathing exercises from this app actually helped me during a panic attack yesterday 🙏", time: "just now" },
];

function PeerChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState(peerMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const autoReplies = [
    "That sounds really tough. Sending you strength 💪",
    "I totally get that. You're doing better than you think!",
    "Thanks for sharing. It helps to know I'm not alone ❤️",
    "Have you tried the body scan exercise here? It really helped me calm down.",
    "We're all in this together. One day at a time 🌱",
    "That's brave of you to share. We're here for you 💚",
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const text = input.trim();
    const newMsg = { from: "You", text, time: "just now" };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    // Check for distress keywords and send nudge to clinician
    const distressWords = ["help", "alone", "hopeless", "can't", "panic", "scared", "hurt", "end it", "give up", "no point", "die", "suicide", "kill"];
    const isDistress = distressWords.some(w => text.toLowerCase().includes(w));

    if (isDistress) {
      setTimeout(() => {
        toast("🔔 Nudge sent to your care team", {
          description: "Your message was flagged for support. A clinician has been notified.",
          duration: 5000,
        });
      }, 800);
    } else {
      // Regular nudge — clinician gets activity ping
      setTimeout(() => {
        toast("📤 Message shared with peer group", {
          description: "Your care team can see your peer activity for support.",
          duration: 3000,
        });
      }, 500);
    }

    // Simulate a peer reply
    const replyFrom = peerNames[Math.floor(Math.random() * peerNames.length)];
    setTimeout(() => setTyping(replyFrom), 1000);
    setTimeout(() => {
      setTyping(null);
      const reply = isDistress
        ? "I hear you. Please know you're not alone — have you talked to your clinician? They're here to help 💚"
        : autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setMessages(prev => [...prev, { from: replyFrom, text: reply, time: "just now" }]);
    }, 2500 + Math.random() * 1500);
  };

  return (
    <div className="flex flex-col" style={{ height: "min(65vh, 500px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-buddy flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-foreground">Peer Support</h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-success font-semibold">{peerNames.length} peers online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full bg-muted hover:bg-muted/80">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Safety banner */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/20 mb-3">
        <Shield className="w-3.5 h-3.5 text-success flex-shrink-0" />
        <p className="text-[10px] text-success font-medium">Anonymous & moderated. No personal info shared.</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-3">
        {messages.map((m, i) => {
          const isMe = m.from === "You";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                isMe ? "gradient-buddy text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
              }`}>
                {!isMe && <p className="text-[10px] font-bold text-primary/70 mb-0.5">{m.from}</p>}
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={`text-[9px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </motion.div>
          );
        })}
        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-md px-3.5 py-2.5">
              <p className="text-[10px] font-bold text-primary/70 mb-0.5">{typing}</p>
              <div className="flex gap-1">
                {[0, 1, 2].map(d => (
                  <motion.div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Share what's on your mind..."
          className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-xl gradient-buddy flex items-center justify-center disabled:opacity-40"
        >
          <Send className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}
const ResourcesPage = () => {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [showTeledoc, setShowTeledoc] = useState(false);
  const [activeInline, setActiveInline] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = resources.filter(r => {
    const matchCat = category === "all" || r.category === category;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAction = (action: string) => {
    if (action.startsWith("tel:")) {
      window.open(action, "_self");
    } else if (action.startsWith("/")) {
      navigate(action);
    } else if (action === "teledoc" || action === "therapist") {
      setShowTeledoc(true);
    } else if (inlineContent[action]) {
      setActiveInline(action);
    }
  };

  const inlineData = activeInline ? inlineContent[activeInline] : null;

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="gradient-buddy px-5 pt-6 pb-8 rounded-b-3xl">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-5 h-5 text-primary-foreground" />
            <h1 className="text-xl font-extrabold text-primary-foreground">Resources & Support</h1>
          </div>
          <p className="text-sm text-primary-foreground/80">Your toolkit for mental wellness.</p>
          <div className="flex items-center gap-2 mt-4 bg-white/15 rounded-xl px-3 py-2 backdrop-blur-sm">
            <img src={buddyImg} alt="Buddy" className="w-8 h-8 object-contain" />
            <p className="text-xs text-primary-foreground/90">"You're taking a brave step by looking here. I'm proud of you!" 🐾</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full bg-card rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 transition-colors shadow-card"
          />
        </div>

        {/* Category pills */}
        <div className="overflow-x-auto -mx-5 px-5">
          <div className="flex gap-2 pb-1">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  category === c.id
                    ? "gradient-buddy text-primary-foreground shadow-buddy"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <span>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Connect Banner */}
        {(category === "all" || category === "connect") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden shadow-card border border-primary/10"
          >
            <div className="gradient-hero p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-5 h-5 text-primary-foreground" />
                <h3 className="text-sm font-bold text-primary-foreground">Connect to a Professional</h3>
              </div>
              <p className="text-xs text-primary-foreground/80 mb-3">Book a session with a licensed psychiatrist or therapist.</p>
              <div className="flex gap-2">
                {[
                  { Icon: Video, label: "Video" },
                  { Icon: Phone, label: "Phone" },
                  { Icon: MessageCircle, label: "Chat" },
                ].map(b => (
                  <button
                    key={b.label}
                    onClick={() => setShowTeledoc(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-primary-foreground text-xs font-bold hover:bg-white/30 transition-colors"
                  >
                    <b.Icon className="w-3.5 h-3.5" /> {b.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Resource Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((r, i) => (
            <motion.button
              key={r.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleAction(r.action)}
              className={`rounded-2xl p-4 shadow-card text-left border transition-all hover:scale-[1.03] active:scale-[0.97] flex flex-col items-center gap-2 ${r.color}`}
            >
              <span className="text-3xl">{r.emoji}</span>
              <h3 className="text-sm font-bold text-foreground text-center leading-tight">{r.title}</h3>
              <p className="text-[11px] text-muted-foreground text-center leading-snug">{r.description}</p>
              <span className={`mt-auto px-3 py-1 rounded-lg text-[10px] font-bold ${
                r.category === "crisis" ? "gradient-danger text-destructive-foreground" : "gradient-buddy text-primary-foreground"
              }`}>
                {r.actionLabel}
              </span>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No resources found.</div>
        )}
      </div>

      {/* Inline Content Modal */}
      <AnimatePresence>
        {activeInline && inlineData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={() => setActiveInline(null)}
          >
            <motion.div
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-lg bg-card rounded-t-3xl p-6 shadow-float ${inlineData.type === "chat" ? "max-h-[85vh]" : "max-h-[85vh] overflow-y-auto"}`}
            >
              {inlineData.type === "guided" && (
                <GuidedExercise data={inlineData} onClose={() => setActiveInline(null)} />
              )}
              {inlineData.type === "sounds" && (
                <SoundPlayer data={inlineData} onClose={() => setActiveInline(null)} />
              )}
              {inlineData.type === "steps" && (
                <StepsDisplay data={inlineData} onClose={() => setActiveInline(null)} />
              )}
              {inlineData.type === "chat" && (
                <PeerChat onClose={() => setActiveInline(null)} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teledoc Modal */}
      <AnimatePresence>
        {showTeledoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={() => setShowTeledoc(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-t-3xl p-6 shadow-float"
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <div className="text-center mb-5">
                <span className="text-4xl mb-2 block">👨‍⚕️</span>
                <h2 className="text-lg font-extrabold text-foreground">Connect to a Professional</h2>
                <p className="text-xs text-muted-foreground mt-1">Choose how you'd like to connect</p>
              </div>

              <div className="space-y-3">
                {[
                  { Icon: Video, label: "Video Consultation", desc: "Face-to-face with a psychiatrist", time: "Next available: 15 min", color: "gradient-buddy" },
                  { Icon: Phone, label: "Phone Consultation", desc: "Talk to a licensed therapist", time: "Next available: 5 min", color: "gradient-purple" },
                  { Icon: MessageCircle, label: "Chat Session", desc: "Text-based therapy session", time: "Available now", color: "gradient-success" },
                ].map((opt) => (
                  <button key={opt.label} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-secondary hover:bg-muted transition-colors text-left">
                    <div className={`w-12 h-12 rounded-xl ${opt.color} flex items-center justify-center`}>
                      <opt.Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                      <p className="text-[10px] text-success font-semibold mt-0.5">{opt.time}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-4">
                All sessions are confidential and HIPAA-compliant. 🔒
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourcesPage;
