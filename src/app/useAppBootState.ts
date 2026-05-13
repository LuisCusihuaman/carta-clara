import { useEffect, useState } from "react";

export type AppBootState =
  | "loading-shell"
  | "loading-summaries"
  | "search-ready"
  | "offline-ready"
  | "update-available"
  | "storage-error";

const labels: Record<AppBootState, string> = {
  "loading-shell": "Iniciando",
  "loading-summaries": "Cargando cartas",
  "search-ready": "Lista",
  "offline-ready": "Offline",
  "update-available": "Actualizacion",
  "storage-error": "Storage"
};

export function useAppBootState() {
  const [state, setState] = useState<AppBootState>("loading-shell");

  useEffect(() => {
    const nextState = window.navigator.onLine ? "search-ready" : "offline-ready";
    const id = window.setTimeout(() => setState(nextState), 150);
    const online = () => setState("search-ready");
    const offline = () => setState("offline-ready");
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  return { state, label: labels[state] };
}
