import { Link } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import { Round } from "@suzume/shared-types";
import { Badge } from "../../components/ui/Badge";
import { roundStatusStyles } from "../../utils/statusStyles";
import { formatDateTime, titleCase } from "../../utils/format";

export function Timeline({ rounds, onComplete }: { rounds: Round[]; onComplete?: (roundId: string) => void }) {
  const sorted = [...rounds].sort((a, b) => {
    if (!a.scheduledAt) return 1;
    if (!b.scheduledAt) return -1;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  return (
    <div className="flex flex-col">
      {sorted.map((round, idx) => {
        const isCompleted = round.status === "COMPLETED";
        const isLast = idx === sorted.length - 1;
        return (
          <div key={round.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              {isCompleted ? (
                <CheckCircle2 size={20} className="text-emerald-500" fill="currentColor" strokeWidth={0} />
              ) : round.status === "PREPARING" ? (
                <div className="flex h-5 w-5 items-center justify-center">
                  <div className="h-3 w-3 rounded-full border-2 border-primary-600 bg-primary-100" />
                </div>
              ) : (
                <Circle size={20} className="text-slate-300" />
              )}
              {!isLast && <div className="my-1 w-px flex-1 bg-slate-200" style={{ minHeight: 32 }} />}
            </div>
            <div className={`flex flex-1 items-start justify-between gap-2 ${isLast ? "" : "pb-6"}`}>
              <div>
                {round.experience ? (
                  <Link
                    to={`/experiences/${round.experience.id}`}
                    className="text-sm font-medium text-slate-800 hover:text-primary-600"
                  >
                    {round.title}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-slate-800">{round.title}</p>
                )}
                <p className="text-xs text-slate-400">{formatDateTime(round.scheduledAt)}</p>
                {isCompleted && !round.experience && (
                  <Link
                    to={`/experiences/new?roundId=${round.id}`}
                    className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline"
                  >
                    + Record Experience
                  </Link>
                )}
                {!isCompleted && round.status !== "CANCELLED" && onComplete && (
                  <button
                    onClick={() => onComplete(round.id)}
                    className="mt-1 block text-xs font-medium text-primary-600 hover:underline"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
              <Badge className={roundStatusStyles[round.status]}>{titleCase(round.status)}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
