import { enGB, nl, sv, uk } from "date-fns/locale";
import { atom, useAtomValue } from "jotai";
import { jotaiStore } from "../jotai";
import { tolgeePromise } from "../tolgee";

export const languageAtom = atom<string>();

const tolgee = await tolgeePromise;
const initialLang = tolgee.getLanguage();
jotaiStore.set(languageAtom, initialLang);
if (initialLang) document.documentElement.lang = initialLang;
tolgee.on("language", ({ value }) => {
  jotaiStore.set(languageAtom, value);
  document.documentElement.lang = value;
});

export const useDateFnsLocale = () => {
  const currentLanguage = useAtomValue(languageAtom);

  switch (currentLanguage) {
    case "en":
      return enGB;
    case "uk":
      return uk;
    case "nl":
      return nl;
    default:
      return sv;
  }
};
