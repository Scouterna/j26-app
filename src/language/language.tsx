import { atom, createStore } from "jotai";
import { tolgee } from "../tolgee";

export const languageStore = createStore();

export const languageAtom = atom(tolgee.getLanguage());

tolgee.on("language", ({ value }) => {
  languageStore.set(languageAtom, value);
});
