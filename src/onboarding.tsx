import { atomWithStorage } from "jotai/utils";

export const onboardedAtom = atomWithStorage("onboarded", false, undefined, {
  getOnInit: true,
});
