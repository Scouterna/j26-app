import { type ReactNode, Suspense } from "react";

export type Props = {
  children: ReactNode;
  header?: ReactNode;
};

export function OnboardingLayout({ children, header }: Props) {
  return (
    <div className="w-dvw h-dvh flex flex-col">
      {header}

      <div className="flex-1 flex justify-center [view-transition-name:main-content]">
        <div className="max-w-lg md:max-h-120 w-full flex flex-col gap-4">
          <Suspense>{children}</Suspense>
        </div>
      </div>
    </div>
  );
}
