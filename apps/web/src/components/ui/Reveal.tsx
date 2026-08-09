import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { useInView } from "../../hooks/useInView";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delayMs?: number;
}

export function Reveal({ children, delayMs = 0, className, ...props }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={clsx("reveal", inView && "reveal-in", className)}
      style={{ animationDelay: inView ? `${delayMs}ms` : undefined }}
      {...props}
    >
      {children}
    </div>
  );
}
