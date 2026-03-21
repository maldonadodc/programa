type HealthBarProps = {
  current: number;
  max: number;
};

export function HealthBar({ current, max }: HealthBarProps) {
  const clamped = Math.max(0, Math.min(current, max));
  const percentage = (clamped / max) * 100;

  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">$blood reservoir</p>
          <h2 className="mt-2 text-xl uppercase tracking-[0.18em] text-zinc-100">Vital Feed</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">capacity</p>
          <p className="mt-2 text-lg text-red-300">
            {clamped}/{max}
          </p>
        </div>
      </div>

      <div className="relative h-7 overflow-hidden rounded-sm border border-red-950 bg-black/70 shadow-lumen">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_6px)] opacity-25" />
        <div
          className="absolute inset-y-0 left-0 animate-pulseSlow bg-[linear-gradient(90deg,#33070a_0%,#8f1117_42%,#d22b2b_100%)] shadow-[0_0_35px_rgba(210,43,43,0.45)] transition-[width] duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,transparent_45%,rgba(0,0,0,0.35)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-full animate-scan bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.08)_48%,transparent_100%)] opacity-25" />
      </div>

      <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.28em] text-zinc-500">
        <span>hemorrhage stable</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
    </section>
  );
}
