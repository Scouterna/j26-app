import type { ReactNode } from "react";
import { cn } from "../utils";

export type Props = {
  solid?: boolean;
  scrollable?: boolean;
  children?: ReactNode;
  className?: string;
};

export function PageContainer({
  solid,
  scrollable = true,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "h-full overflow-x-hidden",
        scrollable ? "overflow-y-auto" : "overflow-y-hidden",
        solid && "bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}
