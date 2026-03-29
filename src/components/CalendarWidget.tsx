import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const moods: Record<number, string> = {
  1: "😌", 3: "😊", 5: "😰", 7: "🙂", 10: "😊", 12: "😌",
  14: "🤩", 16: "😰", 18: "😊", 20: "😌", 22: "🙂", 24: "😊",
  26: "😰", 28: "😌",
};

export function CalendarWidget() {
  const [month] = useState(new Date());
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const today = new Date().getDate();
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <button className="p-1 rounded-lg hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
        <span className="font-semibold text-sm">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        <button className="p-1 rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map(d => (
          <div key={d} className="text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
          <div
            key={day}
            className={`text-xs py-1 rounded-lg cursor-pointer transition-all ${
              day === today
                ? "gradient-buddy text-primary-foreground font-bold"
                : moods[day]
                ? "bg-buddy-light font-medium"
                : "hover:bg-muted"
            }`}
          >
            {moods[day] || day}
          </div>
        ))}
      </div>
    </div>
  );
}
