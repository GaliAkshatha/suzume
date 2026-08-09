import { useEffect, useState } from "react";
import { Briefcase, Calendar, MessageSquare, Lightbulb, GraduationCap, LineChart } from "lucide-react";
import clsx from "clsx";

const STAGES = [
  { label: "Application", icon: Briefcase, description: "Add & track", detail: "InMobi — SDE-1 Intern added" },
  { label: "Interview Round", icon: Calendar, description: "Schedule rounds", detail: "Technical Interview scheduled" },
  { label: "Experience", icon: MessageSquare, description: "Log reflections", detail: "Questions & reflections logged" },
  { label: "Learning", icon: Lightbulb, description: "Capture lessons", detail: "\"Explain approach before coding\"" },
  { label: "Preparation", icon: GraduationCap, description: "Build confidence", detail: "DSA confidence up to 82%" },
  { label: "Analytics", icon: LineChart, description: "Spot patterns", detail: "Recurring weak spots surfaced" },
];

export function WorkflowPreview() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActive((a) => (a + 1) % STAGES.length), 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
      <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto pb-1 sm:justify-between sm:overflow-visible">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isActive = i === active;
          return (
            <div key={stage.label} className="flex shrink-0 items-center sm:flex-1 sm:justify-center">
              <button
                onClick={() => setActive(i)}
                className={clsx(
                  "flex w-24 shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl px-2 py-2 transition-colors duration-300 sm:w-auto",
                  isActive ? "bg-primary-50" : "hover:bg-slate-50"
                )}
              >
                <div
                  className={clsx(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                    isActive ? "bg-primary-600 text-white shadow-sm" : "bg-slate-100 text-slate-400"
                  )}
                >
                  <Icon size={16} />
                </div>
                <span
                  className={clsx(
                    "text-center text-[11px] font-semibold leading-tight transition-colors",
                    isActive ? "text-primary-700" : "text-slate-500"
                  )}
                >
                  {stage.label}
                </span>
                <span className="text-center text-[10px] leading-tight text-slate-400">{stage.description}</span>
              </button>
              {i < STAGES.length - 1 && <div className="mx-1 hidden h-px w-4 shrink-0 bg-slate-200 sm:block lg:w-6" />}
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-center">
        <p className="text-sm font-medium text-slate-700">{STAGES[active].detail}</p>
      </div>
    </div>
  );
}
