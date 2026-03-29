import { useState } from "react";
import { ArrowLeft, AlertTriangle, Pill, TrendingUp, FileText, Phone, Mail, Shield, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "@/pages/ClinicianPortal";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const emotionBubbleColor: Record<string, string> = {
  "😊": "bg-success/10 border-success/30",
  "😌": "bg-primary/10 border-primary/30",
  "😐": "bg-secondary border-border",
  "😰": "bg-warning/10 border-warning/30",
  "😤": "bg-warning/10 border-warning/30",
  "😫": "bg-destructive/10 border-destructive/30",
};

const warningLabels: Record<string, string> = {
  anxiety: "⚡ Anxiety",
  hopelessness: "💔 Hopelessness",
  suicidal_ideation: "🚨 Suicidal Ideation",
  intrusive_thoughts: "🌀 Intrusive Thoughts",
  insomnia: "🌙 Insomnia",
  medication_noncompliance: "💊 Med Non-compliance",
  family_pressure: "🏠 Family Pressure",
  panic_attack: "🫨 Panic Attack",
  loneliness: "😔 Loneliness",
  isolation: "🚪 Social Isolation",
};

export function PatientDetail({ patient, onBack }: { patient: Patient; onBack: () => void }) {
  const [resourcesSent, setResourcesSent] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const handleSendResources = () => {
    const notification = {
      id: Date.now().toString(),
      type: "doctor_resources",
      patientName: patient.name,
      message: `Dr. Nepal sent you wellness resources based on your recent check-ins.`,
      resources: [
        { emoji: "🧘", title: "Guided Breathing", description: "Try a 5-min calming exercise", action: "/breathing" },
        { emoji: "📓", title: "CBT Thought Record", description: "Reframe anxious thoughts", action: "/journal" },
        { emoji: "🌙", title: "Sleep Hygiene Tips", description: "Improve your sleep tonight", action: "sleep" },
        { emoji: "📞", title: "Schedule Follow-up", description: "Book a session with your therapist", action: "teledoc" },
      ],
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("doctor_notifications") || "[]");
    existing.push(notification);
    localStorage.setItem("doctor_notifications", JSON.stringify(existing));
    setResourcesSent(true);
    toast.success(`Resources sent to ${patient.name}'s home screen`);
  };

  const handleAlertTeam = () => {
    setAlertSent(true);
    toast.success("Care team has been alerted immediately");
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="dhaka-stripe" />

      {/* Header */}
      <div className={`px-5 pt-6 pb-4 ${patient.escalation ? "gradient-danger" : "gradient-purple"}`}>
        <button onClick={onBack} className="flex items-center gap-1 text-sm mb-3 text-primary-foreground/80 hover:text-primary-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center font-bold text-lg text-primary-foreground">
            {patient.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="font-bold text-lg text-primary-foreground">{patient.name}</h1>
            <p className="text-xs text-primary-foreground/70">Age {patient.age} • Stress: {patient.stressScore}%</p>
          </div>
          {patient.escalation && (
            <div className="ml-auto flex items-center gap-1 bg-destructive-foreground/20 px-3 py-1 rounded-full">
              <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
              <span className="text-xs font-bold text-destructive-foreground">HIGH RISK</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Escalation */}
        {patient.escalation && (
          <div className="rounded-2xl bg-destructive/10 p-4 shadow-card border border-destructive/30 animate-bounce-in">
            <h3 className="font-bold text-sm text-destructive flex items-center gap-2">
              <Shield className="w-4 h-4" /> Escalation Required
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              AI analysis detected suicidal ideation indicators. Immediate action recommended.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAlertTeam}
                disabled={alertSent}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold ${alertSent ? "bg-success/20 text-success" : "gradient-danger text-destructive-foreground"}`}
              >
                {alertSent ? <><CheckCircle2 className="w-3 h-3" /> Team Alerted</> : <><Phone className="w-3 h-3" /> Alert Care Team</>}
              </button>
              <button
                onClick={handleSendResources}
                disabled={resourcesSent}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold ${resourcesSent ? "bg-success/20 text-success" : "bg-secondary text-secondary-foreground"}`}
              >
                {resourcesSent ? <><CheckCircle2 className="w-3 h-3" /> Sent!</> : <><Send className="w-3 h-3" /> Send Resources</>}
              </button>
            </div>
          </div>
        )}

        {/* AI Report */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">AI Clinical Summary</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Patient shows {patient.emotion.toLowerCase()} emotional state with stress at {patient.stressScore}%.
            {patient.journalEntries[0]?.warnings.length > 0 && (
              <> Recent flags: {patient.journalEntries[0].warnings.map(w => warningLabels[w] || w).join(", ")}.</>
            )}
            {patient.medications.some(m => m.adherence < 70) && (
              <> ⚠️ Medication adherence concerns detected.</>
            )}
          </p>
        </div>

        {/* Trends */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-success" />
            <h3 className="font-bold text-sm text-foreground">Stress & Wellness Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={patient.emotionHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(230 15% 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(230 15% 55%)" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(230 25% 12%)",
                  border: "1px solid hsl(230 20% 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(0 0% 95%)",
                }}
              />
              <Line type="monotone" dataKey="stress" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={{ r: 3 }} name="Stress" />
              <Line type="monotone" dataKey="wellness" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 3 }} name="Wellness" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Medications */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-destructive" />
            <h3 className="font-bold text-sm text-foreground">Medications</h3>
          </div>
          <div className="space-y-2">
            {patient.medications.map((med, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">{med.name} ({med.dosage})</h4>
                  <p className="text-[10px] text-muted-foreground">{med.schedule}</p>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${med.adherence >= 80 ? "text-success" : med.adherence >= 60 ? "text-warning" : "text-destructive"}`}>
                    {med.adherence}%
                  </div>
                  <div className="w-16 h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${med.adherence >= 80 ? "bg-success" : med.adherence >= 60 ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${med.adherence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Journal */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <h3 className="font-bold text-sm text-foreground mb-3">Journal Timeline</h3>
          <div className="space-y-3">
            {patient.journalEntries.map((entry, i) => (
              <div key={i} className={`p-3 rounded-xl border ${emotionBubbleColor[entry.emotion] || "bg-secondary border-border"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">{entry.date}</span>
                  <span className="text-sm">{entry.emotion}</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">"{entry.text}"</p>
                {entry.warnings.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.warnings.map(w => (
                      <span key={w} className="px-2 py-0.5 bg-destructive/20 text-destructive rounded-full text-[9px] font-semibold">
                        {warningLabels[w] || w}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
