export function lightHaptic() {
  if ("vibrate" in navigator) {
    navigator.vibrate(8);
  }
}
