import {
  BackendFetch,
  DevTools,
  FormatSimple,
  LanguageDetector,
  Tolgee,
} from "@tolgee/react";

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
    availableLanguages: ["sv", "en"],

    // for development
    apiUrl: import.meta.env.VITE_TOLGEE_API_URL,
    apiKey: import.meta.env.VITE_TOLGEE_API_KEY,
    projectId: import.meta.env.VITE_TOLGEE_PROJECT_ID,
  });
