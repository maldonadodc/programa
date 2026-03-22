import type { CombatStats, DemonContract } from '../lib/worldData';

type ContractPanelProps = {
  contract: DemonContract | null;
  level: number;
  stats: CombatStats | null;
  progress: number;
  progressPercent: number;
  abilities: string[];
  onManageContracts: () => void;
  onSave: () => void | Promise<void>;
};

export function ContractPanel({
  contract,
  level,
  stats,
  progress,
  progressPercent,
  abilities,
  onManageContracts,
  onSave,
}: ContractPanelProps) {
  if (!contract || !stats) {
    return (
      <div className="panel px-4 py-4">
        <div className="relative z-10">
          <p className="type-block text-[10px] text-[#7d6b57]">active contract</p>
          <h3 className="mt-2 text-xl uppercase tracking-[0.12em] text-[#e0d2b8]">NO ACTIVE CONTRACT</h3>
          <p className="mt-3 text-sm leading-7 text-[#b9a78c]">
            Choose a demon pact to unlock City access, combat, and progression.
          </p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={onManageContracts} className="menu-button text-center">
              OPEN CONTRACTS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel px-4 py-4">
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="type-block text-[10px] text-[#7d6b57]">active contract</p>
            <h3 className="mt-2 text-xl uppercase tracking-[0.12em] text-[#e0d2b8]">{contract.name}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em]" style={{ color: contract.accent }}>
              {contract.theme} / LVL {level}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onManageContracts} className="back-button">
              CONTRACTS
            </button>
            <button type="button" onClick={onSave} className="back-button">
              SAVE LEDGER
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <img
            src={contract.image.src}
            alt={contract.image.alt}
            className="h-16 w-16 border border-[#4a382d] bg-[#15110f] object-contain p-1.5"
          />
          <p className="text-sm leading-7 text-[#b9a78c]">{contract.note}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="parchment-card border border-[#45372d] px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#7d6b57]">Stats</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#d2c1a6]">
              ATK {stats.attack} / DEF {stats.defense} / SPC {stats.specialAttack}
            </p>
          </div>
          <div className="parchment-card border border-[#45372d] px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#7d6b57]">Progress</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#d2c1a6]">
              City victories: {progress}
            </p>
          </div>
        </div>

        <div className="mt-4 border border-[#46382d] bg-[#120f0d]/85 px-3 py-3">
          <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.24em] text-[#7d6b57]">
            <span>Level Progress</span>
            <span className="text-[#d9c4a1]">{progressPercent}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden border border-[#4a382d] bg-[#1a1411]">
            <div
              className="h-full transition-[width] duration-500"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${contract.accent}88, ${contract.accent})`,
              }}
            />
          </div>
        </div>

        <div className="mt-4 border-t border-[#43342b] pt-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#7d6b57]">Unlocked Abilities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {abilities.map((ability) => (
              <span
                key={ability}
                className="border border-[#5a4435] bg-[#15110f]/80 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#e4d2b6]"
              >
                {ability}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
