import { BackendFetch, DevTools, FormatSimple, Tolgee } from "@tolgee/react";

export const tolgee = Tolgee()
  .use(
    BackendFetch({
      prefix: import.meta.env.VITE_APP_TOLGEE_BACKEND_FETCH_PREFIX,
    }),
  )
  .use(DevTools())
  .use(FormatSimple())
  .init({
    language: "sv",
    ns: ["app", "sidebar"],

    // for development
    apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL,
    apiKey: import.meta.env.VITE_APP_TOLGEE_API_KEY,
    projectId: import.meta.env.VITE_APP_TOLGEE_PROJECT_ID,
  });
