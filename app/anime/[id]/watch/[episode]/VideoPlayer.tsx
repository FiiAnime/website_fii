
"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) return;

    if (Hls.isSupported() && src.includes(".m3u8")) {
      const hls = new Hls();

      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }

    video.src = src;

    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-black text-gray-400">
        Video source is not connected yet.
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      className="aspect-video w-full rounded-xl bg-black"
    />
  );
}
