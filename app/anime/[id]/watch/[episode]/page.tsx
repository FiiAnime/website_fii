
export const instant = false;

type Props = {
  params: Promise<{
    id: string;
    episode: string;
  }>;
};

type Stream = {
  server?: string;
  audio?: string;
  type?: string;
  embed?: string;
  url?: string;
};

export default async function WatchPage({ params }: Props) {
  const { id, episode } = await params;

  let embedUrl = "";
  let error = "";

  try {
    const API_URL =
      process.env.ANIVEXA_API_URL || "http://localhost:4000";

    const response = await fetch(
      `${API_URL}/watch/reanime/${id}/sub/reanime-${episode}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("API error");
    }

    const data = await response.json();

    const streams: Stream[] = Array.isArray(data.streams)
      ? data.streams
      : [];

    const stream = streams.find(
      (item) =>
        item.embed &&
        item.audio?.toLowerCase() === "sub"
    );

    if (stream?.embed) {
      embedUrl = stream.embed;
    } else {
      error = "Video is not available for this episode.";
    }
  } catch {
    error = "Could not connect to the video server.";
  }

  const currentEpisode = Number(episode);

  return (
    <main className="min-h-screen bg-[#08080b] text-white">
      <header className="border-b border-white/10 bg-[#101015]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <a href="/" className="text-2xl font-black tracking-widest">
            FII <span className="text-red-600">ANIME</span>
          </a>

          <a
            href={`/anime/${id}`}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:border-red-600 hover:text-white"
          >
            ← Anime Details
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
            Fii Anime • Watch Online
          </p>

          <h1 className="text-3xl font-black sm:text-4xl">
            Episode {episode}
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Japanese Audio
            <span className="mx-2 text-red-600">•</span>
            English Subtitles
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111116] shadow-2xl shadow-red-950/20">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 font-black">
                F
              </div>

              <div>
                <p className="font-black tracking-wider">FII ANIME</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                  Anime Streaming
                </p>
              </div>
            </div>

            <span className="rounded-md bg-red-600/15 px-3 py-1.5 text-xs font-bold text-red-500">
              SUB
            </span>
          </div>

          <div className="aspect-video w-full bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`Fii Anime Episode ${episode}`}
                className="h-full w-full"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-gray-400">
                {error || "Loading video..."}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-4 sm:px-6">
            <div>
              <p className="font-bold">Now Playing</p>
              <p className="mt-1 text-sm text-gray-500">
                Episode {episode} • Japanese SUB
              </p>
            </div>

            <span className="text-xs font-semibold text-gray-500">
              FII ANIME PLAYER
            </span>
          </div>
        </section>

        <section className="mt-7 rounded-2xl border border-white/10 bg-[#111116] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-black">
              Episode Navigation
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Continue watching your anime
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            {currentEpisode > 1 ? (
              <a
                href={`/anime/${id}/watch/${currentEpisode - 1}`}
                className="rounded-lg bg-[#25252e] px-5 py-3 text-sm font-bold transition hover:bg-red-600"
              >
                ← Previous
              </a>
            ) : (
              <span className="rounded-lg bg-[#19191f] px-5 py-3 text-sm text-gray-600">
                ← Previous
              </span>
            )}

            <a
              href={`/anime/${id}/watch/${currentEpisode + 1}`}
              className="rounded-lg bg-red-600 px-5 py-3 text-sm font-bold transition hover:bg-red-700"
            >
              Next Episode →
            </a>
          </div>
        </section>
      </div>

      <footer className="mt-10 border-t border-white/10 py-6 text-center text-xs text-gray-600">
        © FII ANIME • Anime Streaming Website
      </footer>
    </main>
  );
}
