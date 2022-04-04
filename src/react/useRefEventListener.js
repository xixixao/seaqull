import { useEffect } from "react";

export function useRefEventListener(targetRef, eventName, listener) {
  useEffect(() => {
    const target = targetRef.current;
    target.addEventListener(eventName, listener);
    return () => {
      target.removeEventListener(eventName, listener);
    };
  }, [targetRef, eventName, listener]);
}
