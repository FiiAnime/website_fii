
export const instant = false;

import Link from "next/link";
import { connection } from "next/server";
import HeroAnimeSlider from "./HeroAnimeSlider";

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

type LatestEpisode = {
  id: number;
  title: string;
  episode: number;
  coverImage: string;
  airingAt: number;
};

// Get 18 popular anime
async function getAnime(): Promise<Anime[]> {
  const query = `
    query {
      Page(page: 1, perPage: 18) {
        media(
          sort: POPULARITY_DESC
          type: ANIME
          isAdult: false
        ) {
          id
          title {
            english
            romaji
          }
          coverImage {
            extraLarge
            large
          }
          genres
          averageScore
          episodes
        }
      }
    }
  `;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("AniList anime request failed:", response.status);
      return [];
    }

    const data = await response.json();
    return data.data?.Page?.media ?? [];
  } catch (error) {
    console.error("Could not load popular anime:", error);
    return [];
  }
}

// Get anime episodes aired in the last 7 days
async function getLatestEpisodes(): Promise<LatestEpisode[]> {
  await connection();

  const now = Math.floor(Date.now() / 1000);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60;

  const query = `
    query ($from: Int!, $to: Int!) {
      Page(page: 1, perPage: 50) {
        airingSchedules(
          airingAt_greater: $from
          airingAt_lesser: $to
          sort: TIME_DESC
        ) {
          episode
          airingAt
          media {
            id
            isAdult
            title {
              english
              romaji
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          from: sevenDaysAgo,
          to: now,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = await response.json();
    const schedules = data.data?.Page?.airingSchedules ?? [];

    return schedules
      .filter(
        (item: any) =>
          item.media &&
          item.media.isAdult === false &&
          item.media.coverImage?.large
      )
      .map(
        (item: any): LatestEpisode => ({
          id: item.media.id,
          title:
            item.media.title.english ||
            item.media.title.romaji,
          episode: item.episode,
          coverImage: item.media.coverImage.large,
          airingAt: item.airingAt,
        })
      );
  } catch (error) {
    console.error("Could not load latest episodes:", error);
    return [];
  }
}

export default async function Home() {
  const [animeList, latestEpisodes] = await Promise.all([
    getAnime(),
    getLatestEpisodes(),
  ]);

  const trendingAnime = animeList;
  const featuredAnime = trendingAnime[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#08080b] text-white">
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
            <Link href="/" className="fii-nav-link text-white">
              Home
            </Link>
            <Link href="/anime" className="fii-nav-link">
              Anime
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="fii-hero relative isolate overflow-hidden">
        {featuredAnime && (
          <div
            className="fii-hero-bg absolute inset-0 -z-20 scale-110 bg-cover bg-center opacity-30 blur-sm"
            style={{
              backgroundImage: `url(${featuredAnime.coverImage.extraLarge})`,
            }}
          />
        )}

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08080b] via-[#08080b]/90 to-[#08080b]/40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#08080b] via-transparent to-[#08080b]/30" />

        <div className="fii-hero-glow fii-glow-one absolute -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-red-700/20 blur-[120px]" />
        <div className="fii-hero-glow fii-glow-two absolute -right-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-red-700/10 blur-[120px]" />
        <div className="fii-hero-lines pointer-events-none absolute inset-0 -z-10 opacity-[0.06]" />

        <div className="mx-auto grid min-h-[580px] max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_0.9fr]">
          {/* HERO TEXT */}
          <div className="fii-hero-text">
            <div className="fii-welcome flex items-center gap-3">
              <span className="h-[2px] w-9 bg-red-500" />
              <span className="text-xs font-bold tracking-[4px] text-red-400">
                WELCOME TO FII ANIME
              </span>
            </div>

            <h1 className="fii-main-title mt-8 text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
              YOUR WORLD.
              <br />
              YOUR{" "}
              <span className="fii-gradient-text fii-anime-hero">
                ANIME.
              </span>
            </h1>

            <p className="fii-hero-description mt-7 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
              Discover unforgettable stories, legendary characters and
              incredible adventures. Everything starts with anime.
            </p>

            <div className="fii-hero-info mt-10 flex items-center gap-5">
              <div className="h-10 w-[3px] bg-red-500" />
              <div>
                <p className="text-sm font-bold tracking-wider">
                  ANIME · MOVIES · SERIES
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  A world made for anime fans.
                </p>
              </div>
            </div>
          </div>

          {/* AUTOMATIC ANIME POSTER SLIDER */}
          <div className="fii-featured-wrap relative mx-auto w-full max-w-[340px]">
            {trendingAnime.length > 0 ? (
              <HeroAnimeSlider anime={trendingAnime.slice(0, 8)} />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-white/10 bg-[#15151d]">
                <span className="text-2xl font-black">
                  <span className="text-red-500">FII</span> ANIME
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TRENDING ANIME */}
      <section id="trending" className="mx-auto max-w-7xl px-5 py-20">
        <div className="fii-section-heading mb-9 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[4px] text-red-400">
              HANDPICKED FOR YOU
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Trending <span className="text-red-500">Anime</span>
            </h2>
          </div>

          <span className="text-xs font-medium tracking-wider text-zinc-500">
            TOP 18 PICKS
          </span>
        </div>

        {trendingAnime.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {trendingAnime.map((anime, index) => (
              <Link
                href={`/anime/${anime.id}`}
                key={anime.id}
                className="fii-anime-card group min-w-0"
                style={{ "--card-index": index } as React.CSSProperties}
              >
                <div className="fii-poster-frame relative aspect-[3/4] overflow-hidden rounded-xl bg-[#17171e]">
                  <img
                    src={anime.coverImage.large}
                    alt={anime.title.english || anime.title.romaji}
                    loading="lazy"
                    className="fii-poster-image h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-80" />

                  <span className="absolute left-3 top-3 rounded border border-white/10 bg-black/60 px-2.5 py-1.5 text-[9px] font-bold tracking-widest text-white backdrop-blur-md">
                    {index === 0
                      ? "POPULAR"
                      : index === 2
                        ? "TRENDING"
                        : "ANIME"}
                  </span>

                  <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-sm font-bold leading-none backdrop-blur-md transition duration-300 group-hover:border-red-500 group-hover:bg-red-600">
                    <span className="block translate-y-[-1px]">→</span>
                  </div>

                  <div className="fii-poster-shine pointer-events-none absolute inset-0" />
                </div>

                <h3 className="mt-4 truncate text-sm font-bold transition group-hover:text-red-400">
                  {anime.title.english || anime.title.romaji}
                </h3>

                <p className="mt-1 truncate text-[11px] text-zinc-500">
                  {anime.genres.slice(0, 2).join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-white/10 bg-[#15151d] p-8 text-center text-zinc-400">
            Anime posters could not load. Please refresh the page.
          </p>
        )}
      </section>

      {/* LATEST EPISODES */}
      <section
        id="latest"
        className="border-y border-white/[0.06] bg-[#0d0d12]"
      >
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="fii-section-heading mb-9">
            <p className="text-[10px] font-bold tracking-[4px] text-red-400">
              FRESH UPDATES
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Latest <span className="text-red-500">Episodes</span>
            </h2>

            <p className="mt-3 text-sm text-zinc-500">
              Recently aired anime episodes from the last 7 days.
            </p>
          </div>

          {latestEpisodes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {latestEpisodes.slice(0, 6).map((item, index) => (
                <Link
                  key={`${item.id}-${item.episode}`}
                  href={`/anime/${item.id}`}
                  className="fii-latest-card group flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#15151b] p-4"
                  style={{ "--card-index": index } as React.CSSProperties}
                >
                  <div className="fii-latest-image-wrap h-24 w-[72px] shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      loading="lazy"
                      className="fii-latest-image h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold tracking-[2px] text-red-400">
                      RECENTLY AIRED
                    </p>

                    <h3 className="mt-2 truncate text-base font-bold transition group-hover:text-red-400">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Episode {item.episode}
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-600">
                      {new Date(item.airingAt * 1000).toLocaleString(
                        "en-US",
                        {
                          timeZone: "Asia/Phnom_Penh",
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </p>
                  </div>

                  <span className="fii-latest-arrow pr-2 text-xl text-zinc-600">
                    →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-white/10 bg-[#15151d] p-8 text-center text-zinc-400">
              No recent episodes found. Please check again later.
            </p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="fii-footer px-5 py-12 text-center">
        <p className="text-2xl font-black tracking-tight">
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
