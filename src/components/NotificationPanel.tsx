import { Bell, Droplets, Wind, BookOpen, Pill, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const notifications = [
  { icon: <Droplets className="w-3.5 h-3.5 text-sky-deep" />, text: "Time to hydrate! 💧", time: "2m", bg: "bg-sky/10", toastEmoji: "💧" },
  { icon: <Wind className="w-3.5 h-3.5 text-mint-deep" />, text: "Try a breathing exercise", time: "15m", bg: "bg-mint/10", toastEmoji: "🧘" },
  { icon: <BookOpen className="w-3.5 h-3.5 text-lavender" />, text: "Journal reminder", time: "1h", bg: "bg-lavender/10", toastEmoji: "📓" },
  { icon: <Pill className="w-3.5 h-3.5 text-rose" />, text: "Evening medication", time: "3h", bg: "bg-rose/10", toastEmoji: "💊" },
];

export function NotificationPanel() {
  const [expanded, setExpanded] = useState(false);
  const hasShownToasts = useRef(false);
  const visible = expanded ? notifications : notifications.slice(0, 2);

  // Show popup toasts on mount with staggered timing
  useEffect(() => {
    if (hasShownToasts.current) return;
    hasShownToasts.current = true;

    notifications.forEach((n, i) => {
      setTimeout(() => {
        toast(`${n.toastEmoji} ${n.text}`, {
          description: `${n.time} ago`,
          duration: 4000,
        });
      }, 1500 + i * 2500);
    });
  }, []);

  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-2 w-full"
      >
        <Bell className="w-4 h-4 text-buddy" />
        <span className="font-semibold text-xs text-foreground flex-1 text-left">Notifications</span>
        <span className="text-[10px] text-primary font-semibold">{notifications.length}</span>
        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        <div className="space-y-1.5">
          {visible.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl ${n.bg}`}
            >
              {n.icon}
              <span className="text-[11px] font-medium text-foreground flex-1">{n.text}</span>
              <span className="text-[9px] text-muted-foreground">{n.time}</span>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
