import type { EncounterEntity, ReplaceableArt } from '../lib/worldData';

type ArenaStage = 'searching' | 'matched';

type ArenaFlowPanelProps = {
  stage: ArenaStage;
  player: EncounterEntity;
  opponent?: EncounterEntity;
  unknownOpponentArt: ReplaceableArt;
};

function ArenaPortrait({
  image,
  name,
  subtitle,
}: {
  image: ReplaceableArt;
  name: string;
  subtitle: string;
}) {
  return (
    <div className="parchment-card border border-[#46372d] p-4">
      <div className="overflow-hidden border border-[#4b3a2f] bg-[#161210]">
        <img src={image.src} alt={image.alt} className="h-64 w-full object-cover object-center" />
      </div>
      <h3 className="mt-4 text-xl uppercase tracking-[0.12em] text-[#e0d2b8]">{name}</h3>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#b49f80]">{subtitle}</p>
    </div>
  );
}

export function ArenaFlowPanel({
  stage,
  player,
  opponent,
  unknownOpponentArt,
}: ArenaFlowPanelProps) {
  const resolvedOpponent = opponent
    ? {
        image: opponent.image,
        name: opponent.name,
        subtitle: `${opponent.title} · ${opponent.contract}`,
      }
    : {
        image: unknownOpponentArt,
        name: 'Unknown Opponent',
        subtitle: 'The pit withholds its face until the iron can hear another heartbeat.',
      };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(8,6,6,0.68)] p-4 backdrop-blur-[2px]">
      <section className="panel w-full max-w-[1180px] px-6 py-6">
        <div className="relative z-10">
          <div className="mb-6 text-center">
            <p className="type-block text-[10px] text-[#7d6b57]">pit arena</p>
            <h2 className="mt-2 text-3xl uppercase tracking-[0.14em] text-[#e0d2b8]">SEARCHING THE PIT FOR AN OPPONENT...</h2>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#af9b80]">
              {stage === 'searching'
                ? 'The drums of the pit are sounding for another collector beneath the cinders.'
                : 'The iron has answered. The duel is bound and waiting.'}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_220px_1fr] lg:items-center">
            <ArenaPortrait
              image={player.image}
              name={player.name}
              subtitle={`${player.title} · ${player.contract}`}
            />

            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#544238] bg-[#15110f]/90">
                <div className="absolute inset-2 rounded-full border border-[#3b2e27]" />
                <span className={`text-lg uppercase tracking-[0.28em] text-[#e8dbc2] ${stage === 'searching' ? 'ritual-glitch' : ''}`}>
                  {stage === 'searching' ? 'SEARCHING...' : 'FOUND'}
                </span>
              </div>
              <div className="parchment-card w-full border border-[#43352b] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#7f6d58]">active contract</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#cdbda2]">{player.contract}</p>
              </div>
            </div>

            <ArenaPortrait
              image={resolvedOpponent.image}
              name={resolvedOpponent.name}
              subtitle={resolvedOpponent.subtitle}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
