import type { ReactNode } from "react";

export type CardProps = {
  className?: string;
  children: ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

