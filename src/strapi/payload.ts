import { PayloadSDK } from "@payloadcms/sdk";
import { useAtomValue } from "jotai";
import { use } from "react";
import { configPromise } from "../config";
import { languageAtom } from "../language/language";

const createPayload = async () => {
  const config = await configPromise;
  return new PayloadSDK({
    baseURL: config.payloadApiUrl,
  });
};

const payloadPromise = createPayload();

export const usePayload = () => {
  const config = use(configPromise);
  const payload = use(payloadPromise);
  const currentLanguage = useAtomValue(languageAtom);

  const locale =
    currentLanguage && config.payloadLocales.includes(currentLanguage)
      ? currentLanguage
      : config.payloadLocales[0];

  return {
    payload,
    locale,
  };
};
