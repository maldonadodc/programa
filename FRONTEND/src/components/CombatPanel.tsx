import type { EncounterEntity } from '../lib/worldData';

type CombatAction = 'attack' | 'defend' | 'invoke';

type CombatPanelProps = {
  player: EncounterEntity;
  enemy: EncounterEntity;
  title: string;
  subtitle: string;
  feedbackText: string;
  onAction: (action: CombatAction) => void;
  onClose: () => void;
  onResolve: () => void;
};

function VitalBar({
  label,
  current,
  max,
  accent,
}: {
  label: string;
  current: number;
  max: number;
  accent: string;
}) {
  const width = Math.max(8, (current / max) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#9e8c73]">
        <span>{label}</span>
        <span>{current}/{max}</span>
      </div>
      <div className="relative h-3 overflow-hidden border border-[#46372d] bg-[#0e0b0a]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,248,232,0.04)_0_1px,transparent_1px_6px)]" />
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-300"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${accent}66 0%, ${accent} 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function PortraitCard({
  entity,
  align,
}: {
  entity: EncounterEntity;
  align: 'left' | 'right';
}) {
  const textAlign = align === 'left' ? 'text-left items-start' : 'text-right items-end';

  return (
    <div className={`parchment-card flex min-h-[23rem] flex-col border border-[#47382e] p-4 ${textAlign}`}>
      <div className="relative w-full overflow-hidden border border-[#514137] bg-[#161210]">
        <img
          src={entity.image.src}
          alt={entity.image.alt}
          className="h-64 w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,232,0.03),transparent_24%,transparent_76%,rgba(0,0,0,0.16))]" />
      </div>

      <div className="mt-4 w-full space-y-3">
        <div>
          <p className="type-block text-[10px] text-[#7d6b57]">{entity.contract}</p>
          <h3 className="mt-2 text-2xl uppercase tracking-[0.12em] text-[#e0d2b8]">{entity.name}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em]" style={{ color: entity.accent }}>
            {entity.title}
          </p>
        </div>

        <VitalBar label="vital hold" current={entity.health} max={100} accent={entity.accent} />
      </div>
    </div>
  );
}

export function CombatPanel({
  player,
  enemy,
  title,
  subtitle,
  feedbackText,
  onAction,
  onClose,
  onResolve,
}: CombatPanelProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(8,6,6,0.7)] p-4 backdrop-blur-[2px]">
      <section className="panel relative w-full max-w-[1320px] px-5 py-5">
        <div className="relative z-10">
          <div className="mb-5 flex flex-col gap-4 border-b border-[#41332a] pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="type-block text-[10px] text-[#7d6b57]">duel chamber</p>
              <h2 className="mt-2 text-3xl uppercase tracking-[0.14em] text-[#e0d2b8]">{title}</h2>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#af9b80]">{subtitle}</p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onResolve} className="menu-button text-center">
                SEAL OUTCOME
              </button>
              <button type="button" onClick={onClose} className="back-button">
                CLOSE
              </button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_280px_1fr] xl:items-center">
            <PortraitCard entity={player} align="left" />

            <div className="flex flex-col items-center justify-center gap-5">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#544238] bg-[#15110f]/90 shadow-[inset_0_0_0_1px_rgba(255,248,232,0.05),0_16px_28px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-2 rounded-full border border-[#3b2e27]" />
                <span className="text-2xl uppercase tracking-[0.22em] text-[#eadcc3]">VS</span>
              </div>

              <div className="w-full space-y-3">
                <button type="button" onClick={() => onAction('attack')} className="menu-button w-full text-center">
                  ATTACK
                </button>
                <button type="button" onClick={() => onAction('defend')} className="menu-button w-full text-center">
                  DEFEND
                </button>
                <button type="button" onClick={() => onAction('invoke')} className="menu-button w-full text-center">
                  INVOKE PACT
                </button>
              </div>

              <div className="parchment-card w-full border border-[#43352b] px-4 py-3 text-center">
                <p className="type-block text-[10px] text-[#7d6b57]">ritual echo</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#cfbea3]">{feedbackText}</p>
              </div>
            </div>

            <PortraitCard entity={enemy} align="right" />
          </div>
        </div>
      </section>
    </div>
  );
}
