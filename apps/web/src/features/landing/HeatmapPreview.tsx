const LEVEL_COLORS = ["#f1f0fb", "#ddd6fe", "#c4b5fd", "#a78bfa", "#7c3aed"];

function seededLevel(week: number, day: number): number {
  const n = (week * 7 + day) * 2654435761;
  const bucket = Math.abs(n >> 13) % 10;
  if (bucket < 3) return 0;
  if (bucket < 5) return 1;
  if (bucket < 7) return 2;
  if (bucket < 9) return 3;
  return 4;
}

export function HeatmapPreview() {
  const weeks = 24;
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto">
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, d) => (
              <span
                key={d}
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: LEVEL_COLORS[seededLevel(w, d)] }}
              />
            ))}
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
