import type { ReactNode } from "react";

export type Props = {
  children: ReactNode;
};

export function OnboardingLayout({ children }: Props) {
  return (
    <div className="w-dvw h-dvh flex flex-col gap-4 [view-transition-name:main-content]">
      {children}
    </div>
  );
}
