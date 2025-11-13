import { createRouter, RouterProvider } from "@tanstack/react-router";
import { TolgeeProvider } from "@tolgee/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./index.css";
import { tolgee } from "./tolgee";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
// biome-ignore lint/style/noNonNullAssertion: It's there.
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TolgeeProvider tolgee={tolgee} fallback="Loading...">
        <RouterProvider router={router} />
      </TolgeeProvider>
    </StrictMode>,
  );
}
