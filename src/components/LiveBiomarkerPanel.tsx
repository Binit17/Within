import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, Eye, Mic } from "lucide-react";
import { checkInEngine, type EmotionData, type VocalData, type OculomotorData } from "@/lib/checkInEngine";

// ─── Emotion config (warm palette) ──────────────────────────────
const EMOTION_CONFIG: { key: keyof EmotionData; label: string; emoji: string; color: string; bg: string }[] = [
  { key: "happy",     label: "Happy",     emoji: "😊", color: "#16A34A", bg: "#DCFCE7" },
  { key: "sad",       label: "Sad",       emoji: "😢", color: "#3B82F6", bg: "#DBEAFE" },
  { key: "angry",     label: "Angry",     emoji: "😠", color: "#EF4444", bg: "#FEE2E2" },
  { key: "fearful",   label: "Fear",      emoji: "😨", color: "#8B5CF6", bg: "#EDE9FE" },
  { key: "disgusted", label: "Disgust",   emoji: "🤢", color: "#D97706", bg: "#FEF3C7" },
  { key: "surprised", label: "Surprise",  emoji: "😮", color: "#EC4899", bg: "#FCE7F3" },
  { key: "neutral",   label: "Neutral",   emoji: "😐", color: "#78716C", bg: "#F5F5F4" },
];

// ─── Voice Waveform (warm theme canvas) ─────────────────────────
function VoiceWaveform({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = checkInEngine.analyserNode;
    if (!canvas || !analyser || !isActive) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const bufLen = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufLen);
    const timeData = new Uint8Array(bufLen);

    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);

    // Clear — warm cream fade
    ctx.fillStyle = "rgba(253, 249, 243, 0.3)";
    ctx.fillRect(0, 0, W, H);

    // ── Frequency bars — warm orange/amber gradient ──
    const barCount = 64;
    const barW = W / barCount;
    const step = Math.floor(bufLen / barCount);

    for (let i = 0; i < barCount; i++) {
      const val = freqData[i * step] / 255;
      const barH = val * H * 0.5;

      // Warm gradient: amber → coral → rose
      const hue = 25 + (i / barCount) * 30; // 25 → 55 (orange → amber)
      const sat = 80 + val * 15;
      const light = 55 + (1 - val) * 15;
      const alpha = 0.3 + val * 0.6;
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;

      const x = i * barW;
      ctx.fillRect(x + 1, H - barH, barW - 2, barH);
      // Soft top reflection
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha * 0.2})`;
      ctx.fillRect(x + 1, 0, barW - 2, barH * 0.3);
    }

    // ── Waveform line — warm amber ──
    ctx.beginPath();
    ctx.strokeStyle = "hsla(32, 90%, 50%, 0.85)";
    ctx.lineWidth = 2;
    const sliceW = W / bufLen;
    let x = 0;
    for (let i = 0; i < bufLen; i++) {
      const v = timeData[i] / 128.0;
      const y = (v * H) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceW;
    }
    ctx.stroke();

    // Glow
    ctx.beginPath();
    ctx.strokeStyle = "hsla(32, 90%, 55%, 0.15)";
    ctx.lineWidth = 6;
    x = 0;
    for (let i = 0; i < bufLen; i++) {
      const v = timeData[i] / 128.0;
      const y = (v * H) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceW;
    }
    ctx.stroke();

    rafRef.current = requestAnimationFrame(draw);
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      const timeout = setTimeout(() => {
        rafRef.current = requestAnimationFrame(draw);
      }, 300);
      return () => {
        clearTimeout(timeout);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [isActive, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      className="w-full h-[120px] rounded-xl border border-border"
      style={{ imageRendering: "auto", background: "linear-gradient(180deg, hsl(30 30% 97%), hsl(30 20% 94%))" }}
    />
  );
}

// ─── Circular Gauge ─────────────────────────────────────────────
function CircularGauge({
  value,
  max,
  label,
  unit,
  color,
  warningThreshold,
  icon: Icon,
}: {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  warningThreshold?: number;
  icon: React.ElementType;
}) {
  const pct = Math.min(1, value / max);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const isWarning = warningThreshold !== undefined && value > warningThreshold;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[76px] h-[76px]">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(30 15% 90%)" strokeWidth="6" />
          {/* Progress */}
          <motion.circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={isWarning ? "#EF4444" : color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold font-mono-bio" style={{ color: isWarning ? "#EF4444" : color }}>
            {Math.round(value)}
          </span>
          <span className="text-[8px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-foreground/70">{label}</span>
      </div>
    </div>
  );
}

// ─── Vocal Metric Bar ───────────────────────────────────────────
function MetricBar({
  label,
  value,
  max,
  unit,
  color,
  warningThreshold,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  warningThreshold?: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const isWarning = warningThreshold !== undefined && value > warningThreshold;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-foreground/60">{label}</span>
        <span className="text-[10px] font-mono-bio font-bold" style={{ color: isWarning ? "#EF4444" : color }}>
          {typeof value === "number" ? (value < 1 ? (value * 100).toFixed(1) + "%" : value.toFixed(0) + unit) : "—"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: isWarning ? "#EF4444" : color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────
interface LiveBiomarkerPanelProps {
  isActive: boolean;
  emotions: EmotionData;
  vocals: VocalData;
  oculomotor: OculomotorData;
  showWaveform?: boolean;
  compact?: boolean;
}

export function LiveBiomarkerPanel({
  isActive,
  emotions,
  vocals,
  oculomotor,
  showWaveform = true,
  compact = false,
}: LiveBiomarkerPanelProps) {
  const sorted = [...EMOTION_CONFIG]
    .map((e) => ({ ...e, score: emotions[e.key] as number }))
    .sort((a, b) => b.score - a.score);

  const dominant = sorted[0];

  const valenceLabel = emotions.valence > 0.2 ? "Positive" : emotions.valence < -0.2 ? "Negative" : "Neutral";
  const arousalLabel = emotions.arousal > 0.2 ? "High" : emotions.arousal < -0.2 ? "Low" : "Moderate";

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-2xl bg-card border border-border p-3 space-y-2.5 overflow-hidden shadow-card"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{dominant.emoji}</span>
          <div className="flex-1 flex gap-0.5 h-3 rounded-full overflow-hidden bg-muted">
            {sorted.slice(0, 4).map((e) => (
              <motion.div
                key={e.key}
                className="h-full"
                style={{ background: e.color }}
                animate={{ flex: Math.max(0.02, e.score) }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-foreground/70">{dominant.label} {Math.round(dominant.score * 100)}%</span>
        </div>

        <div className="flex items-center gap-3 text-[9px] font-mono-bio text-muted-foreground">
          <span className="flex items-center gap-1">
            <Mic className="w-2.5 h-2.5" />
            J:{(vocals.jitter * 100).toFixed(1)}% S:{(vocals.shimmer * 100).toFixed(1)}% F0:{Math.round(vocals.meanF0)}Hz
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-2.5 h-2.5" />
            {oculomotor.blinkRate}/min · {oculomotor.gazeAvoidancePct}% off
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg gradient-buddy flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-xs font-bold text-foreground">Live Biomarkers</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[9px] text-success font-bold">STREAMING</span>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* === VOICE WAVEFORM === */}
        {showWaveform && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Mic className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Voice Analysis</span>
            </div>
            <VoiceWaveform isActive={isActive} />
            <div className="grid grid-cols-4 gap-2 mt-2">
              <MetricBar label="Jitter" value={vocals.jitter} max={0.1} unit="" color="hsl(32, 90%, 50%)" warningThreshold={0.02} />
              <MetricBar label="Shimmer" value={vocals.shimmer} max={0.5} unit="" color="hsl(260, 50%, 55%)" warningThreshold={0.1} />
              <MetricBar label="F0" value={vocals.meanF0} max={400} unit="Hz" color="hsl(165, 50%, 42%)" />
              <MetricBar label="Energy" value={vocals.energy} max={0.3} unit="" color="hsl(200, 70%, 50%)" />
            </div>
          </div>
        )}

        {/* === EMOTION BARS === */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{dominant.emoji}</span>
              <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Facial Emotions</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono-bio text-muted-foreground">
              <span>V: {emotions.valence > 0 ? "+" : ""}{emotions.valence.toFixed(2)} ({valenceLabel})</span>
              <span>A: {emotions.arousal > 0 ? "+" : ""}{emotions.arousal.toFixed(2)} ({arousalLabel})</span>
            </div>
          </div>

          <div className="space-y-1">
            {sorted.map((e) => (
              <div key={e.key} className="flex items-center gap-2 h-5">
                <span className="text-xs w-4 text-center">{e.emoji}</span>
                <span className="text-[9px] font-semibold text-muted-foreground w-14">{e.label}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: e.bg }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${e.color}CC, ${e.color})` }}
                    animate={{ width: `${Math.max(1, e.score * 100)}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] font-mono-bio font-bold w-8 text-right" style={{ color: e.color }}>
                  {Math.round(e.score * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* === EYE TRACKING === */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Eye Tracking</span>
          </div>
          <div className="flex items-center justify-around">
            <CircularGauge
              value={oculomotor.blinkRate}
              max={40}
              label="Blink Rate"
              unit="/min"
              color="hsl(165, 50%, 42%)"
              warningThreshold={20}
              icon={Eye}
            />
            <CircularGauge
              value={oculomotor.gazeAvoidancePct}
              max={100}
              label="Gaze Avoidance"
              unit="%"
              color="hsl(260, 50%, 55%)"
              warningThreshold={35}
              icon={Eye}
            />

            {/* Valence-Arousal 2D plot */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-[76px] h-[76px] rounded-lg bg-muted/80 border border-border overflow-hidden">
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-full h-px bg-border" />
                  <div className="absolute h-full w-px bg-border" />
                </div>
                {/* Labels */}
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[6px] text-muted-foreground">High A</span>
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] text-muted-foreground">Low A</span>
                <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[6px] text-muted-foreground">−V</span>
                <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[6px] text-muted-foreground">+V</span>
                {/* Dot */}
                <motion.div
                  className="absolute w-3 h-3 rounded-full shadow-buddy"
                  style={{ background: "hsl(32, 90%, 55%)" }}
                  animate={{
                    left: `${((emotions.valence + 1) / 2) * 100}%`,
                    top: `${((1 - (emotions.arousal + 1) / 2)) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                  // eslint-disable-next-line react/no-unknown-property
                  {...{ style: { transform: "translate(-50%, -50%)", background: "hsl(32, 90%, 55%)" } }}
                />
              </div>
              <span className="text-[10px] font-semibold text-foreground/70">V-A Space</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
