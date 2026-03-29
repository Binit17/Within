import { useState, useEffect } from "react";

interface BuddyAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  mood?: "happy" | "calm" | "concerned" | "excited";
  animate?: boolean;
  className?: string;
}

const sizeMap = { sm: "w-12 h-12", md: "w-20 h-20", lg: "w-28 h-28", xl: "w-40 h-40" };
const earSize = { sm: "w-3 h-4", md: "w-5 h-6", lg: "w-6 h-8", xl: "w-8 h-10" };
const eyeSize = { sm: "w-1.5 h-1.5", md: "w-2.5 h-2.5", lg: "w-3 h-3", xl: "w-4 h-4" };

const moodEyes: Record<string, string> = {
  happy: "😊", calm: "😌", concerned: "🥺", excited: "🤩",
};

export function BuddyAvatar({ size = "md", mood = "happy", animate = true, className = "" }: BuddyAvatarProps) {
  const [wagTail, setWagTail] = useState(false);

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => setWagTail(true), 3000);
    return () => clearInterval(interval);
  }, [animate]);

  useEffect(() => {
    if (wagTail) {
      const t = setTimeout(() => setWagTail(false), 600);
      return () => clearTimeout(t);
    }
  }, [wagTail]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className} ${animate ? "animate-float" : ""}`}>
      <div className={`${sizeMap[size]} rounded-full gradient-buddy shadow-buddy relative flex items-center justify-center`}>
        {/* Ears */}
        <div className={`absolute -top-1 -left-1 ${earSize[size]} rounded-full rotate-[-30deg] shadow-sm`} style={{ background: "hsl(25 85% 52%)" }} />
        <div className={`absolute -top-1 -right-1 ${earSize[size]} rounded-full rotate-[30deg] shadow-sm`} style={{ background: "hsl(25 85% 52%)" }} />
        
        {/* Face */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-2">
            <div className={`${eyeSize[size]} rounded-full bg-foreground`} />
            <div className={`${eyeSize[size]} rounded-full bg-foreground`} />
          </div>
          <div className="text-xs">{size === "sm" ? "" : moodEyes[mood]}</div>
        </div>

        {/* Tail */}
        <div className={`absolute -right-2 top-1/2 w-3 h-6 rounded-full origin-bottom ${wagTail ? "animate-tail-wag" : ""}`} style={{ background: "hsl(25 85% 52%)" }} />
      </div>
    </div>
  );
}
