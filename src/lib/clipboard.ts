export async function copyText(text: string) {
  if (!navigator.clipboard) return false;
  await navigator.clipboard.writeText(text);
  return true;
}
