import { enGB, sv, uk } from "date-fns/locale";
import { atom, useAtomValue } from "jotai";
import { jotaiStore } from "../jotai";
import { tolgeePromise } from "../tolgee";

export const languageAtom = atom();

const tolgee = await tolgeePromise;
jotaiStore.set(languageAtom, tolgee.getLanguage());
tolgee.on("language", ({ value }) => {
  jotaiStore.set(languageAtom, value);
});

export const useDateFnsLocale = () => {
  const currentLanguage = useAtomValue(languageAtom);
  console.log(currentLanguage);

  switch (currentLanguage) {
    case "en":
      return enGB;
    case "uk":
      return uk;
    default:
      return sv;
  }
};
