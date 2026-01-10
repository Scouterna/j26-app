import { createFileRoute, Outlet } from "@tanstack/react-router";
import Logo from "../assets/logo.png";
import { OnboardingLayout } from "../components/onboarding/OnboardingLayout";

export const Route = createFileRoute("/onboarding")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <OnboardingLayout
      header={
        <div className="flex justify-center my-4">
          <img src={Logo} alt="Logo" className="h-24" />
        </div>
      }
    >
      <Outlet />
    </OnboardingLayout>
  );
}
