import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { calendarApi } from "../../services/api/calendarApi";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { formatTime } from "../../utils/format";
import clsx from "clsx";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const rangeStart = useMemo(() => {
    const s = startOfMonth(cursor);
    s.setDate(s.getDate() - s.getDay() - 7);
    return s;
  }, [cursor]);
  const rangeEnd = useMemo(() => {
    const e = endOfMonth(cursor);
    e.setDate(e.getDate() + (6 - e.getDay()) + 7);
    return e;
  }, [cursor]);

  const { data: events, loading, error, reload } = useAsyncData(
    () => calendarApi.events(rangeStart.toISOString(), rangeEnd.toISOString()),
    [rangeStart.getTime(), rangeEnd.getTime()]
  );

  const days = useMemo(() => {
    const start = new Date(startOfMonth(cursor));
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(endOfMonth(cursor));
    end.setDate(end.getDate() + (6 - end.getDay()));

    const result: Date[] = [];
    const d = new Date(start);
    while (d <= end) {
      result.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return result;
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, typeof events extends (infer U)[] | null ? U[] : never>();
    (events ?? []).forEach((event: any) => {
      const key = new Date(event.date).toDateString();
      const arr = map.get(key) ?? [];
      arr.push(event);
      map.set(key, arr);
    });
    return map;
  }, [events]);

  const monthLabel = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const today = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="mt-1 text-sm text-slate-400">Deadlines and rounds, derived automatically.</p>
        </div>
      </div>

      <Card className="p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{monthLabel}</h2>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setCursor(new Date())}>
              Today
            </Button>
            <div className="flex overflow-hidden rounded-lg border border-slate-200">
              <button
                onClick={() => setView("month")}
                className={clsx("px-3 py-1.5 text-xs font-medium", view === "month" ? "bg-primary-600 text-white" : "text-slate-600")}
              >
                Month
              </button>
              <button
                onClick={() => setView("week")}
                className={clsx("px-3 py-1.5 text-xs font-medium", view === "week" ? "bg-primary-600 text-white" : "text-slate-600")}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {loading && <PageSpinner />}
        {error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && (
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
            {WEEKDAYS.map((w) => (
              <div key={w} className="bg-slate-50 px-2 py-2 text-center text-xs font-semibold text-slate-400">
                {w}
              </div>
            ))}
            {(view === "month" ? days : days.filter((d) => d >= startOfWeek(today) && d < addDays(startOfWeek(today), 7))).map(
              (day) => {
                const inMonth = day.getMonth() === cursor.getMonth();
                const isToday = sameDay(day, today);
                const dayEvents = eventsByDay.get(day.toDateString()) ?? [];
                return (
                  <div
                    key={day.toISOString()}
                    className={clsx(
                      "min-h-[92px] bg-white p-1.5",
                      !inMonth && view === "month" && "bg-slate-50/60"
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday ? "bg-primary-600 text-white" : inMonth ? "text-slate-700" : "text-slate-300"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      {dayEvents.slice(0, 3).map((event: any) => (
                        <div
                          key={event.id}
                          className={clsx(
                            "truncate rounded-md px-1.5 py-1 text-[10px] font-medium leading-tight",
                            event.type === "DEADLINE" ? "bg-red-50 text-red-600" : "bg-primary-50 text-primary-700"
                          )}
                          title={`${event.title} · ${formatTime(event.date)}`}
                        >
                          {event.companyName}
                          {event.type !== "DEADLINE" && <span className="block opacity-70">{formatTime(event.date)}</span>}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{dayEvents.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function startOfWeek(d: Date) {
  const s = new Date(d);
  s.setDate(s.getDate() - s.getDay());
  s.setHours(0, 0, 0, 0);
  return s;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
