import type {
  EncounterEntity,
  EnemyEncounter,
  TokenBoostOption,
  TokenBoostType,
  TokenHealOption,
} from '../lib/worldData';

type CombatAction = 'attack' | 'defend' | 'invoke';

export type DamageIndicator = {
  amount: number;
  label: string;
  tone: 'damage' | 'guard' | 'ability' | 'heal';
  sequence: number;
};

type CombatPanelProps = {
  player: EncounterEntity;
  playerHealth: number;
  enemy: EnemyEncounter;
  enemyHealth: number;
  title: string;
  subtitle: string;
  feedbackText: string;
  onAction: (action: CombatAction) => void;
  onClose: () => void;
  onPrimeBoost: (type: TokenBoostType) => void;
  onHeal: () => void;
  tokens: number;
  activeBoost: TokenBoostType | null;
  boostOptions: TokenBoostOption[];
  healOption: TokenHealOption;
  damageIndicators: {
    player: DamageIndicator | null;
    enemy: DamageIndicator | null;
  };
  hitStates: {
    player: boolean;
    enemy: boolean;
  };
  actionsDisabled?: boolean;
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
  const safeMax = Math.max(1, max);
  const width = Math.max(0, (Math.max(0, current) / safeMax) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#9e8c73]">
        <span>{label}</span>
        <span>{Math.max(0, current)}/{safeMax}</span>
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

function StatsGrid({ entity }: { entity: EncounterEntity }) {
  const stats = [
    ['HP', entity.stats.hp],
    ['ATK', entity.stats.attack],
    ['DEF', entity.stats.defense],
    ['SPC', entity.stats.specialAttack],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map(([label, value]) => (
        <div key={label} className="parchment-card border border-[#43352b] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#7d6b57]">{label}</p>
          <p className="mt-2 text-lg uppercase tracking-[0.14em] text-[#eadcc3]">{value}</p>
        </div>
      ))}
    </div>
  );
}

function FloatingDamage({ indicator }: { indicator: DamageIndicator | null }) {
  if (!indicator) return null;

  const toneClassName =
    indicator.tone === 'guard'
      ? 'text-[#f1d9b3]'
      : indicator.tone === 'heal'
        ? 'text-[#cde8b3]'
      : indicator.tone === 'ability'
        ? 'text-[#f0b88d]'
        : 'text-[#f6d0bc]';

  return (
    <div
      key={indicator.sequence}
      className={`combat-float absolute left-1/2 top-6 z-20 -translate-x-1/2 px-3 py-1 text-lg uppercase tracking-[0.18em] ${toneClassName}`}
    >
      {indicator.label}
    </div>
  );
}

function PortraitCard({
  entity,
  currentHealth,
  align,
  hit,
  indicator,
}: {
  entity: EncounterEntity;
  currentHealth: number;
  align: 'left' | 'right';
  hit: boolean;
  indicator: DamageIndicator | null;
}) {
  const textAlign = align === 'left' ? 'text-left items-start' : 'text-right items-end';

  return (
    <div className={`parchment-card flex min-h-[20rem] flex-col border border-[#47382e] p-3 sm:min-h-[22rem] sm:p-4 ${textAlign}`}>
      <div
        className={`relative w-full overflow-hidden border border-[#514137] bg-[#161210] ${
          hit ? 'combat-portrait-hit' : ''
        }`}
      >
        <FloatingDamage indicator={indicator} />
        <img
          src={entity.image.src}
          alt={entity.image.alt}
          className={`h-40 w-full sm:h-48 ${entity.image.fit === 'contain' ? 'object-contain p-2 sm:p-3' : 'object-cover'} ${
            entity.image.mirrored ? 'scale-x-[-1]' : ''
          }`}
          style={{ objectPosition: entity.image.position ?? 'center' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,232,0.03),transparent_24%,transparent_76%,rgba(0,0,0,0.16))]" />
      </div>

      <div className="mt-4 w-full space-y-4">
        <div>
          <p className="type-block text-[10px] text-[#7d6b57]">{entity.contract}</p>
          <h3 className="mt-2 text-xl uppercase tracking-[0.12em] text-[#e0d2b8] sm:text-2xl">{entity.name}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em]" style={{ color: entity.accent }}>
            {entity.title}
          </p>
          {entity.type && (
            <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-[#bca78c]">{entity.type}</p>
          )}
          {entity.strategyHint && (
            <p className="mt-3 text-[10px] uppercase leading-6 tracking-[0.16em] text-[#d7c4a8]">
              TACTIC: {entity.strategyHint}
            </p>
          )}
        </div>

        <VitalBar label="vital hold" current={currentHealth} max={entity.stats.hp} accent={entity.accent} />
        <StatsGrid entity={entity} />
      </div>
    </div>
  );
}

export function CombatPanel({
  player,
  playerHealth,
  enemy,
  enemyHealth,
  title,
  subtitle,
  feedbackText,
  onAction,
  onClose,
  onPrimeBoost,
  onHeal,
  tokens,
  activeBoost,
  boostOptions,
  healOption,
  damageIndicators,
  hitStates,
  actionsDisabled = false,
}: CombatPanelProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(8,6,6,0.58)] p-3 backdrop-blur-[2px] sm:p-4">
      <section className="panel relative w-full max-w-[960px] max-h-[calc(100vh-1.5rem)] overflow-y-auto px-4 py-4 sm:max-h-[calc(100vh-2rem)] sm:px-5 sm:py-5">
        <div className="relative z-10">
          <div className="mb-5 flex flex-col gap-4 border-b border-[#41332a] pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="type-block text-[10px] text-[#7d6b57]">duel chamber</p>
              <h2 className="mt-2 text-2xl uppercase tracking-[0.12em] text-[#e0d2b8] sm:text-3xl">{title}</h2>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#af9b80]">{subtitle}</p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="back-button">
                CLOSE
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_250px_1fr] lg:items-start">
            <PortraitCard
              entity={player}
              currentHealth={playerHealth}
              align="left"
              hit={hitStates.player}
              indicator={damageIndicators.player}
            />

            <div className="flex flex-col items-center justify-center gap-5">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#544238] bg-[#15110f]/90 shadow-[inset_0_0_0_1px_rgba(255,248,232,0.05),0_16px_28px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-2 rounded-full border border-[#3b2e27]" />
                <span className="text-2xl uppercase tracking-[0.22em] text-[#eadcc3]">VS</span>
              </div>

              <div className="w-full space-y-3">
                <div className="parchment-card border border-[#43352b] px-3 py-3">
                  <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#7d6b57]">
                    <span>token forge</span>
                    <span>{tokens} available</span>
                  </div>
                  <div className="space-y-2">
                    {boostOptions.map((boost) => (
                      <button
                        key={boost.id}
                        type="button"
                        onClick={() => onPrimeBoost(boost.id)}
                        disabled={actionsDisabled}
                        className={`menu-button w-full text-left text-[11px] tracking-[0.2em] ${
                          activeBoost === boost.id ? 'border-[#e1c79b] text-[#f1dfc2]' : ''
                        }`}
                      >
                        <span className="block">{boost.label} ({boost.description})</span>
                        <span className="mt-1 block text-[10px] tracking-[0.18em] text-[#af9b80]">
                          COST {boost.cost} TOKENS / CHANCE {boost.probability}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={onHeal}
                      disabled={actionsDisabled}
                      className="menu-button w-full text-left text-[11px] tracking-[0.2em]"
                    >
                      <span className="block">HEAL ({healOption.description})</span>
                      <span className="mt-1 block text-[10px] tracking-[0.18em] text-[#af9b80]">
                        COST {healOption.cost} TOKENS / CHANCE {healOption.probability}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAction('attack')}
                  className="menu-button w-full text-center"
                  disabled={actionsDisabled}
                >
                  ATTACK
                </button>
                <button
                  type="button"
                  onClick={() => onAction('defend')}
                  className="menu-button w-full text-center"
                  disabled={actionsDisabled}
                >
                  DEFEND
                </button>
                <button
                  type="button"
                  onClick={() => onAction('invoke')}
                  className="menu-button w-full text-center"
                  disabled={actionsDisabled}
                >
                  USE ABILITY
                </button>
              </div>

              <div className="parchment-card w-full border border-[#43352b] px-4 py-3 text-center">
                <p className="type-block text-[10px] text-[#7d6b57]">ritual echo</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#cfbea3]">{feedbackText}</p>
                {activeBoost && (
                  <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#e4c39c]">
                    NEXT BOOST READY: {boostOptions.find((boost) => boost.id === activeBoost)?.label}
                  </p>
                )}
              </div>
            </div>

            <PortraitCard
              entity={enemy}
              currentHealth={enemyHealth}
              align="right"
              hit={hitStates.enemy}
              indicator={damageIndicators.enemy}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
