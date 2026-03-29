const today = new Date();
const dateStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

const events = [
  { time: "10:00", period: "AM", title: "Thesis Defense Prep", location: "Library · Self-study", stress: "high", emoji: "📚" },
  { time: "2:00", period: "PM", title: "Final Project Defense", location: "Conference Room B · Prof. Sharma", stress: "high", emoji: "🎓" },
  { time: "6:00", period: "PM", title: "Family Video Call", location: "Home · Relaxation", stress: "low", emoji: "📱" },
];

export function CalendarEventCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <h3 className="text-base font-bold text-gray-900">Today</h3>
        </div>
        <span className="text-sm font-semibold" style={{ color: '#3478F6' }}>{dateStr}</span>
      </div>

      {/* Events */}
      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="flex gap-3 rounded-xl bg-gray-50 p-3">
            {/* Timeline */}
            <div className="flex flex-col items-center pt-0.5">
              <div className="w-0.5 flex-1 rounded-full" style={{ backgroundColor: '#FF3B30' }} />
            </div>
            {/* Time */}
            <div className="flex flex-col items-center justify-start min-w-[40px]">
              <span className="text-sm font-bold" style={{ color: '#FF3B30' }}>{e.time}</span>
              <span className="text-[10px] font-semibold" style={{ color: '#FF3B30' }}>{e.period}</span>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{e.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{e.location}</p>
              {e.stress === "high" && (
                <span
                  className="inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#FFF3CD', color: '#E6A700' }}
                >
                  ⚡ High-stakes event detected
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
