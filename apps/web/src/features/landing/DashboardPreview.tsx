import { Briefcase, Calendar, MessageSquare, TrendingUp } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";

const STATS = [
  { label: "Applications", value: 12, icon: Briefcase },
  { label: "Active Processes", value: 5, icon: TrendingUp },
  { label: "Upcoming Rounds", value: 2, icon: Calendar },
  { label: "Experiences Logged", value: 8, icon: MessageSquare },
];

const UPCOMING = [
  { company: "InMobi", stage: "Online Assessment", time: "12 Aug · 6:00 PM" },
  { company: "Amazon", stage: "SDE Internship OA", time: "15 Aug" },
];

const PREP = [
  { name: "DSA", percent: 82, color: "#7c3aed" },
  { name: "SQL", percent: 74, color: "#10b981" },
  { name: "DBMS", percent: 64, color: "#3b82f6" },
];

export function DashboardPreview() {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Dashboard</p>
          <p className="text-xs text-slate-400">Good morning, Suzume 👋</p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-700">
          S
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex flex-col gap-1.5 p-3">
            <Icon size={14} className="text-primary-600" />
            <p className="text-lg font-bold text-slate-900">{value}</p>
            <p className="text-[10px] leading-tight text-slate-400">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="p-3.5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Upcoming</p>
          <div className="flex flex-col gap-2">
            {UPCOMING.map((u) => (
              <div key={u.company} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-700">{u.company}</p>
                  <p className="text-[10px] text-slate-400">{u.stage}</p>
                </div>
                <span className="text-[10px] text-slate-400">{u.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3.5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Preparation</p>
          <div className="flex flex-col gap-2">
            {PREP.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-[10px] text-slate-500">{p.name}</span>
                <ProgressBar percent={p.percent} color={p.color} />
                <span className="w-7 shrink-0 text-right text-[10px] font-medium text-slate-600">{p.percent}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
