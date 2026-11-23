"use client";

import { useCallback, useSyncExternalStore } from "react";
import { LANGS, type Lang } from "@/lib/i18n";

const KEY = "naija_hub_lang";
const EVT = "nh-lang";

function read(): Lang {
  try {
    const v = window.localStorage.getItem(KEY) as Lang | null;
    if (v && LANGS.some((l) => l.key === v)) return v;
  } catch {
    /* storage unavailable */
  }
  return "en";
}
function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Language shared by every page and component; survives reloads. */
export function useLang(): [Lang, (l: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, read, () => "en" as Lang);
  const set = useCallback((l: Lang) => {
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* storage unavailable */
    }
    document.documentElement.lang = l === "pcm" ? "en" : l;
    window.dispatchEvent(new Event(EVT));
  }, []);
  return [lang, set];
}
