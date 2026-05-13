import { Workbox } from "workbox-window";

let registered = false;

export function registerPwaUpdateHandler() {
  if (registered || !("serviceWorker" in navigator) || import.meta.env.DEV) {
    return;
  }

  registered = true;
  window.addEventListener("load", () => {
    const wb = new Workbox("/sw.js");
    void wb.register();
  });
}
