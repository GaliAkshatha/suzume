import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white shadow-card",
        className
      )}
      {...props}
    />
  );
}
