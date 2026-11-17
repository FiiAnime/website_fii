
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Anime = {
  id: number;
  title: {
    english: string | null;
    romaji: string;
  };
  coverImage: {
    large: string;
  };
  episodes: number | null;
  averageScore: number | null;
  genres: string[];
};

type Category = "POPULAR" | "SERIES" | "MOVIES";

type CategoryData = {
  anime: Anime[];
  page: number;
  hasNextPage: boolean;
};

const PER_PAGE = 50;

const categoryLabels: { id: Category; label: string }[] = [
  { id: "POPULAR", label: "POPULAR ANIME" },
  { id: "SERIES", label: "ANIME SERIES" },
  { id: "MOVIES", label: "ANIME MOVIES" },
];

const emptyCategoryData = (): Record<Category, CategoryData> => ({
  POPULAR: { anime: [], page: 1, hasNextPage: true },
  SERIES: { anime: [], page: 1, hasNextPage: true },
  MOVIES: { anime: [], page: 1, hasNextPage: true },
});

export default function AnimePage() {
  const [category, setCategory] = useState<Category>("POPULAR");
  const [anime, setAnime] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const [categoryData, setCategoryData] =
    useState<Record<Category, CategoryData>>(emptyCategoryData);

  const requestId = useRef(0);
  const searchRequestId = useRef(0);
  const activeCategory = useRef<Category>("POPULAR");

  async function loadAnime(
    selectedCategory: Category,
    pageNumber: number,
    replace = false
  ) {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError("");

    const formatFilter =
      selectedCategory === "SERIES"
        ? "format_in: [TV, TV_SHORT, ONA, OVA, SPECIAL]"
        : selectedCategory === "MOVIES"
          ? "format: MOVIE"
          : "";

    const query = `
      query {
        Page(page: ${pageNumber}, perPage: ${PER_PAGE}) {
          pageInfo {
            hasNextPage
          }
          media(
            type: ANIME
            sort: POPULARITY_DESC
            isAdult: false
            ${formatFilter}
          ) {
            id
            title {
              english
              romaji
            }
            coverImage {
              large
            }
            episodes
            averageScore
            genres
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
      });

      if (!response.ok) {
        throw new Error("Could not load anime.");
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error("Anime request failed.");
      }

      const media: Anime[] = result.data.Page.media;
      const nextPage: boolean = result.data.Page.pageInfo.hasNextPage;

      if (currentRequest !== requestId.current) return;

      setCategoryData((previous) => {
        const oldAnime = previous[selectedCategory].anime;

        return {
          ...previous,
          [selectedCategory]: {
            anime: replace ? media : [...oldAnime, ...media],
            page: pageNumber,
            hasNextPage: nextPage,
          },
        };
      });

      if (activeCategory.current === selectedCategory) {
        setAnime((previous) =>
          replace ? media : [...previous, ...media]
        );
        setPage(pageNumber);
        setHasNextPage(nextPage);
      }
    } catch {
      if (currentRequest === requestId.current) {
        setError("Unable to load anime. Please try again.");
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }

  function changeCategory(value: Category) {
    if (value === category) return;

    requestId.current++;
    searchRequestId.current++;

    activeCategory.current = value;

    setCategory(value);
    setSearch("");
    setSearchResults([]);
    setSearching(false);
    setLoading(false);
    setError("");

    const saved = categoryData[value];

    setAnime(saved.anime);
    setPage(saved.page);
    setHasNextPage(saved.hasNextPage);

    if (saved.anime.length === 0) {
      loadAnime(value, 1, true);
    }
  }

  async function searchAnime(value: string) {
    setSearch(value);
    setError("");

    const currentSearch = ++searchRequestId.current;

    if (!value.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    const formatFilter =
      category === "SERIES"
        ? "format_in: [TV, TV_SHORT, ONA, OVA, SPECIAL]"
        : category === "MOVIES"
          ? "format: MOVIE"
          : "";

    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 50) {
          media(
            search: $search
            type: ANIME
            isAdult: false
            sort: SEARCH_MATCH
            ${formatFilter}
          ) {
            id
            title {
              english
              romaji
            }
            coverImage {
              large
            }
            episodes
            averageScore
            genres
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
          variables: { search: value },
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed.");
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error("Search failed.");
      }

      if (currentSearch === searchRequestId.current) {
        setSearchResults(result.data.Page.media);
      }
    } catch {
      if (currentSearch === searchRequestId.current) {
        setSearchResults([]);
        setError("Search failed. Please try again.");
      }
    } finally {
      if (currentSearch === searchRequestId.current) {
        setSearching(false);
      }
    }
  }

  useEffect(() => {
    loadAnime("POPULAR", 1, true);

    return () => {
      requestId.current++;
      searchRequestId.current++;
    };
  }, []);

  const displayedAnime = search.trim() ? searchResults : anime;

  const currentCategoryName =
    category === "POPULAR"
      ? "Popular Anime"
      : category === "SERIES"
        ? "Anime Series"
        : "Anime Movies";

  const showSkeleton =
    (loading && anime.length === 0 && !search.trim()) ||
    (searching && searchResults.length === 0 && search.trim());

  return (
    <main className="min-h-screen overflow-hidden bg-[#08080b] text-white">

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08080b]/90 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            <span className="text-red-500">FII</span> ANIME
            <span className="ml-2 hidden text-[9px] font-medium tracking-[3px] text-zinc-500 sm:inline">
              YOUR ANIME WORLD
            </span>
          </Link>
  
            <div className="flex items-center gap-7 text-sm font-medium">
  <Link href="/" className="anime-nav-link text-zinc-400">
    Home
  </Link>

  <Link href="/anime" className="anime-nav-link anime-nav-active text-red-400">
    Anime
  </Link>
</div>

        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="anime-hero-glow absolute -right-20 -top-32 h-96 w-96 rounded-full bg-red-700/10 blur-[120px]" />
        <div className="anime-hero-glow anime-hero-glow-delay absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-red-900/10 blur-[110px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:py-20">
          <div className="anime-fade-up flex items-center gap-3">
            <span className="h-[2px] w-9 bg-red-500" />
            <p className="text-[10px] font-bold tracking-[4px] text-red-400">
              EXPLORE THE COLLECTION
            </p>
          </div>

          <h1 className="anime-fade-up anime-delay-1 mt-6 text-4xl font-black tracking-tight sm:text-6xl">
            ANIME <span className="text-red-500">COLLECTION.</span>
          </h1>

          <p className="anime-fade-up anime-delay-2 mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
            Discover your favorite anime, explore new adventures and find
            your next story to watch.
          </p>

          {/* CATEGORY TABS */}
          <div className="anime-fade-up anime-delay-3 mt-8 flex flex-wrap items-center gap-3">
            {categoryLabels.map((item) => {
              const active = category === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => changeCategory(item.id)}
                  className={`category-tab rounded-full border px-4 py-2 text-xs font-bold ${
                    active
                      ? "border-red-500 bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                      : "border-white/10 bg-white/[0.03] text-zinc-500 hover:-translate-y-1 hover:border-red-500/50 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section className="mx-auto max-w-7xl px-5 py-12">

        {/* SEARCH */}
        <div className="mb-12">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#14141a] px-5 py-4 transition focus-within:border-red-500/60">
            <span className="text-xl text-zinc-500">⌕</span>

            <input
              type="search"
              value={search}
              onChange={(e) => searchAnime(e.target.value)}
              placeholder="Search anime by title..."
              className="w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-sm placeholder:font-normal placeholder:text-zinc-600 sm:text-lg"
            />

            {search && (
              <button
                onClick={() => {
                  searchRequestId.current++;
                  setSearch("");
                  setSearchResults([]);
                  setSearching(false);
                  setError("");
                }}
                className="text-xs font-bold text-zinc-500 transition hover:text-red-400"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* SECTION TITLE */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[4px] text-red-400">
              {search.trim() ? "SEARCH DISCOVERY" : "FII ANIME LIBRARY"}
            </p>

            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              {search.trim() ? "Search Results" : currentCategoryName}
            </h2>

            <p className="mt-2 text-xs text-zinc-500">
              {search.trim()
                ? `${searchResults.length} results found`
                : `${anime.length} anime loaded`}
            </p>
          </div>

          <span className="hidden text-[10px] font-bold tracking-[2px] text-zinc-600 sm:block">
            FII ANIME COLLECTION
          </span>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* LOADING */}
        {showSkeleton ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="aspect-[3/4] rounded-xl bg-[#1a1a22]" />
                <div className="mt-4 h-3 w-3/4 rounded bg-[#1a1a22]" />
                <div className="mt-2 h-2 w-1/2 rounded bg-[#1a1a22]" />
              </div>
            ))}
          </div>
        ) : displayedAnime.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#111116] py-24 text-center">
            <p className="text-4xl">⌕</p>
            <h3 className="mt-5 text-xl font-bold">No anime found</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Try searching with another anime title.
            </p>
          </div>
        ) : (
          /* POSTERS */
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {displayedAnime.map((item, index) => (
              <Link
                key={item.id}
                href={`/anime/${item.id}`}
                className="anime-poster-card group min-w-0"
                style={{
                  animationDelay: `${Math.min(index * 45, 650)}ms`,
                }}
              >
                <div className="anime-poster-frame relative aspect-[3/4] overflow-hidden rounded-xl border border-white/[0.06] bg-[#17171e]">
                  <img
                    src={item.coverImage.large}
                    alt={item.title.english || item.title.romaji}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />

                  <div className="anime-poster-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

                  <span className="absolute left-3 top-3 rounded-md border border-white/10 bg-black/50 px-2.5 py-1.5 text-[9px] font-bold tracking-wider text-white backdrop-blur-md">
                    #{String(index + 1).padStart(2, "0")}
                  </span>

                  {item.averageScore && (
                    <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1.5 text-[10px] font-bold text-yellow-400 backdrop-blur-md">
                      ★ {(item.averageScore / 10).toFixed(1)}
                    </span>
                  )}

                  <div className="anime-poster-arrow absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-sm leading-none backdrop-blur-md">
                    <span className="-translate-y-px">→</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 transition-colors duration-300 group-hover:text-red-400">
                    {item.title.english || item.title.romaji}
                  </h3>

                  <p className="mt-2 text-[11px] text-zinc-500">
                    {item.episodes
                      ? `${item.episodes} Episodes`
                      : "Episodes unknown"}
                  </p>

                  <p className="mt-1 truncate text-[10px] text-zinc-600">
                    {item.genres.slice(0, 2).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* LOAD MORE */}
        {!search.trim() && hasNextPage && anime.length > 0 && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => loadAnime(category, page + 1)}
              disabled={loading}
              className="rounded-lg border border-red-500/40 bg-red-600 px-10 py-4 text-xs font-black tracking-[2px] transition duration-300 hover:-translate-y-1 hover:bg-red-500 hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "LOADING..." : "LOAD MORE ANIME"}
            </button>
          </div>
        )}

        {!search.trim() && !hasNextPage && anime.length > 0 && (
          <p className="mt-16 text-center text-xs tracking-wider text-zinc-600">
            YOU HAVE REACHED THE END OF THE COLLECTION
          </p>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] px-5 py-12 text-center">
        <Link href="/" className="text-2xl font-black tracking-tight">
          <span className="text-red-500">FII</span> ANIME
        </Link>

        <p className="mt-3 text-xs tracking-wider text-zinc-500">
          YOUR WORLD. YOUR ANIME.
        </p>

       
      <div className="mt-6 flex justify-center gap-7 text-xs text-zinc-500">
  <Link href="/" className="anime-footer-link">
    Home
  </Link>

  <Link href="/anime" className="anime-footer-link">
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
