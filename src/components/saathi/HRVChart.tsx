import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

const data = [
  { day: "Mon", hrv: 52 },
  { day: "Tue", hrv: 48 },
  { day: "Wed", hrv: 55 },
  { day: "Thu", hrv: 40 },
  { day: "Fri", hrv: 38 },
  { day: "Sat", hrv: 45 },
  { day: "Sun", hrv: 42 },
];

export function HRVChart() {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-foreground">HRV Over Time</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">Below baseline</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">Baseline: 58ms</p>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--coral))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--coral))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[20, 70]} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
          />
          <ReferenceLine
            y={58}
            stroke="hsl(var(--success))"
            strokeDasharray="5 5"
            label={{ value: "Baseline 58ms", fill: "hsl(var(--success))", fontSize: 9, position: "right" }}
          />
          <Area
            type="monotone"
            dataKey="hrv"
            stroke="hsl(var(--coral))"
            strokeWidth={2.5}
            fill="url(#hrvGradient)"
            dot={{ r: 4, fill: "hsl(var(--coral))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
