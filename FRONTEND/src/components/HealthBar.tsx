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
      className={`panel p-4 ${isCritical ? 'animate-[damageThrob_1.8s_ease-in-out_infinite]' : ''}`}
    >
      <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="type-block text-[10px] text-[#7d6b57]">envoy vitality</p>
          <h2 className="mt-2 text-xl uppercase tracking-[0.14em] text-[#ddd0b7]">Vital Hold</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#7d6b57]">measure</p>
          <p className="mt-2 text-lg text-[#d5b18d]">
            {clamped}/{max}
          </p>
        </div>
      </div>

      <div
        className={`relative h-7 overflow-hidden border bg-[#0b0908] ${
          isCritical ? 'border-[#7a3a30]' : 'border-[#42332b]'
        }`}
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(205,189,162,0.05)_0_1px,transparent_1px_7px)] opacity-25" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(205,189,162,0.05),transparent_34%,transparent_78%,rgba(0,0,0,0.3))]" />
        <div
          className={`absolute inset-y-0 left-0 transition-[width] duration-700 ease-out ${
            isCritical ? 'animate-emberPulse' : ''
          }`}
          style={{
            width: `${percentage}%`,
            background:
              'linear-gradient(90deg, #2c1a18 0%, #5a201c 24%, #8a6a43 68%, #c49a71 100%)',
          }}
        />
        {isCritical && (
          <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_left,rgba(123,47,38,0.24),transparent_42%)]" />
        )}
      </div>

      <div className="relative z-10 mt-3 flex justify-between text-[11px] uppercase tracking-[0.24em] text-[#8f7d65]">
        <span className={isCritical ? 'text-[#d5a48e]' : ''}>
          {isCritical ? 'the district has learned your name' : 'the seal still holds'}
        </span>
        <span className={isCritical ? 'text-[#d5a48e]' : ''}>{percentage.toFixed(0)}%</span>
      </div>
    </section>
  );
}
