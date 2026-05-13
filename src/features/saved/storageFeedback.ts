export async function runRecoverableStorageAction(action: () => Promise<unknown>) {
  try {
    await action();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error };
  }
}
