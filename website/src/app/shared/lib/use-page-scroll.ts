import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";
import type { Location, NavigationType } from "react-router";

const positions = new Map<string, number>();
// Native fragment links can reuse React Router's key (notably "default").
// Keep each anchor's position separate from the unanchored history entry.
const positionKey = (location: Location) => location.key + location.hash;
function rememberPosition(key: string) {
  positions.set(key, window.scrollY);
  if (positions.size > 100) positions.delete(positions.keys().next().value!);
}

export default function PageScroll({
  location,
  navigationType,
}: {
  location: Location;
  navigationType: NavigationType;
}) {
  const pendingLocation = useLocation();
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);
  useLayoutEffect(() => {
    // Capture the outgoing page before its DOM changes, even if its latest
    // scroll event has not fired yet or the destination module is still loading.
    if (positionKey(pendingLocation) !== positionKey(location))
      rememberPosition(positionKey(location));
  }, [pendingLocation.key, pendingLocation.hash, location.key, location.hash]);
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
    // A shorter destination may clamp scrollY and emit a scroll event before
    // the next frame. Keep that event from replacing the history snapshot.
    const savedPosition = positions.get(positionKey(location));
    const remember = () => rememberPosition(positionKey(location));
    const frame = requestAnimationFrame(() => {
      let anchor = location.hash.slice(1);
      try {
        anchor = decodeURIComponent(anchor);
      } catch {
        /* Keep malformed external anchors harmless. */
      }
      const target = anchor && document.getElementById(anchor);
      if (navigationType === "POP" && savedPosition !== undefined)
        window.scrollTo(0, savedPosition);
      else if (target) target.scrollIntoView();
      else if (changedPage) window.scrollTo(0, 0);
      if (changedPage && navigationType !== "POP")
        document.getElementById("main")?.focus({ preventScroll: true });
      remember();
      window.addEventListener("scroll", remember, { passive: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", remember);
    };
  }, [location.key, location.pathname, location.hash, navigationType]);
}
