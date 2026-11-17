
"use client";

import Link from "next/link";

export default function EpisodeList({
  episodes,
  animeId,
}: {
  episodes: number;
  animeId: string;
}) {
  return (
    <div className="mt-8">
      <h2 className="mb-5 text-2xl font-bold">Episodes</h2>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-8">
        {Array.from({ length: episodes }, (_, i) => (
          <Link
            key={i}
            href={`/anime/${animeId}/watch/${i + 1}`}
            className="rounded-lg bg-[#181820] p-3 text-center font-semibold transition hover:bg-red-600"
          >
            EP {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}
