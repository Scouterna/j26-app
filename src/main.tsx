import "./index.css";

import { createRouter, RouterProvider } from "@tanstack/react-router";
import { TolgeeProvider } from "@tolgee/react";
import { StrictMode, use } from "react";
import ReactDOM from "react-dom/client";

import "@scouterna/ui-webc/dist/ui-webc/ui-webc.css";

import { ScoutLoader } from "@scouterna/ui-react";
// Import the generated route tree
import { Provider as JotaiProvider } from "jotai";
import { UserLoader } from "./auth/auth";
import { NotFound } from "./components/NotFound";
import { DynamicRoutesProvider } from "./dynamic-routes/dynamic-routes-context";
import { IconProvider } from "./icons/icons";
import { jotaiStore } from "./jotai";
import { routeTree } from "./routeTree.gen";
import { tolgeePromise } from "./tolgee";

// Create a new router instance
const router = createRouter({ routeTree, defaultNotFoundComponent: NotFound });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <JotaiProvider store={jotaiStore}>
      {/* FIXME: For now we rely on Tolgee's internal Suspense component. We don't want to do this: https://github.com/tolgee/tolgee-js/issues/3487 */}
      {/* <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen w-screen">
            <ScoutLoader />
          </div>
        }
      > */}
      <UserLoader />

      <TolgeeProvider
        tolgee={use(tolgeePromise)}
        fallback={
          <div className="flex items-center justify-center h-screen w-screen">
            <ScoutLoader />
          </div>
        }
      >
        <DynamicRoutesProvider>
          <IconProvider>
            <RouterProvider router={router} />
          </IconProvider>
        </DynamicRoutesProvider>
      </TolgeeProvider>
      {/* </Suspense> */}
    </JotaiProvider>
  );
}

// Render the app
// biome-ignore lint/style/noNonNullAssertion: It's there.
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
