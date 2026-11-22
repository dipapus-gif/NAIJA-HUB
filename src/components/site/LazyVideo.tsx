"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

/**
 * Drop-in <video> that only downloads and plays while it is near the viewport.
 * Several 4K background videos playing at once is what made the page lag.
 */
export function LazyVideo({ src, autoPlay, ...rest }: VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      setVisible(true);
      return;
    }
    const nearIo = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "400px" });
    const visIo = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    nearIo.observe(el);
    visIo.observe(el);
    return () => {
      nearIo.disconnect();
      visIo.disconnect();
    };
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !near) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (visible && autoPlay && !reduce && !document.hidden) v.play().catch(() => {});
    else v.pause();
  }, [near, visible, autoPlay]);

  return <video ref={ref} src={near ? src : undefined} preload="none" playsInline loop {...rest} />;
}
