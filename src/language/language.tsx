import { enGB, nl, sv, uk } from "date-fns/locale";
import { atom, useAtomValue } from "jotai";
import { jotaiStore } from "../jotai";
import { saveLanguageForSW } from "../notifications/sw-language";
import { tolgeePromise } from "../tolgee";

export const languageAtom = atom<string>();

async function setLanguage(language: string) {
  jotaiStore.set(languageAtom, language);
  document.documentElement.lang = language;
  await cookieStore.set({
    name: "j26-language",
    value: language,
    path: "/",
    sameSite: "lax",
  });
  saveLanguageForSW(language);
}

const tolgee = await tolgeePromise;
const initialLanguage = tolgee.getLanguage();
if (initialLanguage) {
  await setLanguage(initialLanguage);
}

tolgee.on("language", ({ value }) => setLanguage(value));

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
