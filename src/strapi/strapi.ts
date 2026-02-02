import { strapi } from "@strapi/client";
import { useAtomValue } from "jotai";
import { use } from "react";
import { configPromise } from "../config";
import { languageAtom } from "../language/language";

const createStrapi = async () => {
  const config = await configPromise;
  return strapi({
    baseURL: config.strapiApiUrl,
    auth: config.strapiApiKey,
  });
};

const strapiPromise = createStrapi();

export const useStrapi = () => {
  const config = use(configPromise);
  const strapi = use(strapiPromise);
  const currentLanguage = useAtomValue(languageAtom);

  const locale =
    currentLanguage && config.strapiLocales.includes(currentLanguage)
      ? currentLanguage
      : config.strapiLocales[0];

  return {
    strapi,
    locale,
  };
};
