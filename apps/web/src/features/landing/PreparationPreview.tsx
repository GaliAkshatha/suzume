import { useEffect, useState } from "react";
import { CircularProgress } from "../../components/ui/CircularProgress";
import { useInView } from "../../hooks/useInView";

const TOPICS = [
  { name: "DSA", target: 82, color: "#7c3aed" },
  { name: "SQL", target: 74, color: "#10b981" },
  { name: "DBMS", target: 64, color: "#3b82f6" },
  { name: "System Design", target: 37, color: "#8b5cf6" },
];

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame: number;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return value;
}

function TopicRing({ name, target, color, active }: { name: string; target: number; color: string; active: boolean }) {
  const value = useCountUp(target, active);
  return (
    <div className="flex flex-col items-center gap-2">
      <CircularProgress percent={value} color={color} size={72} strokeWidth={6} />
      <span className="text-xs font-medium text-slate-600">{name}</span>
    </div>
  );
}

export function PreparationPreview() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {TOPICS.map((t) => (
        <TopicRing key={t.name} {...t} active={inView} />
      ))}
    </div>
  );
}
