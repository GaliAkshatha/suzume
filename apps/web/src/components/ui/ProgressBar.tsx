interface Props {
  percent: number;
  color?: string;
}

export function ProgressBar({ percent, color = "#7c3aed" }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-2 w-full rounded-full bg-[#f1f0fb]">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
