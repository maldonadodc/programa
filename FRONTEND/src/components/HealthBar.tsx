type HealthBarProps = {
  current: number;
  max: number;
};

export function HealthBar({ current, max }: HealthBarProps) {
  const clamped = Math.max(0, Math.min(current, max));
  const percentage = (clamped / max) * 100;
  const isCritical = percentage < 30;

  return (
    <section
      className={`panel p-4 ${isCritical ? 'critical-shell animate-[criticalShell_1.6s_ease-in-out_infinite]' : ''}`}
    >
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

      <div
        className={`relative h-7 overflow-hidden rounded-sm border bg-black/70 shadow-lumen ${
          isCritical ? 'border-red-700/80 shadow-[0_0_45px_rgba(210,43,43,0.28)]' : 'border-red-950'
        }`}
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_6px)] opacity-25" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(210,43,43,0.14),transparent_28%,transparent_72%,rgba(255,255,255,0.04))]" />
        <div
          className={`absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#1b0204_0%,#54090d_20%,#8f1117_52%,#ff4545_100%)] transition-[width] duration-700 ease-out ${
            isCritical
              ? 'animate-[criticalPulse_1s_ease-in-out_infinite] shadow-[0_0_45px_rgba(255,45,45,0.8)]'
              : 'animate-pulseSlow shadow-[0_0_35px_rgba(210,43,43,0.45)]'
          }`}
          style={{ width: `${percentage}%` }}
        />
        {isCritical && (
          <div className="absolute inset-y-0 left-0 w-full animate-[bloodBleed_1.4s_ease-in-out_infinite] bg-[radial-gradient(circle_at_left,rgba(255,70,70,0.26),transparent_40%)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,transparent_45%,rgba(0,0,0,0.35)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-full animate-scan bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.08)_48%,transparent_100%)] opacity-25" />
      </div>

      <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.28em] text-zinc-500">
        <span className={isCritical ? 'animate-pulse text-red-300' : ''}>
          {isCritical ? 'critical bleed risk' : 'hemorrhage stable'}
        </span>
        <span className={isCritical ? 'text-red-300' : ''}>{percentage.toFixed(0)}%</span>
      </div>
    </section>
  );
}
