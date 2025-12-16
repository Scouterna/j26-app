import {
  BackendFetch,
  DevTools,
  FormatSimple,
  LanguageDetector,
  Tolgee,
} from "@tolgee/react";

function getLanguageName(lang: string): string {
  const dn = new Intl.DisplayNames([lang], { type: "language" });
  const name = dn.of(lang);
  return name || lang;
}

export const tolgee = Tolgee()
  .use(
    BackendFetch({
      prefix: import.meta.env.VITE_TOLGEE_BACKEND_FETCH_PREFIX,
    }),
  )
  .use(DevTools())
  .use(FormatSimple())
  .use(LanguageDetector())
  .init({
    language: "sv",
    ns: ["app", "navigation"],
    availableLanguages: ["sv", "en", "uk"],

    // for development
    apiUrl: import.meta.env.VITE_TOLGEE_API_URL,
    apiKey: import.meta.env.VITE_TOLGEE_API_KEY,
    projectId: import.meta.env.VITE_TOLGEE_PROJECT_ID,
  });

export const languageNames: Record<string, string> = {};
for (const lang of tolgee.getInitialOptions().availableLanguages ?? []) {
  languageNames[lang] = getLanguageName(lang);
}
