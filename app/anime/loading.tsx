
export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080b] text-white">
      <div className="flex flex-col items-center gap-6">
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-white/10 border-t-red-600" />

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
      </div>
    </main>
  );
}
