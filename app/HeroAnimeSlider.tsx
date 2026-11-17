
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Anime = {
  id: number;
  title: {
    english: string | null;
    romaji: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
  };
  genres: string[];
  averageScore: number | null;
  episodes: number | null;
};

export default function HeroAnimeSlider({
  anime,
}: {
  anime: Anime[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (anime.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % anime.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [anime.length]);

  if (anime.length === 0) return null;

  const currentAnime = anime[activeIndex];

  return (
    <div className="relative w-full">
      {/* RED GLOW */}
      <div className="absolute -inset-8 rounded-[40px] bg-red-600/20 blur-3xl" />

      {/* SLIDER */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#15151d] shadow-2xl shadow-black/60">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {anime.map((item) => (
            <Link
              key={item.id}
              href={`/anime/${item.id}`}
              className="group relative block w-full shrink-0"
            >
              <img
                src={item.coverImage.extraLarge || item.coverImage.large}
                alt={item.title.english || item.title.romaji}
                className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* DARK OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/20" />

              {/* TOP LABEL */}
              <div className="absolute left-5 top-5">
                <span className="rounded-md border border-red-400/40 bg-black/60 px-3 py-2 text-[10px] font-black tracking-[2px] text-red-300 backdrop-blur-md">
                  FII SPOTLIGHT
                </span>
              </div>

              {/* ANIME INFORMATION */}
              <div className="absolute bottom-0 w-full p-5 sm:p-6">
                <p className="text-[10px] font-bold tracking-[3px] text-red-400">
                  FEATURED ANIME
                </p>

                <h2 className="mt-2 line-clamp-2 text-2xl font-black sm:text-3xl">
                  {item.title.english || item.title.romaji}
                </h2>

                <p className="mt-2 line-clamp-1 text-xs text-zinc-300">
                  {item.genres.slice(0, 3).join(" · ")}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <span className="rounded-md bg-red-600 px-4 py-2 text-[10px] font-black tracking-wider transition group-hover:bg-red-500">
                    VIEW ANIME →
                  </span>

                  {item.averageScore !== null && (
                    <span className="text-xs font-bold text-yellow-400">
                      ★ {(item.averageScore / 10).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SLIDER CONTROLS */}
      <div className="relative mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {anime.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show anime ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "w-8 bg-red-500"
                  : "w-3 bg-zinc-600 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous anime"
            onClick={() =>
              setActiveIndex(
                (current) => (current - 1 + anime.length) % anime.length
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-lg transition hover:border-red-500 hover:bg-red-600"
          >
            ←
          </button>

          <button
            type="button"
            aria-label="Next anime"
            onClick={() =>
              setActiveIndex((current) => (current + 1) % anime.length)
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-lg transition hover:border-red-500 hover:bg-red-600"
          >
            →
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] font-bold tracking-[2px] text-zinc-600">
        {String(activeIndex + 1).padStart(2, "0")} /{" "}
        {String(anime.length).padStart(2, "0")}
      </p>
    </div>
  );
}
