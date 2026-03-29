import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
  label: string;
}

const basePoints: Point[] = [
  { x: 35, y: 30, label: "L.Brow" },
  { x: 65, y: 30, label: "R.Brow" },
  { x: 35, y: 42, label: "L.Eye" },
  { x: 65, y: 42, label: "R.Eye" },
  { x: 50, y: 55, label: "Nose" },
  { x: 38, y: 68, label: "L.Mouth" },
  { x: 62, y: 68, label: "R.Mouth" },
  { x: 50, y: 72, label: "Chin" },
  { x: 20, y: 50, label: "L.Jaw" },
  { x: 80, y: 50, label: "R.Jaw" },
  { x: 50, y: 20, label: "Forehead" },
  { x: 42, y: 42, label: "L.Pupil" },
  { x: 58, y: 42, label: "R.Pupil" },
];

const connections: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 4],
  [4, 5], [4, 6], [5, 6], [5, 7], [6, 7],
  [8, 2], [9, 3], [10, 0], [10, 1],
  [11, 2], [12, 3],
];

export function FacialCoordinates({ active = false }: { active?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [points, setPoints] = useState(basePoints);
  const [emotions, setEmotions] = useState({
    eyebrowRaise: 0,
    mouthCurve: 0,
    eyeOpenness: 0,
    headTilt: 0,
  });

  // Start/stop camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (active) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
            setCameraReady(true);
            setCameraError(false);
          }
        })
        .catch(() => {
          setCameraError(true);
          setCameraReady(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      setCameraReady(false);
    };
  }, [active]);

  // Simulated coordinate jitter
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      const jitter = () => (Math.random() - 0.5) * 3;
      setPoints(basePoints.map((p) => ({
        ...p,
        x: p.x + jitter(),
        y: p.y + jitter(),
      })));
      setEmotions({
        eyebrowRaise: Math.floor(Math.random() * 30 + 10),
        mouthCurve: Math.floor(Math.random() * 60 - 20),
        eyeOpenness: Math.floor(Math.random() * 40 + 50),
        headTilt: Math.floor((Math.random() - 0.5) * 20),
      });
    }, 500);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-xl bg-foreground/5 border border-border overflow-hidden">
      {/* Live camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${active && cameraReady ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Coordinate overlay */}
      <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" style={{ zIndex: 2 }}>
        {/* Face outline */}
        <ellipse cx="50" cy="50" rx="32" ry="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.4" />

        {/* Connection lines */}
        {active && connections.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={points[a].x} y1={points[a].y}
            x2={points[b].x} y2={points[b].y}
            stroke="hsl(var(--success))"
            strokeWidth="0.4"
            opacity="0.6"
            animate={{ x1: points[a].x, y1: points[a].y, x2: points[b].x, y2: points[b].y }}
            transition={{ duration: 0.3 }}
          />
        ))}

        {/* Points */}
        {points.map((p, i) => (
          <motion.g key={i}>
            <motion.circle
              cx={p.x} cy={p.y}
              r={active ? 1.2 : 0.8}
              fill={active ? "hsl(var(--success))" : "hsl(var(--muted-foreground))"}
              animate={{ cx: p.x, cy: p.y }}
              transition={{ duration: 0.3 }}
            />
            {active && (
              <motion.text
                x={p.x} y={p.y - 2.5}
                textAnchor="middle"
                fontSize="2.2"
                fill="hsl(var(--success))"
                fontWeight="bold"
                animate={{ x: p.x, y: p.y - 2.5 }}
                transition={{ duration: 0.3 }}
              >
                {p.label}
              </motion.text>
            )}
          </motion.g>
        ))}
      </svg>

      {/* Emotion stats bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 backdrop-blur-sm px-3 py-2" style={{ zIndex: 3 }}>
        <div className="flex items-center justify-between text-[9px] font-mono text-primary-foreground">
          <span>👁 Eye: {emotions.eyeOpenness}%</span>
          <span>🤨 Brow: {emotions.eyebrowRaise}%</span>
          <span>👄 Mouth: {emotions.mouthCurve > 0 ? "+" : ""}{emotions.mouthCurve}%</span>
          <span>↩ Tilt: {emotions.headTilt}°</span>
        </div>
      </div>

      {/* Recording indicator */}
      {active && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5" style={{ zIndex: 3 }}>
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulsing-alert" />
          <span className="text-[9px] font-bold text-destructive drop-shadow-md">REC</span>
        </div>
      )}

      {/* Camera status when active but no feed yet */}
      {active && !cameraReady && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
          <p className="text-xs text-muted-foreground animate-pulse">Starting camera...</p>
        </div>
      )}

      {active && cameraError && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
          <p className="text-xs text-destructive">Camera access denied</p>
        </div>
      )}

      {!active && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Camera preview — tap record</p>
        </div>
      )}
    </div>
  );
}
