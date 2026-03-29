import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Brain } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const weeklyData: Record<string, { days: string[]; moods: string[]; scores: (number | null)[] }> = {
  "Mar 23": {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    moods: ["😊", "😟", "😌", "😤", "😔", "😊", "❓"],
    scores: [72, 45, 65, 38, 50, 70, null],
  },
  "Mar 16": {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    moods: ["😌", "😊", "🙂", "😊", "😌", "😟", "😊"],
    scores: [65, 78, 60, 74, 68, 42, 72],
  },
  "Mar 9": {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    moods: ["😤", "😔", "😌", "😊", "😊", "😌", "🙂"],
    scores: [35, 40, 58, 70, 75, 62, 55],
  },
  "Mar 2": {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    moods: ["😊", "😊", "😌", "😟", "😌", "😊", "😊"],
    scores: [80, 76, 65, 48, 60, 72, 78],
  },
};

const weeks = Object.keys(weeklyData);

const summaries: Record<string, { text: string; insights: { emoji: string; title: string; body: string }[] }> = {
  "Mar 23": {
    text: "Your mood dipped mid-week, correlating with poor sleep on Tuesday and high meeting load on Thursday.",
    insights: [
      { emoji: "📱", title: "Screen Time Correlation", body: "On days you used your phone >4 hours, your evening mood dropped by 35%." },
      { emoji: "😴", title: "Sleep Quality Pattern", body: "Average sleep was 5.2 hours. Poor sleep on Mon & Wed preceded worst mood days." },
      { emoji: "🧠", title: "Journaling Timing", body: "Your most honest entries happen between 9–11 PM. Consider setting check-in then." },
    ],
  },
  "Mar 16": {
    text: "A strong week overall! Your mood stayed above 60 most days. Thursday's peak aligned with outdoor exercise.",
    insights: [
      { emoji: "🏃", title: "Exercise Impact", body: "You averaged 6,200 steps/day. Higher activity correlated with 22% better mood." },
      { emoji: "📅", title: "Calendar Stress", body: "Only 6 meetings this week — lighter schedule linked to sustained wellbeing." },
    ],
  },
  "Mar 9": {
    text: "Rough start but strong recovery. Monday's low aligned with deadline stress. Weekend journaling helped rebound.",
    insights: [
      { emoji: "📱", title: "Screen Time", body: "Screen time spiked to 6hrs on Mon/Tue, correlating with the lowest mood scores." },
    ],
  },
  "Mar 2": {
    text: "Consistently positive week. Regular sleep schedule and morning walks contributed to stable mood.",
    insights: [
      { emoji: "🌅", title: "Morning Routine", body: "Days with morning walks showed 30% higher afternoon mood scores." },
    ],
  },
};

const maxH = 40;

// Month calendar data
const calendarWeeks = [
  { label: "Mar 2", days: [2, 3, 4, 5, 6, 7, 8] },
  { label: "Mar 9", days: [9, 10, 11, 12, 13, 14, 15] },
  { label: "Mar 16", days: [16, 17, 18, 19, 20, 21, 22] },
  { label: "Mar 23", days: [23, 24, 25, 26, 27, 28, 29] },
];

export function WeeklyMoodTracker() {
  const [expanded, setExpanded] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("Mar 23");
  const [calMonth] = useState("March 2026");

  const week = weeklyData[selectedWeek];
  const summary = summaries[selectedWeek];

  const chartData = week.days.map((day, i) => ({
    day,
    mood: week.scores[i] ?? 0,
  }));

  const avgScore = week.scores.filter(Boolean).reduce((a, b) => a! + b!, 0) as number;
  const validCount = week.scores.filter(Boolean).length;
  const avg = validCount ? Math.round(avgScore / validCount) : 0;

  return (
    <div className="rounded-2xl bg-card shadow-card overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground text-left">This Week's Mood</h3>
          <p className="text-[10px] text-muted-foreground text-left">Week of {selectedWeek} · Avg {avg}/100</p>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Mini bar view always visible */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-end gap-1">
          {week.days.map((day, i) => {
            const score = week.scores[i];
            const h = score ? (score / 100) * maxH : 4;
            const color = score
              ? score > 60 ? "bg-success" : score > 40 ? "bg-warning" : "bg-destructive"
              : "bg-muted";

            return (
              <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-base">{week.moods[i]}</span>
                <motion.div
                  key={`${selectedWeek}-${i}`}
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ duration: 0.6, delay: i * 0.08, type: "spring" }}
                  className={`w-5 rounded-t-lg ${color}`}
                />
                <span className={`text-[10px] font-semibold ${score === null ? "text-primary" : "text-muted-foreground"}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Area chart */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Mood Trend</p>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="weekMoodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={25} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "11px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#weekMoodGrad)"
                      dot={{ r: 3, fill: "hsl(var(--primary))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* AI Summary */}
              <div className="rounded-xl bg-muted/50 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">AI Insights</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold ml-auto">
                    Behavior Analysis
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{summary.text}</p>
                {summary.insights.map((ins, i) => (
                  <div key={i} className="flex gap-2.5 pt-2 border-t border-border/50">
                    <span className="text-lg mt-0.5">{ins.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{ins.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{ins.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly calendar for week selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">{calMonth}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <span key={d} className="text-[9px] font-semibold text-muted-foreground py-1">{d}</span>
                  ))}
                </div>
                {/* Empty cell for March starting on Sunday = 0 offset for simplicity */}
                <div className="grid grid-cols-7 gap-0.5 text-center">
                  {/* March 2026 starts on Sunday */}
                  {calendarWeeks.map(cw => (
                    cw.days.map((day, di) => {
                      const isSelected = selectedWeek === cw.label;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedWeek(cw.label)}
                          className={`text-[10px] py-1.5 rounded-md transition-all ${
                            isSelected
                              ? "bg-primary/15 text-primary font-bold"
                              : "text-foreground hover:bg-muted"
                          } ${di === 0 && day === 2 ? "col-start-1" : ""}`}
                        >
                          {day}
                        </button>
                      );
                    })
                  ))}
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {weeks.map(w => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeek(w)}
                      className={`text-[10px] px-2 py-1 rounded-full transition-all ${
                        selectedWeek === w
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
