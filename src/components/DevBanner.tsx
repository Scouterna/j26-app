import XIcon from "@tabler/icons/outline/x.svg?raw";
import { AnimatePresence, motion } from "motion/react";
import { use, useState } from "react";
import { configPromise } from "../config";
import { cn } from "../utils";

export function DevBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { devBannerMessage } = use(configPromise);

  if (!devBannerMessage) {
    return;
  }

  return (
    <AnimatePresence initial={false}>
      {!dismissed && (
        <motion.div
          className="flex flex-col overflow-hidden"
          exit={{
            height: 0,
            transition: {
              duration: 1,
              ease: "easeInOut",
            },
          }}
        >
          <div
            className={`${cn(
              "relative",
              "p-1 flex justify-center gap-2 border-b border-black",
              "bg-[repeating-linear-gradient(45deg,black,black_10px,yellow_10px,yellow_20px)]",
            )}  text-body-base `}
          >
            <p className="bg-[yellow] text-black px-1 rounded-xs">
              {devBannerMessage}
            </p>

            <button
              type="button"
              className={cn(
                "absolute top-1/2 right-2 -translate-y-1/2 bg-[yellow] text-black border-2 border-black p-0.5 rounded cursor-pointer",
                "hover:bg-black hover:text-[yellow] ",
              )}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: I don't want to install the React icon library just for this one icon
              dangerouslySetInnerHTML={{ __html: XIcon }}
              onClick={() => setDismissed(true)}
              aria-label="Close banner"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
