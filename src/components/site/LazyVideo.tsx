"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { videoSources } from "@/lib/videoSources";

/**
 * Drop-in <video>: same clip, but it only downloads/plays while on screen and
 * prefers lighter renditions, so scrolling stays smooth.
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
    const nearIo = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px" });
    const visIo = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.1 });
    nearIo.observe(el);
    visIo.observe(el);
    return () => {
      nearIo.disconnect();
      visIo.disconnect();
    };
  }, []);

  useEffect(() => {
    if (near) ref.current?.load();
  }, [near]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !near) return;
    if (visible && autoPlay) v.play().catch(() => {});
    else v.pause();
  }, [near, visible, autoPlay]);

  return (
    <video ref={ref} preload="none" playsInline loop disablePictureInPicture {...rest}>
      {near && typeof src === "string" && videoSources(src, { small: true }).map((s) => <source key={s} src={s} type="video/mp4" />)}
    </video>
  );
}
