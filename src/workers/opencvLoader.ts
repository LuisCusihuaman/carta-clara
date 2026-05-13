let initialized: Promise<void> | undefined;

export function loadOpenCv() {
  initialized ??= Promise.resolve();
  return initialized;
}
