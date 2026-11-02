import { useCallback, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router";

/** Replace the current entry while editing; article → Back restores the full URL. */
const subscribe = () => () => {};
export function useUrlFilter(key: string, initial = "") {
  const { search } = useLocation();
  const navigate = useNavigate();
  // Static HTML always contains the complete catalog, including on a shared query URL.
  const hydratedSearch = useSyncExternalStore(
    subscribe,
    () => search,
    () => "",
  );
  const value = new URLSearchParams(hydratedSearch).get(key) ?? initial;
  const setValue = useCallback(
    (next: string, keepAnchor = false) => {
      const params = new URLSearchParams(window.location.search);
      if (next === initial) params.delete(key);
      else params.set(key, next);
      const query = params.toString();
      if (query === window.location.search.slice(1)) return;
      void navigate(
        {
          pathname: window.location.pathname,
          search: query ? `?${query}` : "",
          hash: keepAnchor ? window.location.hash : "",
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [key, initial, navigate],
  );
  return [value, setValue] as const;
}
