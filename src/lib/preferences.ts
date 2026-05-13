export type PreferenceKey = "theme" | "lastSelectedTab" | "hasSeenInstallHint" | "hasAcceptedCameraPrivacyCopy";

export function getPreference(key: PreferenceKey) {
  return window.localStorage.getItem(key);
}

export function setPreference(key: PreferenceKey, value: string) {
  window.localStorage.setItem(key, value);
}
