import { useMemo } from "react";
import { PreparationActivityDay } from "@suzume/shared-types";

interface Props {
  days: PreparationActivityDay[];
  onSelectDay: (date: string) => void;
}

const LEVEL_COLORS = ["#f1f0fb", "#ddd6fe", "#c4b5fd", "#a78bfa", "#7c3aed"];

function levelFor(day: PreparationActivityDay | undefined): number {
  if (!day) return 0;
  const score = day.minutes + day.questionsSolved * 5;
  if (score <= 0) return 0;
  if (score < 30) return 1;
  if (score < 75) return 2;
  if (score < 150) return 3;
  return 4;
}

export function StudyHeatmap({ days, onSelectDay }: Props) {
  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    start.setDate(start.getDate() - start.getDay());

    const result: Date[][] = [];
    let cursor = new Date(start);
    while (cursor <= today) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      result.push(week);
    }
    return result;
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date) => {
              const key = date.toISOString().slice(0, 10);
              const day = dayMap.get(key);
              const level = levelFor(day);
              const isFuture = date > new Date();
              return (
                <button
                  key={key}
                  disabled={isFuture}
                  onClick={() => onSelectDay(key)}
                  title={
                    isFuture
                      ? undefined
                      : `${date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}\n${
                          day ? `${Math.floor(day.minutes / 60)}h ${day.minutes % 60}m studied` : "No study logged"
                        }${day ? `\n${day.questionsSolved} questions\n${day.topicsCount} topic(s)` : ""}`
                  }
                  className="h-3 w-3 rounded-sm transition-transform hover:scale-125 disabled:cursor-default"
                  style={{ backgroundColor: isFuture ? "transparent" : LEVEL_COLORS[level] }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <span>Less</span>
        {LEVEL_COLORS.map((c) => (
          <span key={c} className="h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
