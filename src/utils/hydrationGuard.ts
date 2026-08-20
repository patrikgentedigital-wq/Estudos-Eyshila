export function createHydrationGuard() {
  let active = true;
  return {
    cancel: () => {
      active = false;
    },
    isActive: () => active,
  };
}
