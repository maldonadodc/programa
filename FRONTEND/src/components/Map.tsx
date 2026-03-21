type MapProps = {
  onSelectZone: (zone: string) => void;
  selectedZone: string | null;
};

const skyline = [
  { left: '4%', width: '8%', height: '34%', tone: 'from-zinc-800 to-black' },
  { left: '14%', width: '10%', height: '46%', tone: 'from-zinc-700 to-zinc-950' },
  { left: '28%', width: '7%', height: '28%', tone: 'from-zinc-800 to-black' },
  { left: '39%', width: '12%', height: '52%', tone: 'from-zinc-700 to-black' },
  { left: '57%', width: '9%', height: '38%', tone: 'from-zinc-800 to-zinc-950' },
  { left: '69%', width: '11%', height: '44%', tone: 'from-zinc-700 to-black' },
  { left: '84%', width: '7%', height: '31%', tone: 'from-zinc-800 to-black' },
];

const ruins = [
  { left: '9%', bottom: '18%', width: '9%', height: '9%' },
  { left: '24%', bottom: '14%', width: '12%', height: '7%' },
  { left: '49%', bottom: '16%', width: '10%', height: '8%' },
  { left: '77%', bottom: '13%', width: '13%', height: '6%' },
];

const zones = [
  {
    id: 'SECTOR A - INFESTED',
    label: 'SECTOR A - INFESTED',
    top: '24%',
    left: '14%',
    width: '24%',
    height: '16%',
  },
  {
    id: 'BOILER DISTRICT',
    label: 'BOILER DISTRICT',
    top: '56%',
    left: '38%',
    width: '24%',
    height: '18%',
  },
  {
    id: 'CHAPEL RUINS',
    label: 'CHAPEL RUINS',
    top: '22%',
    left: '66%',
    width: '20%',
    height: '14%',
  },
];

export function Map({ onSelectZone, selectedZone }: MapProps) {
  return (
    <section className="panel relative flex h-full min-h-[16rem] flex-col overflow-hidden p-3">
      <div className="absolute inset-0 bg-[#111317]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px] opacity-45" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_34%,rgba(143,17,23,0.18),transparent_16%),radial-gradient(circle_at_70%_26%,rgba(143,17,23,0.2),transparent_14%),radial-gradient(circle_at_52%_68%,rgba(143,17,23,0.18),transparent_18%)]" />

      <div className="absolute inset-x-0 bottom-0 h-[36%] bg-[#0b0c0f]" />
      <div className="absolute inset-x-0 bottom-[18%] h-[2px] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.16)_0_10px,transparent_10px_18px)] opacity-70" />

      {skyline.map((building) => (
        <div
          key={`${building.left}-${building.width}`}
          className="absolute bottom-[18%] border border-zinc-500/70 bg-zinc-700 shadow-[0_0_12px_rgba(255,255,255,0.06)]"
          style={{
            left: building.left,
            width: building.width,
            height: building.height,
            imageRendering: 'pixelated',
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_6px),linear-gradient(180deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_6px)] opacity-55" />
          <div className="absolute inset-x-0 top-0 h-[18%] border-b border-zinc-500/40 bg-zinc-500/10" />
        </div>
      ))}

      {ruins.map((ruin) => (
        <div
          key={`${ruin.left}-${ruin.width}`}
          className="absolute border border-zinc-600/60 bg-zinc-800"
          style={{ left: ruin.left, bottom: ruin.bottom, width: ruin.width, height: ruin.height }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:8px_8px] opacity-50" />
        </div>
      ))}

      <div className="absolute left-[18%] top-[30%] h-20 w-20 bg-red-700/25 blur-xl animate-pulse" />
      <div className="absolute left-[68%] top-[24%] h-16 w-16 bg-red-700/25 blur-xl animate-pulse" />
      <div className="absolute left-[44%] top-[58%] h-24 w-24 bg-red-800/25 blur-2xl animate-pulse" />

      <div className="absolute inset-x-0 bottom-[17%] h-[2px] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.18)_0_8px,transparent_8px_16px)] opacity-80" />
      <div className="absolute left-[10%] top-[18%] h-[52%] w-[2px] bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.14)_0_8px,transparent_8px_16px)] opacity-70" />
      <div className="absolute left-[62%] top-[14%] h-[56%] w-[2px] bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.14)_0_8px,transparent_8px_16px)] opacity-70" />

      <div className="relative z-10 flex w-full flex-col">
        <div className="mb-3 flex flex-col gap-1">
          <p className="text-[10px] uppercase tracking-[0.42em] text-zinc-500">urban contamination overview</p>
          <h2 className="text-lg uppercase tracking-[0.26em] text-zinc-100 sm:text-xl">CORRUPTED CITY GRID</h2>
        </div>

        <div className="relative flex-1 overflow-hidden border border-zinc-700 bg-zinc-900/30">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_16%,transparent_84%,rgba(255,255,255,0.03))]" />

          {zones.map((zone) => {
            const isActive = selectedZone === zone.id;

            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => onSelectZone(zone.id)}
                className={`group absolute overflow-hidden border text-left transition duration-300 ${
                  isActive
                    ? 'border-red-500 bg-red-900/30 shadow-[0_0_22px_rgba(143,17,23,0.3)]'
                    : 'border-zinc-500/80 bg-zinc-800/55 hover:scale-[1.02] hover:border-red-600/90 hover:bg-red-950/15 hover:shadow-[0_0_18px_rgba(143,17,23,0.2)]'
                }`}
                style={{
                  top: zone.top,
                  left: zone.left,
                  width: zone.width,
                  height: zone.height,
                  imageRendering: 'pixelated',
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:8px_8px] opacity-60" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(143,17,23,0.24),transparent_70%)] opacity-90 transition group-hover:opacity-100" />
                <div className="absolute inset-x-0 top-0 h-px bg-[repeating-linear-gradient(90deg,transparent_0_4px,rgba(255,120,120,0.8)_4px_8px,transparent_8px_12px)]" />
                <div className="relative flex h-full flex-col justify-end p-3">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-400">zone</p>
                  <p className={`mt-2 text-[11px] uppercase tracking-[0.18em] ${isActive ? 'text-red-100' : 'text-zinc-100'}`}>
                    {zone.label}
                  </p>
                </div>
              </button>
            );
          })}

          <div className="absolute bottom-3 left-3 border border-zinc-600/70 bg-zinc-900/80 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-zinc-300">
            <p>Grid Integrity: 32%</p>
            <p className="mt-1 text-red-300">Demonic saturation rising</p>
          </div>
        </div>
      </div>
    </section>
  );
}
