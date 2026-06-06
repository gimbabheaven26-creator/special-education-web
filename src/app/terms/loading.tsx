export default function TermsLoading() {
  return (
    <main className="bg-stone-50 text-stone-950">
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="h-10 w-28 animate-pulse rounded-sm bg-stone-200" />
          <div className="rounded-sm border border-stone-900 bg-[#101214] p-5">
            <div className="h-6 w-24 animate-pulse rounded-sm bg-cyan-300/70" />
            <div className="mt-5 h-12 w-64 max-w-full animate-pulse rounded-sm bg-stone-800" />
            <div className="mt-4 h-5 w-full animate-pulse rounded-sm bg-stone-800" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-36 animate-pulse rounded-sm border border-stone-300 bg-white" />
            <div className="h-36 animate-pulse rounded-sm border border-stone-300 bg-white" />
          </div>
          <div className="h-48 animate-pulse rounded-sm border border-stone-300 bg-white" />
        </div>
        <aside className="hidden h-52 animate-pulse rounded-sm border border-stone-300 bg-white lg:block" />
      </section>
    </main>
  );
}
