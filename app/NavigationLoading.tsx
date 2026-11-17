
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationLoading() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(false);

    function handleClick(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) return;

      const link = target.closest("a");

      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);

      if (destination.origin !== window.location.origin) return;

      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search &&
        destination.hash === window.location.hash
      ) {
        return;
      }

      setLoading(true);
    }

    // Capture clicks BEFORE Next.js handles navigation.
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#08080b]/95 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-red-600" />
          <span className="text-3xl font-black">
            F<span className="text-red-600">.</span>
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-black tracking-widest">
            FII <span className="text-red-600">ANIME</span>
          </h1>

          <p className="mt-4 animate-pulse text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            Please Wait...
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Loading your page
          </p>
        </div>

        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-red-600" />
        </div>
      </div>
    </div>
  );
}
