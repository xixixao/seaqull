import { useEffect } from "react";

export function useEventListener(target, eventName, listener) {
  useEffect(() => {
    target.addEventListener(eventName, listener);
    return () => {
      target.removeEventListener(eventName, listener);
    };
  }, [target, eventName, listener]);
}
