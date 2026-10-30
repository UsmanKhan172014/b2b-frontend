export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col gap-panel-gap">
      <div className="mb-2 space-y-3">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-surface-container-high/80" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-surface-container-high/60" />
      </div>
      <div className="grid grid-cols-1 gap-panel-gap sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border border-white/10 bg-surface-container/40"
          />
        ))}
      </div>
    </div>
  );
}
