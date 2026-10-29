import { useEffect } from "react";
import { useLocation } from "react-router";
// Scope anchor handling to the newly published map navigation.
export function useMapAnchor(id?: string) {
  const { hash } = useLocation();
  useEffect(() => {
    if (!id || hash !== `#${id}`) return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView(),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash, id]);
}
