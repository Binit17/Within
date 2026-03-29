import { useState } from "react";
import { PatientCard } from "@/components/clinician/PatientCard";
import { PatientDetail } from "@/components/clinician/PatientDetail";
import { Stethoscope, Search } from "lucide-react";

export interface Patient {
  id: string;
  name: string;
  age: number;
  lastJournal: string;
  stressScore: number;
  emotion: "Positive" | "Neutral" | "Negative" | "Distressed";
  escalation: boolean;
  medications: { name: string; dosage: string; schedule: string; adherence: number }[];
  journalEntries: { date: string; text: string; emotion: string; warnings: string[] }[];
  emotionHistory: { date: string; stress: number; wellness: number }[];
}

const patients: Patient[] = [
  {
    id: "1", name: "Aasha Sharma", age: 24, lastJournal: "Today", stressScore: 73, emotion: "Negative", escalation: false,
    medications: [
      { name: "Sertraline", dosage: "50mg", schedule: "Daily AM", adherence: 85 },
      { name: "Melatonin", dosage: "5mg", schedule: "Nightly", adherence: 60 },
    ],
    journalEntries: [
      { date: "Mar 29", text: "Thesis defense is in 3 days. Can't sleep. HRV crashed again.", emotion: "😰", warnings: ["anxiety", "insomnia"] },
      { date: "Mar 28", text: "Family called asking about marriage plans again. Feeling suffocated.", emotion: "😤", warnings: ["family_pressure"] },
    ],
    emotionHistory: [
      { date: "Mar 23", stress: 55, wellness: 60 }, { date: "Mar 24", stress: 60, wellness: 55 },
      { date: "Mar 25", stress: 65, wellness: 48 }, { date: "Mar 26", stress: 70, wellness: 42 },
      { date: "Mar 27", stress: 68, wellness: 45 }, { date: "Mar 28", stress: 75, wellness: 38 },
      { date: "Mar 29", stress: 73, wellness: 40 },
    ],
  },
  {
    id: "2", name: "Rajesh Thapa", age: 30, lastJournal: "Yesterday", stressScore: 45, emotion: "Neutral", escalation: false,
    medications: [
      { name: "Fluoxetine", dosage: "20mg", schedule: "Daily AM", adherence: 90 },
    ],
    journalEntries: [
      { date: "Mar 28", text: "Work from Doha is exhausting but managing. Missing home.", emotion: "😐", warnings: [] },
    ],
    emotionHistory: [
      { date: "Mar 23", stress: 50, wellness: 55 }, { date: "Mar 24", stress: 48, wellness: 58 },
      { date: "Mar 25", stress: 45, wellness: 60 }, { date: "Mar 26", stress: 42, wellness: 62 },
      { date: "Mar 27", stress: 44, wellness: 60 }, { date: "Mar 28", stress: 45, wellness: 58 },
    ],
  },
  {
    id: "3", name: "Priya Karki", age: 22, lastJournal: "Today", stressScore: 91, emotion: "Distressed", escalation: true,
    medications: [
      { name: "Escitalopram", dosage: "10mg", schedule: "Daily AM", adherence: 35 },
      { name: "Quetiapine", dosage: "25mg", schedule: "Nightly", adherence: 40 },
    ],
    journalEntries: [
      { date: "Mar 29", text: "I don't see a way out. Remittance pressure is crushing me. Nobody understands.", emotion: "😫", warnings: ["suicidal_ideation", "hopelessness"] },
      { date: "Mar 28", text: "Stopped taking meds. What's the point anymore.", emotion: "😫", warnings: ["medication_noncompliance", "hopelessness"] },
    ],
    emotionHistory: [
      { date: "Mar 23", stress: 70, wellness: 40 }, { date: "Mar 24", stress: 78, wellness: 32 },
      { date: "Mar 25", stress: 82, wellness: 28 }, { date: "Mar 26", stress: 85, wellness: 25 },
      { date: "Mar 27", stress: 88, wellness: 22 }, { date: "Mar 28", stress: 90, wellness: 18 },
      { date: "Mar 29", stress: 91, wellness: 15 },
    ],
  },
  {
    id: "4", name: "Isha Thapa", age: 23, lastJournal: "Today", stressScore: 68, emotion: "Negative", escalation: true,
    medications: [
      { name: "Sertraline", dosage: "25mg", schedule: "Daily AM", adherence: 72 },
      { name: "Propranolol", dosage: "10mg", schedule: "As needed", adherence: 55 },
    ],
    journalEntries: [
      { date: "Mar 29", text: "I feel like everyone is moving ahead and I'm stuck. Had a panic attack during class today. Used the breathing exercise but it only helped a little.", emotion: "😰", warnings: ["anxiety", "panic_attack"] },
      { date: "Mar 29", text: "Peer chat helped a bit. Someone said they felt the same way last semester. But I still feel so alone.", emotion: "😰", warnings: ["loneliness"] },
      { date: "Mar 28", text: "Couldn't sleep again. Kept thinking about the presentation tomorrow. My hands won't stop shaking.", emotion: "😫", warnings: ["insomnia", "anxiety"] },
      { date: "Mar 27", text: "Skipped meds today. Felt dizzy and nauseous. Is it even working?", emotion: "😤", warnings: ["medication_noncompliance"] },
      { date: "Mar 26", text: "Good day actually. Watered my plant, did the body scan. Felt calm for once.", emotion: "😊", warnings: [] },
      { date: "Mar 25", text: "I don't want to talk to anyone. Everything feels heavy.", emotion: "😫", warnings: ["hopelessness", "isolation"] },
    ],
    emotionHistory: [
      { date: "Mar 23", stress: 45, wellness: 62 }, { date: "Mar 24", stress: 52, wellness: 55 },
      { date: "Mar 25", stress: 72, wellness: 30 }, { date: "Mar 26", stress: 38, wellness: 70 },
      { date: "Mar 27", stress: 60, wellness: 42 }, { date: "Mar 28", stress: 75, wellness: 28 },
      { date: "Mar 29", stress: 68, wellness: 35 },
    ],
  },
];

const ClinicianPortal = () => {
  const [selected, setSelected] = useState<Patient | null>(null);
  const [search, setSearch] = useState("");

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const escalated = filtered.filter(p => p.escalation);
  const regular = filtered.filter(p => !p.escalation);

  if (selected) return <PatientDetail patient={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="dhaka-stripe" />
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Clinician Portal</h1>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-2.5 border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
            placeholder="Search patients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-5 py-2 space-y-4">
        {escalated.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-destructive flex items-center gap-1 mb-2">🚨 Requires Immediate Attention</h2>
            {escalated.map(p => <PatientCard key={p.id} patient={p} onClick={() => setSelected(p)} />)}
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground mb-2">All Patients</h2>
          <div className="space-y-3">
            {regular.map(p => <PatientCard key={p.id} patient={p} onClick={() => setSelected(p)} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicianPortal;
