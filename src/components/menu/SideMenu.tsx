import { ScoutAppBar, ScoutButton } from "@scouterna/ui-react";
import ChevronLeftIcon from "@tabler/icons/outline/chevron-left.svg?raw";
import { T } from "@tolgee/react";
import { useAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { useIsDesktop } from "../../hooks/breakpoint";
import { MoreList } from "./MoreList";
import { sideMenuOpenAtom } from "./menuState";

export function SideMenu() {
  const width = 256;

  const [sideMenuOpen, setSideMenuOpen] = useAtom(sideMenuOpenAtom);
  const isDesktop = useIsDesktop();
  const showSideMenu = isDesktop && sideMenuOpen;

  return (
    <AnimatePresence initial={false}>
      {showSideMenu && (
        <motion.div
          animate={{ width }}
          exit={{ width: 0 }}
          className="relative overflow-hidden"
        >
          <div
            style={{ width }}
            className="absolute h-full flex flex-col right-0 border-r border-gray-200"
          >
            <ScoutAppBar>
              <ScoutButton
                slot="suffix"
                icon={ChevronLeftIcon}
                iconOnly
                variant="text"
                onClick={() => {
                  setSideMenuOpen(false);
                }}
              >
                <T ns="app" keyName="appBar.closeMenu.label" />
              </ScoutButton>
            </ScoutAppBar>

            <MoreList className="flex-1" includeBottomNavItems useFullHeight />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
