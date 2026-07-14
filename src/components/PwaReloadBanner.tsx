import { useRegisterSW } from "virtual:pwa-register/react";
import { ScoutButton, ScoutCallout } from "@scouterna/ui-react";
import { useTranslate } from "@tolgee/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

// How long a dismissed update prompt stays hidden before it reappears. Dismiss
// is a snooze, not a permanent hide, so an ignored update never leaves a user
// permanently stale.
const SNOOZE_MS = 10 * 60 * 1000;

export function PwaReloadBanner() {
  const { t } = useTranslate("app");
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [snoozed, setSnoozed] = useState(false);

  // Apply a waiting update automatically the next time the app is backgrounded.
  // Reloading a hidden tab is invisible — the user returns to the fresh version
  // with nothing interrupted — so the vast majority update without ever
  // touching the banner. The banner stays as a manual "update now" fallback.
  useEffect(() => {
    if (!needRefresh) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        updateServiceWorker(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [needRefresh, updateServiceWorker]);

  // Clear the snooze after a while so the prompt comes back for active users.
  useEffect(() => {
    if (!snoozed) return;
    const timer = setTimeout(() => setSnoozed(false), SNOOZE_MS);
    return () => clearTimeout(timer);
  }, [snoozed]);

  const dismiss = () => {
    if (needRefresh) {
      setSnoozed(true);
    } else {
      setOfflineReady(false);
    }
  };

  const visible = needRefresh ? !snoozed : offlineReady;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          // Fixed overlay so the prompt floats over content instead of
          // reflowing the page. Bottom-anchored and safe-area aware; the extra
          // bottom padding on small screens clears the mobile bottom navigation
          // (hidden on md+). pointer-events-none lets clicks pass through the
          // transparent padding; the callout re-enables them.
          className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-[calc(env(safe-area-inset-bottom)+1rem)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <ScoutCallout
            className="pointer-events-auto w-full max-w-md shadow-lg"
            variant={needRefresh ? "info" : "success"}
            heading={
              needRefresh
                ? t("pwa.updateAvailable.heading")
                : t("pwa.offlineReady.heading")
            }
            dismissible
            onScoutDismiss={dismiss}
          >
            {needRefresh
              ? t("pwa.updateAvailable.body")
              : t("pwa.offlineReady.body")}

            {needRefresh && (
              <ScoutButton
                slot="actions"
                variant="primary"
                onScoutClick={() => updateServiceWorker(true)}
              >
                {t("pwa.reload.label")}
              </ScoutButton>
            )}
          </ScoutCallout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
