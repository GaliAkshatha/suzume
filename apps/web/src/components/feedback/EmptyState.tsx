import { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      {icon && <div className="mb-1 text-slate-300">{icon}</div>}
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
