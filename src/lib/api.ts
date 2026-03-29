/**
 * AuraBridge API Client
 * Centralized communication layer with the FastAPI backend.
 */

const BASE = "/api";

// ─── Types ────────────────────────────────────────────────────────

export interface EmotionSnapshot {
  timestamp: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
  neutral: number;
  arousal: number;
  valence: number;
}

export interface VocalMetrics {
  timestamp: number;
  jitter: number;
  shimmer: number;
  mean_f0: number;
  energy: number;
}

export interface OculomotorSnapshot {
  timestamp: number;
  blink_rate: number;
  gaze_avoidance_pct: number;
}

export interface HRVSnapshot {
  timestamp: number;
  heart_rate: number;
  hrv_rmssd: number;
}

export interface ChatResponseData {
  reply: string;
  risk_level: "none" | "low" | "moderate" | "high";
  risk_alert: string | null;
}

export interface SessionData {
  id: string;
  patient_name: string;
  is_active: boolean;
}

export interface VillageState {
  level: number;
  sessions_completed: number;
  streak: number;
  last_session_date: string | null;
}

export interface EndSessionResult {
  status: string;
  session_id: string;
  village: {
    level: number;
    sessions_completed: number;
    leveled_up: boolean;
    old_level: number;
  };
}

export interface CheckInResult {
  emotions: { name: string; emoji: string; score: number }[];
  patterns: { label: string; emoji: string }[];
  journal_summary: string;
  dominant_mood: string;
  risk_level: string;
}

// ─── Session Endpoints ────────────────────────────────────────────

export async function createSession(
  patientName = "Anonymous"
): Promise<SessionData> {
  const res = await fetch(`${BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient_name: patientName }),
  });
  if (!res.ok) throw new Error(`Create session failed: ${res.status}`);
  return res.json();
}

export async function endSession(
  sessionId: string
): Promise<EndSessionResult> {
  const res = await fetch(`${BASE}/sessions/${sessionId}/end`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`End session failed: ${res.status}`);
  return res.json();
}

// ─── Chat Endpoint ────────────────────────────────────────────────

export async function sendChat(
  sessionId: string,
  message: string,
  emotionSnapshot?: EmotionSnapshot | null,
  vocalMetrics?: VocalMetrics | null,
  oculomotorSnapshot?: OculomotorSnapshot | null,
  hrvSnapshot?: HRVSnapshot | null
): Promise<ChatResponseData> {
  const body: Record<string, unknown> = { message };
  if (emotionSnapshot) body.emotion_snapshot = emotionSnapshot;
  if (vocalMetrics) body.vocal_metrics = vocalMetrics;
  if (oculomotorSnapshot) body.oculomotor_snapshot = oculomotorSnapshot;
  if (hrvSnapshot) body.hrv_snapshot = hrvSnapshot;

  const res = await fetch(`${BASE}/sessions/${sessionId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
}

// ─── Check-In Analysis ───────────────────────────────────────────

export async function analyzeCheckIn(
  transcript: string,
  emotions: Record<string, number>,
  vocals: Record<string, number>,
  oculomotor: Record<string, number>
): Promise<CheckInResult> {
  const res = await fetch(`${BASE}/checkin/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, emotions, vocals, oculomotor }),
  });
  if (!res.ok) throw new Error(`Check-in analysis failed: ${res.status}`);
  return res.json();
}

// ─── Village Endpoints ────────────────────────────────────────────

export async function getVillageState(): Promise<VillageState> {
  const res = await fetch(`${BASE}/village/state`);
  if (!res.ok) throw new Error(`Village state failed: ${res.status}`);
  return res.json();
}

export async function growVillage(
  sessionsToAdd = 1
): Promise<{ level: number; sessions_completed: number; leveled_up: boolean }> {
  const res = await fetch(`${BASE}/village/grow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessions_to_add: sessionsToAdd }),
  });
  if (!res.ok) throw new Error(`Village grow failed: ${res.status}`);
  return res.json();
}

// ─── Trigger Profile ──────────────────────────────────────────────

export async function getTriggerProfile(): Promise<{
  triggers: string[];
  themes: string[];
  avoidance_topics: string[];
  growth_areas: string[];
  conversation_hooks: string[];
}> {
  const res = await fetch(`${BASE}/profile/triggers`);
  if (!res.ok) throw new Error(`Trigger profile failed: ${res.status}`);
  return res.json();
}

// ─── Report ───────────────────────────────────────────────────────

export async function getSessionReport(sessionId: string) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/report`);
  if (!res.ok) throw new Error(`Report failed: ${res.status}`);
  return res.json();
}

// ─── Health Check ─────────────────────────────────────────────────

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
