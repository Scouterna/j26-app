import { atom, createStore } from "jotai";
import { tolgeePromise } from "../tolgee";

export const languageStore = createStore();

export const languageAtom = atom();

const tolgee = await tolgeePromise;
languageStore.set(languageAtom, tolgee.getLanguage());
tolgee.on("language", ({ value }) => {
  languageStore.set(languageAtom, value);
});
