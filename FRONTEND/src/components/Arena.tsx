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
  onUseAbility: () => void;
  isAbilityLoading: boolean;
};

function EntityCard({ entity, align }: { entity: Entity; align: 'left' | 'right' }) {
  const isLeft = align === 'left';

  return (
    <div
      className={`relative flex min-h-[18rem] flex-1 flex-col justify-between overflow-hidden border border-[#3b3027] bg-[linear-gradient(180deg,#181311,#0d0b0a)] p-5 ${
        isLeft ? 'items-start text-left' : 'items-end text-right'
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(205,189,162,0.04),transparent_20%,transparent_80%,rgba(90,32,28,0.08))]" />
      <div className="absolute inset-0 bg-dust opacity-[0.18]" />
      <div className="absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(138,106,67,0.6),transparent)] opacity-80" />
      <p className="relative type-block text-[10px] text-[#776955]">señor del distrito</p>

      <div className={`relative ${isLeft ? 'items-start' : 'items-end'} flex flex-col`}>
        <div className={`sigil-sway text-6xl text-[#6b4e36] ${entity.accent}`}>{entity.sigil}</div>
        <h3 className="mt-4 text-2xl uppercase tracking-[0.12em] text-[#e0d2b8]">{entity.name}</h3>
        <p className="mt-2 max-w-[18rem] text-xs uppercase tracking-[0.24em] text-[#8d7c66]">{entity.title}</p>
      </div>

      <div className="relative w-full max-w-[16rem]">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-[#877660]">
          <span>dominio</span>
          <span className={entity.accent}>{entity.condition}</span>
        </div>
        <div className="h-3 overflow-hidden border border-[#3d3027] bg-[#0b0908]">
          <div
            className={`h-full w-3/4 bg-[linear-gradient(90deg,#38251f,#785638,#b98b62)] ${entity.accent}`}
          />
        </div>
      </div>
    </div>
  );
}

export function Arena({ left, right, onUseAbility, isAbilityLoading }: ArenaProps) {
  return (
    <section className="panel relative flex h-full min-h-[32rem] flex-col p-4 md:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(123,47,38,0.12),transparent_38%),linear-gradient(180deg,rgba(205,189,162,0.03),transparent_20%)]" />
      <div className="absolute inset-0 bg-hatch bg-[size:34px_34px] opacity-[0.08]" />
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(138,106,67,0.45),transparent)]" />
      <div className="absolute left-1/2 top-1/2 h-56 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(123,47,38,0.16),transparent_70%)] blur-2xl animate-emberPulse" />

      <div className="relative z-10 mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="type-block text-[10px] text-[#7d6b57]">camara de cobro</p>
          <h2 className="mt-2 text-2xl uppercase tracking-[0.14em] text-[#ddd0b7]">Foso del Nexo</h2>
        </div>
        <div className="status-chip text-right">
          <p className="text-[10px] text-[#7b6a56]">estado</p>
          <p className="mt-1 text-sm uppercase tracking-[0.24em] text-[#d4b292]">cobro en curso</p>
        </div>
      </div>

      <div className="relative z-10 grid flex-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <EntityCard entity={left} align="left" />

        <div className="relative mx-auto flex flex-col items-center gap-4">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#4c3b30] bg-[#120f0d]/90 shadow-[inset_0_0_0_1px_rgba(205,189,162,0.05),0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-2 rounded-full border border-[#332822]" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(138,106,67,0.12),transparent_66%)]" />
            <span className="relative text-2xl uppercase tracking-[0.28em] text-[#d7c6aa]">VS</span>
          </div>

          <button
            type="button"
            onClick={onUseAbility}
            disabled={isAbilityLoading}
            className={`menu-button min-w-[12rem] text-center ${
              isAbilityLoading ? 'cursor-not-allowed border-[#7b4b3b] text-[#e5c8aa]' : ''
            }`}
          >
            {isAbilityLoading ? 'SELLANDO COBRO' : 'RITUAL DE COBRO'}
          </button>
        </div>

        <EntityCard entity={right} align="right" />
      </div>
    </section>
  );
}
