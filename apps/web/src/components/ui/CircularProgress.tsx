interface Props {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function CircularProgress({ percent, size = 80, strokeWidth = 7, color = "#7c3aed", label }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f0fb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold text-slate-900">{clamped}%</span>
        {label && <span className="text-[10px] text-slate-400">{label}</span>}
      </div>
    </div>
  );
}
