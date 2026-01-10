import ArrowLeftIcon from "@tabler/icons/outline/arrow-left.svg?raw";
import ArrowRightIcon from "@tabler/icons/outline/arrow-right.svg?raw";
import { T } from "@tolgee/react";
import { ScoutButtonLink } from "../links";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export type Props = {
  back?: string;
  next?: string;
  nextSuppressed?: boolean;
  lastPage?: boolean;
  onNextClick?: () => void;
};
export function OnboardingFooter({
  back,
  next,
  nextSuppressed,
  lastPage,
  onNextClick,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    async function preload() {
      try {
        await router.preloadRoute({
          to: next,
        });
        await router.preloadRoute({
          to: back,
        });
      } catch (err) {
        console.warn("Failed to preload onboarding routes", err);
      }
    }

    preload();
  }, [router, next, back]);

  return (
    <div className="px-4 pb-8 flex justify-between">
      {back ? (
        <ScoutButtonLink
          size="large"
          icon={ArrowLeftIcon}
          variant="outlined"
          iconPosition="before"
          to={back}
          viewTransition={{ types: ["slide-right"] }}
        >
          <T keyName="onboarding.button.back.label" />
        </ScoutButtonLink>
      ) : (
        <div />
      )}

      {next ? (
        <ScoutButtonLink
          size="large"
          icon={ArrowRightIcon}
          variant={nextSuppressed ? "outlined" : "primary"}
          to={next}
          viewTransition={{ types: ["slide-left"] }}
          onScoutClick={onNextClick}
        >
          {nextSuppressed ? (
            <T keyName="onboarding.button.skip.label" />
          ) : lastPage ? (
            <T keyName="onboarding.button.finish.label" />
          ) : (
            <T keyName="onboarding.button.next.label" />
          )}
        </ScoutButtonLink>
      ) : (
        <div />
      )}
    </div>
  );
}
