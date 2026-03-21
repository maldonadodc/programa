type Entity = {
  name: string;
  title: string;
  condition: string;
  sigil: string;
  accent: string;
};

type ArenaProps = {
  left: Entity;
  right: Entity;
};

function EntityCard({ entity, align }: { entity: Entity; align: 'left' | 'right' }) {
  const isLeft = align === 'left';

  return (
    <div
      className={`entity-shell relative flex min-h-[18rem] flex-1 flex-col justify-between overflow-hidden border border-zinc-800 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 p-5 ${
        isLeft ? 'items-start text-left' : 'items-end text-right'
      }`}
    >
      <div className="fog-layer absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(210,43,43,0.14),transparent_62%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%,transparent_82%,rgba(0,0,0,0.28))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-700/70 to-transparent" />
      <p className="relative text-[10px] uppercase tracking-[0.4em] text-zinc-600">pit manifest</p>
      <div className={`relative ${isLeft ? 'animate-[entityIdleLeft_4.8s_ease-in-out_infinite]' : 'animate-[entityIdleRight_5.2s_ease-in-out_infinite]'}`}>
        <div
          className={`text-7xl text-red-950/60 drop-shadow-[0_0_26px_rgba(143,17,23,0.28)] ${isLeft ? 'animate-glitch' : 'animate-flicker'}`}
        >
          {entity.sigil}
        </div>
        <h3 className="mt-3 text-2xl uppercase tracking-[0.2em] text-zinc-100">{entity.name}</h3>
        <p className="mt-2 max-w-[18rem] text-xs uppercase tracking-[0.28em] text-zinc-500">{entity.title}</p>
      </div>

      <div className="relative w-full max-w-[16rem]">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-zinc-600">
          <span>condition</span>
          <span className={entity.accent}>{entity.condition}</span>
        </div>
        <div className="h-2 border border-zinc-800 bg-black">
          <div className={`h-full w-3/4 ${entity.accent} bg-current shadow-[0_0_18px_currentColor]`} />
        </div>
      </div>
    </div>
  );
}

export function Arena({ left, right }: ArenaProps) {
  return (
    <section className="panel arena-shell relative flex h-full min-h-[32rem] flex-col overflow-hidden p-4 md:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(143,17,23,0.16),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%)]" />
      <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-[0.06]" />
      <div className="fog-layer absolute inset-x-0 bottom-0 h-1/2" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.5)_100%)]" />
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-red-900/60 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-56 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(210,43,43,0.2),rgba(210,43,43,0.08)_28%,transparent_68%)] blur-2xl animate-[tensionPulse_3.6s_ease-in-out_infinite]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-8 -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.16),transparent)] opacity-30 blur-md animate-[distortionDrift_6s_ease-in-out_infinite]" />
      <div className="relative mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">the pit arena</p>
          <h2 className="mt-2 text-2xl uppercase tracking-[0.2em] text-zinc-100">Arena del Foso</h2>
        </div>
        <div className="border border-red-950 bg-black/60 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">status</p>
          <p className="mt-1 text-sm uppercase tracking-[0.25em] text-red-300">sudden death</p>
        </div>
      </div>

      <div className="relative grid flex-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <EntityCard entity={left} align="left" />

        <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-red-950 bg-black/80 shadow-lumen">
          <div className="absolute inset-2 rounded-full border border-zinc-800" />
          <div className="absolute inset-0 rounded-full border border-red-700/20 shadow-[0_0_60px_rgba(210,43,43,0.22)]" />
          <div className="absolute h-full w-full animate-pulseSlow rounded-full bg-[radial-gradient(circle,rgba(210,43,43,0.22),transparent_64%)]" />
          <div className="absolute h-full w-full rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-40 animate-[spin_10s_linear_infinite]" />
          <span className="relative text-3xl uppercase tracking-[0.35em] text-red-300">VS</span>
        </div>

        <EntityCard entity={right} align="right" />
      </div>
    </section>
  );
}
