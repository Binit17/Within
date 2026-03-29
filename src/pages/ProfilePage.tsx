import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGamification } from "@/hooks/useGamification";
import { ArrowLeft, BookOpen, Video, FileText, GraduationCap, Check, Sparkles, ClipboardList, Sun, Brain } from "lucide-react";
import buddySmall from "@/assets/buddy-puppy.png";

interface TodoItem {
  id: string;
  emoji: string;
  title: string;
  time: string;
  reason: string;
  done: boolean;
}

const defaultTodos: TodoItem[] = [
  { id: "1", emoji: "🌅", title: "15-minute Morning Walk", time: "7:30 AM", reason: "Fresh air & sunlight — your best mood booster", done: false },
  { id: "2", emoji: "🧘", title: "5-min Guided Meditation", time: "8:00 AM", reason: "Calm your mind before the day starts", done: false },
  { id: "3", emoji: "📵", title: "No screens before 9 AM", time: "Based on your data", reason: "This improves your afternoon mood by 40%", done: false },
  { id: "4", emoji: "📱", title: "Call Rajan during lunch", time: "12:30 PM", reason: "Reconnect with someone who cares", done: false },
  { id: "5", emoji: "🎵", title: "Listen to your calm playlist", time: "Evening", reason: "Wind down with music that helped before", done: false },
];

const recommendations = [
  { type: "course", icon: GraduationCap, title: "Managing Exam Stress", subtitle: "6-part course · 2h total", color: "hsl(var(--primary))" },
  { type: "article", icon: FileText, title: "Sleep Hygiene for Students", subtitle: "5 min read · Based on your sleep data", color: "hsl(var(--success))" },
  { type: "video", icon: Video, title: "Box Breathing Technique", subtitle: "3 min video · Recommended after check-in", color: "hsl(var(--lavender))" },
  { type: "article", icon: BookOpen, title: "Building a Support Network", subtitle: "7 min read · Social wellness", color: "hsl(var(--coral))" },
];

const dailyJournalSummary = {
  date: "Today",
  mood: "😊",
  summary: "You expressed feeling somewhat stressed about upcoming deadlines but hopeful about the weekend. Your voice tone was calm, and facial expressions showed mild tension around the brows. Overall sentiment: Cautiously Optimistic.",
  insights: [
    { label: "Dominant Emotion", value: "Hopeful", emoji: "🌤️" },
    { label: "Stress Trigger", value: "Deadlines", emoji: "📝" },
    { label: "Positive Note", value: "Weekend plans", emoji: "✨" },
  ],
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { streak, totalCheckins, xp, plantEmoji } = useGamification();
  const [todos, setTodos] = useState<TodoItem[]>(defaultTodos);

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = todos.filter(t => t.done).length;

  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.3 },
  });

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <motion.div {...fadeIn(0)} className="px-5 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-card shadow-card">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-extrabold text-foreground flex-1">My Profile</h1>
      </motion.div>

      {/* Profile Card with Buddy */}
      <motion.div {...fadeIn(0.05)} className="px-5 mb-4">
        <div className="rounded-3xl gradient-hero p-5 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <img src={buddySmall} alt="Buddy" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold text-primary-foreground">Isha Thapa</h2>
              <p className="text-xs text-primary-foreground/70">Student · Kathmandu University</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <p className="text-xl font-black text-primary-foreground">{streak}</p>
              <p className="text-[10px] text-primary-foreground/70 font-semibold">Day Streak</p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <p className="text-xl font-black text-primary-foreground">{totalCheckins}</p>
              <p className="text-[10px] text-primary-foreground/70 font-semibold">Check-ins</p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <p className="text-xl font-black text-primary-foreground">{xp}</p>
              <p className="text-[10px] text-primary-foreground/70 font-semibold">XP Earned</p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <p className="text-xl font-black text-primary-foreground">{plantEmoji}</p>
              <p className="text-[10px] text-primary-foreground/70 font-semibold">Plant</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-5 space-y-4">
        {/* Daily AI Journal Summary */}
        <motion.div {...fadeIn(0.1)}>
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Today's AI Journal</h3>
              <span className="text-lg">{dailyJournalSummary.mood}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {dailyJournalSummary.summary}
            </p>
            <div className="flex gap-2">
              {dailyJournalSummary.insights.map((ins, i) => (
                <div key={i} className="flex-1 rounded-xl bg-muted/50 p-2.5 text-center">
                  <p className="text-base mb-0.5">{ins.emoji}</p>
                  <p className="text-[10px] font-bold text-foreground">{ins.value}</p>
                  <p className="text-[9px] text-muted-foreground">{ins.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tomorrow's Recovery Plan */}
        <motion.div {...fadeIn(0.15)}>
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Tomorrow's Recovery Plan</h3>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">Personalized for you based on today's check-in</p>

            <div className="space-y-0">
              {todos.map((todo, i) => (
                <motion.button
                  key={todo.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => toggleTodo(todo.id)}
                  className="w-full flex items-start gap-3 py-3 border-b border-border/50 last:border-0 text-left"
                >
                  <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    todo.done
                      ? "bg-primary border-primary"
                      : "border-primary/40 bg-transparent"
                  }`}>
                    <AnimatePresence>
                      {todo.done && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold transition-all ${todo.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {todo.emoji} {todo.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {todo.time} · {todo.reason}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {completedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl bg-primary/10 p-2.5 flex items-center gap-2"
              >
                <span className="text-sm">✅</span>
                <p className="text-xs font-semibold text-primary">
                  {completedCount}/{todos.length} planned · Keep it up!
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Personalized Recommendations */}
        <motion.div {...fadeIn(0.2)}>
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Recommended for You</h3>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">Based on your journal entries & wellness data</p>

            <div className="space-y-2.5">
              {recommendations.map((rec, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${rec.color}20` }}>
                    <rec.icon className="w-5 h-5" style={{ color: rec.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{rec.title}</p>
                    <p className="text-[11px] text-muted-foreground">{rec.subtitle}</p>
                  </div>
                  <Sun className="w-4 h-4 text-muted-foreground/50" />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
