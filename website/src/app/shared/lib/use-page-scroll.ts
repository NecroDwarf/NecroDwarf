import { useEffect, useLayoutEffect, useRef } from "react";
import type { Location, NavigationType } from "react-router";

const positions = new Map<string, number>();

export default function PageScroll({
  location,
  navigationType,
}: {
  location: Location;
  navigationType: NavigationType;
}) {
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);
  usePageScroll(location, navigationType);
  return null;
}

export function usePageScroll(
  location: Location,
  navigationType: NavigationType,
) {
  const previousPath = useRef(location.pathname);
  useLayoutEffect(() => {
    const changedPage = previousPath.current !== location.pathname;
    previousPath.current = location.pathname;
    const frame = requestAnimationFrame(() => {
      let anchor = location.hash.slice(1);
      try {
        anchor = decodeURIComponent(anchor);
      } catch {
        /* Keep malformed external anchors harmless. */
      }
      const target = anchor && document.getElementById(anchor);
      if (navigationType === "POP" && positions.has(location.key))
        window.scrollTo(0, positions.get(location.key)!);
      else if (target) target.scrollIntoView();
      else if (changedPage) window.scrollTo(0, 0);
      if (changedPage && navigationType !== "POP")
        document.getElementById("main")?.focus({ preventScroll: true });
    });
    const remember = () => {
      positions.set(location.key, window.scrollY);
      if (positions.size > 100)
        positions.delete(positions.keys().next().value!);
    };
    window.addEventListener("scroll", remember, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", remember);
    };
  }, [location.key, location.pathname, location.hash, navigationType]);
}
