// import { FormatIcu } from "@tolgee/format-icu";
import {
  BackendFetch,
  DevTools,
  FormatSimple,
  LanguageDetector,
  Tolgee,
} from "@tolgee/react";
import { configPromise } from "./config";

function getLanguageName(lang: string): string {
  const dn = new Intl.DisplayNames([lang], { type: "language" });
  const name = dn.of(lang);
  return name || lang;
}

const createTolgee = async () => {
  const config = await configPromise;

  const tolgee = Tolgee()
    .use(
      BackendFetch({
        prefix: config.tolgeeBackendFetchPrefix,
      }),
    )
    .use(DevTools())
    .use(FormatSimple())
    // .use(FormatIcu())
    .use(LanguageDetector())
    .init({
      language: "sv",
      ns: ["app", "navigation"],
      availableLanguages: ["sv", "en", "uk"],

      // for development
      apiUrl: config.tolgeeApiUrl,
      apiKey: config.tolgeeApiKey,
      projectId: config.tolgeeProjectId,
    });
  return tolgee;
};

export const tolgeePromise = createTolgee();

const createLanguageNames = async () => {
  const tolgee = await tolgeePromise;

  const languageNames: Record<string, string> = {};
  for (const lang of tolgee.getInitialOptions().availableLanguages ?? []) {
    languageNames[lang] = getLanguageName(lang);
  }

  return languageNames;
};

export const languageNamesPromise = createLanguageNames();
