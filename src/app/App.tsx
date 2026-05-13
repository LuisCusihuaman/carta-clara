import { RouterProvider } from "react-router-dom";
import { router } from "@app/router";
import { AppProviders } from "@app/providers";
import { registerPwaUpdateHandler } from "@app/pwaUpdate";

registerPwaUpdateHandler();

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
