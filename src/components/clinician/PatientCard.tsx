import { AlertTriangle, ChevronRight } from "lucide-react";
import type { Patient } from "@/pages/ClinicianPortal";

const emotionColor: Record<string, string> = {
  Positive: "bg-success/20 text-success",
  Neutral: "bg-primary/20 text-primary",
  Negative: "bg-warning/20 text-warning",
  Distressed: "bg-destructive/20 text-destructive",
};

const stressEmoji = (s: number) => s < 30 ? "😌" : s < 50 ? "🙂" : s < 70 ? "😰" : "😫";

export function PatientCard({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 shadow-card bg-card hover:bg-secondary/30 transition-all ${
        patient.escalation ? "ring-2 ring-destructive" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center font-bold text-sm text-primary-foreground">
            {patient.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">{patient.name}</h3>
              {patient.escalation && <AlertTriangle className="w-4 h-4 text-destructive" />}
            </div>
            <p className="text-[10px] text-muted-foreground">Age {patient.age} • Last: {patient.lastJournal}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${emotionColor[patient.emotion]}`}>
          {patient.emotion}
        </span>
        <span className="text-xs text-muted-foreground">{stressEmoji(patient.stressScore)} Stress: {patient.stressScore}%</span>
        <span className="text-xs text-muted-foreground">💊 {patient.medications.length} meds</span>
      </div>
    </button>
  );
}
