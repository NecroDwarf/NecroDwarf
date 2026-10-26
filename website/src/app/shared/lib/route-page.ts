import type { ComponentType } from "react";

/** Resolve before renderToString/hydrateRoot. No Suspense fallback in SSG HTML. */
export function routePage(load: () => Promise<ComponentType>) {
  let Page: ComponentType | undefined;
  let pending: Promise<ComponentType> | undefined;
  return {
    preload() {
      return (pending ??= load()
        .then((loaded) => (Page = loaded))
        .catch((error) => {
          pending = undefined;
          throw error;
        }));
    },
    read() {
      if (!Page) throw new Error("Route must be preloaded before rendering");
      return Page;
    },
  };
}
