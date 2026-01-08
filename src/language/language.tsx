import { atom } from "jotai";
import { jotaiStore } from "../jotai";
import { tolgeePromise } from "../tolgee";

export const languageAtom = atom();

const tolgee = await tolgeePromise;
jotaiStore.set(languageAtom, tolgee.getLanguage());
tolgee.on("language", ({ value }) => {
  jotaiStore.set(languageAtom, value);
});
