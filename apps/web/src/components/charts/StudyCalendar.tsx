import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { PreparationActivityDay } from "@suzume/shared-types";

interface Props {
  days: PreparationActivityDay[];
  onSelectDay: (date: string) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function StudyCalendar({ days, onSelectDay }: Props) {
  const [cursor, setCursor] = useState(new Date());
  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const grid = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const result: Date[] = [];
    const d = new Date(start);
    while (d <= end) {
      result.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return result;
  }, [cursor]);

  const today = new Date();
  const monthLabel = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-[10px] font-medium text-slate-400">
            {w}
          </span>
        ))}
        {grid.map((date) => {
          const key = date.toISOString().slice(0, 10);
          const day = dayMap.get(key);
          const inMonth = date.getMonth() === cursor.getMonth();
          const isToday = date.toDateString() === today.toDateString();
          const hasActivity = !!day && (day.minutes > 0 || day.questionsSolved > 0);

          return (
            <button
              key={key}
              onClick={() => hasActivity && onSelectDay(key)}
              disabled={!hasActivity}
              className={clsx(
                "flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors",
                !inMonth && "text-slate-300",
                inMonth && !hasActivity && "text-slate-600",
                hasActivity && "cursor-pointer bg-primary-50 font-semibold text-primary-700 hover:bg-primary-100",
                isToday && "ring-2 ring-primary-400"
              )}
              title={hasActivity ? `${day!.minutes}m · ${day!.questionsSolved} questions` : undefined}
            >
              {date.getDate()}
              {hasActivity && <span className="h-1 w-1 rounded-full bg-primary-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
