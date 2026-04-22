import { useRegisterSW } from "virtual:pwa-register/react";
import { ScoutButton } from "@scouterna/ui-react";
import { motion } from "motion/react";
import { cn } from "../utils";

export function PwaReloadBanner() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const visible = offlineReady || needRefresh;

  return (
    <motion.div
      className="flex flex-col overflow-hidden"
      initial={{ height: 0 }}
      animate={{
        height: visible ? "auto" : 0,
        transition: {
          duration: 1,
          ease: "easeInOut",
        },
      }}
    >
      <div
        className={`${cn(
          "p-4 flex flex-col gap-2 border-b border-blue-500",
          "bg-[#8dacc6] text-blue-700 shadow-md",
        )}  text-body-xl `}
      >
        <p>
          {offlineReady
            ? "App ready to work offline"
            : "New content available, click on reload button to update."}
        </p>

        <div className="flex justify-end gap-2">
          <ScoutButton variant="outlined" onScoutClick={close}>
            Close
          </ScoutButton>
          {needRefresh && (
            <ScoutButton
              variant="primary"
              onScoutClick={() => updateServiceWorker(true)}
            >
              Reload
            </ScoutButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}
