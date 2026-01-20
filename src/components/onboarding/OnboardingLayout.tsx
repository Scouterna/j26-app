import { type ReactNode, Suspense } from "react";

export type Props = {
  children: ReactNode;
  header?: ReactNode;
};

export function OnboardingLayout({ children, header }: Props) {
  return (
    <div className="w-dvw h-dvh flex flex-col">
      {header}

      <div className="flex-1 flex flex-col gap-4 [view-transition-name:main-content]">
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}
