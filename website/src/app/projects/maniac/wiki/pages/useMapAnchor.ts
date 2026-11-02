import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";
// Scope anchor handling to the newly published map navigation.
export function useMapAnchor(id?: string) {
  const { hash } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType === "POP" || !id || hash !== `#${id}`) return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView(),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash, id, navigationType]);
}
