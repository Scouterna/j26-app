import { ScoutButton } from "@scouterna/ui-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function getIsStandalone() {
  return (
    document.referrer.startsWith("android-app://") ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches
  );
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const expiryString = localStorage.getItem("j26-install-banner-expiry");

    if (expiryString) {
      const expiry = new Date(parseInt(expiryString, 10));
      const now = new Date();
      if (now < expiry) {
        return;
      }
    }

    const isStandalone = getIsStandalone();

    if (isStandalone) {
      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();

      // We don't want to show the prompt immediately
      setTimeout(() => {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      }, 1000);
    };

    // biome-ignore lint/suspicious/noExplicitAny: Simple workaround
    const previouslyDeferredPrompt = (window as any)
      .__scoutDeferredInstallPrompt;

    if (previouslyDeferredPrompt) {
      onBeforeInstallPrompt(previouslyDeferredPrompt);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const onInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    });
  }, [deferredPrompt]);

  const onCloseClick = useCallback(() => {
    // Set expiry time in localstorage to 1 day
    setDeferredPrompt(null);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    localStorage.setItem(
      "j26-install-banner-expiry",
      expiry.getTime().toString(),
    );
  }, []);

  return (
    <motion.div
      className="flex flex-col overflow-hidden"
      initial={{ height: 0 }}
      animate={{
        height: deferredPrompt ? "auto" : 0,
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
          Det finns inte alltid WiFi på lägerområdet. Installera appen för att
          kunna använda den offline!
        </p>

        <div className="flex justify-end gap-2">
          <ScoutButton variant="outlined" onScoutClick={onCloseClick}>
            Stäng
          </ScoutButton>
          <ScoutButton variant="primary" onScoutClick={onInstallClick}>
            Installera appen
          </ScoutButton>
        </div>
      </div>
    </motion.div>
  );
}
