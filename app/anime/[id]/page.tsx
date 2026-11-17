
export const instant = false;

import Link from "next/link";
import { Tv, Star, Headphones } from "lucide-react";
import EpisodeList from "../EpisodeList";

type Props = {
  params: Promise<{ id: string }>;
};

type ReanimeResponse = {
  reanime?: {
    episodes?: {
      sub?: unknown[];
    };
  };
};

type Anime = {
  id: number;
  isAdult: boolean;
  title: {
    english: string | null;
    romaji: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
  };
  description: string | null;
  episodes: number | null;
  averageScore: number | null;
  genres: string[];
};

export default async function AnimeDetails({ params }: Props) {
  const { id } = await params;

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          english
          romaji
        }
        coverImage {
          extraLarge
          large
        }
        description(asHtml: false)
        episodes
        averageScore
        genres
        isAdult
      }
    }
  `;

  let anime: Anime | null = null;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { id: Number(id) },
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Could not load anime details");

    const result = await response.json();
    anime = result.data?.Media ?? null;
  } catch (error) {
    console.error("AniList error:", error);
  }

  if (!anime) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080b] px-5 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black">Anime Not Found</h1>
          <p className="mt-3 text-gray-400">
            We couldn't load this anime.
          </p>
          <Link
            href="/anime"
            className="mt-6 inline-block rounded-xl bg-red-600 px-6 py-3 font-bold transition hover:-translate-y-1 hover:bg-red-700"
          >
            Back to Anime
          </Link>
        </div>
      </main>
    );
  }

  let reanimeEpisodeCount: number | null = null;

  try {
    const episodeResponse = await fetch(
      `http://localhost:4000/episodes/reanime/${id}`,
      { cache: "no-store" }
    );

    if (!episodeResponse.ok) {
      throw new Error("Could not load Reanime episodes");
    }

    const episodeData: ReanimeResponse = await episodeResponse.json();
    const subEpisodes = episodeData.reanime?.episodes?.sub;

    if (Array.isArray(subEpisodes) && subEpisodes.length > 0) {
      reanimeEpisodeCount = subEpisodes.length;
    }
  } catch (error) {
    console.error("Reanime episode error:", error);
  }

  const episodeCount =
    reanimeEpisodeCount ??
    (typeof anime.episodes === "number" && anime.episodes > 0
      ? anime.episodes
      : null);

  const title = anime.title.english || anime.title.romaji;
  const poster = anime.coverImage.extraLarge || anime.coverImage.large;

  const score = anime.averageScore
    ? (anime.averageScore / 10).toFixed(1)
    : "N/A";

  const description =
    anime.description?.replace(/<[^>]*>/g, "").trim() ||
    "No description available for this anime.";

  return (
    <main className="min-h-screen overflow-hidden bg-[#08080b] text-white">

      {/* BACKGROUND POSTER */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[650px] bg-cover bg-center opacity-[0.17] blur-2xl"
        style={{ backgroundImage: `url("${poster}")` }}
      />

      {/* NAVIGATION */}
      <header className="fii-nav sticky top-0 z-50 border-b border-white/[0.06] bg-[#08080b]/85 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <Link
            href="/"
            className="fii-logo text-2xl font-black tracking-tighter"
          >
            <span className="text-red-500">FII</span> ANIME
            <span className="ml-2 hidden text-[9px] font-medium tracking-[3px] text-zinc-500 sm:inline">
              YOUR ANIME WORLD
            </span>
          </Link>

          <div className="flex items-center gap-7 text-sm font-medium text-zinc-400">
            <Link href="/" className="fii-nav-link">
              Home
            </Link>
            <Link href="/anime" className="fii-nav-link text-white">
              Anime
            </Link>
          </div>

        </nav>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-10">

        {/* BREADCRUMB */}
        <div className="fii-details-breadcrumb mb-9 flex flex-wrap items-center gap-3 text-xs font-medium tracking-wide text-zinc-500">
          <Link href="/" className="transition hover:text-red-400">
            Home
          </Link>
          <span>/</span>
          <Link href="/anime" className="transition hover:text-red-400">
            Anime
          </Link>
          <span>/</span>
          <span className="max-w-[200px] truncate text-zinc-300">
            {title}
          </span>
        </div>

        {/* ANIME HERO */}
        <section className="fii-details-panel overflow-hidden rounded-3xl border border-white/[0.07] bg-[#111116]/90 shadow-2xl shadow-black/40">

          <div className="grid gap-10 p-5 sm:p-8 md:grid-cols-[300px_1fr] md:gap-12 md:p-10">

            {/* POSTER */}
            <div className="fii-details-poster-wrap mx-auto w-full max-w-[300px]">
              <div className="fii-details-poster group relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60">

                <img
                  src={poster}
                  alt={title}
                  className="fii-details-poster-image aspect-[2/3] w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 rounded-md border border-white/20 bg-black/60 px-3 py-2 text-[9px] font-bold tracking-[2px] backdrop-blur-md">
                  <span className="text-red-400">FII</span> ANIME
                </div>

                <div className="fii-details-poster-shine pointer-events-none absolute inset-0" />

              </div>
            </div>

           {/* DETAILS */}
<div className="flex min-w-0 flex-col justify-center">

  <div className="mb-5 flex flex-wrap items-center gap-3">
    <span className="rounded-md bg-red-600 px-3 py-2 text-[9px] font-black tracking-[2px]">
      ANIME DETAILS
    </span>

  <span className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-[9px] font-black tracking-[2px] text-zinc-300">
  {anime.isAdult ? "18+" : "GENERAL"}
</span>
  </div>

              <h1 className="fii-details-title text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                {title}
              </h1>

              {anime.title.english && anime.title.romaji && (
                <p className="mt-3 text-sm font-medium text-zinc-500 sm:text-base">
                  {anime.title.romaji}
                </p>
              )}

              {/* STATS - NO HOVER ANIMATIONS */}
              <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3">

                {/* EPISODES */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4">

                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-red-500" />

                    <p className="text-[10px] font-bold tracking-[2px] text-zinc-500">
                      EPISODES
                    </p>
                  </div>

                  <p className="mt-3 text-3xl font-black">
                    {episodeCount ?? "?"}
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-600">
                    SUB Episodes
                  </p>

                </div>

                {/* RATING */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4">

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                    <p className="text-[10px] font-bold tracking-[2px] text-zinc-500">
                      RATING
                    </p>
                  </div>

                  <p className="mt-3 text-3xl font-black text-yellow-400">
                    {score}
                    <span className="text-sm text-zinc-500"> / 10</span>
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-600">
                    AniList Score
                  </p>

                </div>

                {/* AUDIO */}
                <div className="col-span-2 rounded-xl border border-white/[0.07] bg-white/[0.035] p-4 sm:col-span-1">

                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-red-500" />

                    <p className="text-[10px] font-bold tracking-[2px] text-zinc-500">
                      AUDIO
                    </p>
                  </div>

                  <p className="mt-3 text-3xl font-black">
                    SUB
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-600">
                    Japanese Audio
                  </p>

                </div>

              </div>

              {/* GENRES */}
              <div className="mt-9">
                <p className="mb-4 text-[10px] font-bold tracking-[3px] text-zinc-500">
                  GENRES
                </p>

                <div className="flex flex-wrap gap-2">
                  {anime.genres?.map((genre, index) => (
                    <span
                      key={genre}
                      className="fii-details-genre"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="border-t border-white/[0.07] bg-black/20 px-6 py-8 sm:px-10 sm:py-10">

            <div className="mb-5 flex items-center gap-3">
              <div className="h-7 w-[3px] rounded-full bg-red-500" />

              <h2 className="text-xl font-black tracking-tight">
                About This <span className="text-red-500">Anime</span>
              </h2>
            </div>

            <p className="max-w-5xl whitespace-pre-line text-sm leading-8 text-zinc-400">
              {description}
            </p>

          </div>

        </section>

        {/* EPISODES */}
        <section className="fii-details-episodes mt-14">

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

            <div>
              <p className="mb-3 text-[10px] font-bold tracking-[4px] text-red-400">
                START WATCHING
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Episode <span className="text-red-500">List</span>
              </h2>

              <p className="mt-3 text-sm text-zinc-500">
                Choose an episode and start watching.
              </p>
            </div>

            {episodeCount && (
              <span className="rounded-lg border border-white/[0.07] bg-[#15151d] px-4 py-3 text-xs font-bold text-zinc-400">
                {episodeCount} Episodes Available
              </span>
            )}

          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#111116] p-5 sm:p-7">
            {episodeCount ? (
              <EpisodeList episodes={episodeCount} animeId={id} />
            ) : (
              <div className="py-12 text-center text-sm text-zinc-500">
                Episode information is not available.
              </div>
            )}
          </div>

        </section>

        {/* BACK */}
        <div className="mt-12 text-center">
          <Link
            href="/anime"
            className="fii-details-back inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-4 text-xs font-bold tracking-wider text-zinc-300"
          >
            <span>←</span>
            BACK TO ANIME COLLECTION
          </Link>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="fii-footer border-t border-white/[0.06] bg-[#0c0c11] px-5 py-12 text-center">

        <p className="text-2xl font-black tracking-tighter">
          <span className="text-red-500">FII</span> ANIME
        </p>

        <p className="mt-3 text-xs tracking-wider text-zinc-500">
          YOUR WORLD. YOUR ANIME.
        </p>

        <div className="mt-6 flex justify-center gap-7 text-xs text-zinc-500">
          <Link href="/" className="fii-footer-link">
            Home
          </Link>

          <Link href="/anime" className="fii-footer-link">
            Anime
          </Link>
        </div>

        <p className="mt-7 text-[10px] text-zinc-700">
          © 2026 Fii Anime. All rights reserved.
        </p>

      </footer>

    </main>
  );
}
