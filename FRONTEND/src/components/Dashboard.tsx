import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArenaFlowPanel } from './ArenaFlowPanel';
import { CombatPanel } from './CombatPanel';
import { HealthBar } from './HealthBar';
import { Map } from './Map';
import { ResultsPanel } from './ResultsPanel';
import { useContract } from '../hooks/useContract';
import {
  ARENA_OPPONENT,
  CONTRACT_BY_ZONE,
  DEMON_ENCOUNTERS,
  MAP_ZONES,
  PLAYER_PROFILE,
  RESULTS_BY_MODE,
  UNKNOWN_OPPONENT_ART,
  type EncounterEntity,
  type ZoneName,
} from '../lib/worldData';

type DashboardLog = {
  timestamp: string;
  text: string;
  severity: 'system' | 'warning' | 'fatal';
};

type Screen = 'menu' | 'login' | 'ritual' | 'game' | 'instructions' | 'config';
type CombatAction = 'attack' | 'defend' | 'invoke';
type MapPoint = { x: number; y: number };

type OverlayState =
  | { kind: 'none' }
  | { kind: 'arena-search' }
  | { kind: 'arena-match' }
  | { kind: 'combat'; mode: 'demon' | 'arena'; enemy: EncounterEntity; title: string; subtitle: string; feedbackText: string }
  | { kind: 'results'; mode: 'demon' | 'arena'; title: string };

const initialLogs: DashboardLog[] = [
  { timestamp: '23:11:02', text: 'The Ashen Nexus stirs beneath the corpse of the world.', severity: 'system' },
  { timestamp: '23:11:19', text: 'The sealed districts answer to infernal signatures.', severity: 'warning' },
  { timestamp: '23:11:42', text: 'An envoy stands ready to tune his pulse to the threshold.', severity: 'system' },
];

const DEFAULT_PLAYER_POSITION: MapPoint = { x: 50, y: 43 };
const PLAYER_MOVE_DURATION_MS = 850;

function getTimestamp() {
  return new Date().toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getZoneAtPosition(point: MapPoint): ZoneName | null {
  const hit = MAP_ZONES.find((zone) => {
    const left = parseFloat(zone.left);
    const top = parseFloat(zone.top);
    const width = parseFloat(zone.width);
    const height = parseFloat(zone.height);

    return point.x >= left && point.x <= left + width && point.y >= top && point.y <= top + height;
  });

  return hit?.id ?? null;
}

export function Dashboard() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [envoyIdentity, setEnvoyIdentity] = useState('');
  const [accessSeal, setAccessSeal] = useState('');
  const [health] = useState(70);
  const [remanent] = useState(187);
  const [logs, setLogs] = useState<DashboardLog[]>(initialLogs);
  const [impactFlash, setImpactFlash] = useState(false);
  const [impactShake, setImpactShake] = useState(false);
  const [shakeDirection, setShakeDirection] = useState<'left' | 'right'>('left');
  const [volume, setVolume] = useState(68);
  const [volumeHot, setVolumeHot] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneName>('City');
  const [overlay, setOverlay] = useState<OverlayState>({ kind: 'none' });
  const [playerPosition, setPlayerPosition] = useState<MapPoint>(DEFAULT_PLAYER_POSITION);
  const [playerMoving, setPlayerMoving] = useState(false);

  const { account } = useContract();

  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ritualTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arenaSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arenaMatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerImpact = useCallback((flashDuration = 200, shakeDuration = 240) => {
    setImpactFlash(true);
    setImpactShake(true);
    setShakeDirection((prev) => (prev === 'left' ? 'right' : 'left'));

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);

    flashTimeoutRef.current = setTimeout(() => setImpactFlash(false), flashDuration);
    shakeTimeoutRef.current = setTimeout(() => setImpactShake(false), shakeDuration);
  }, []);

  const addLog = useCallback((text: string, severity: DashboardLog['severity'] = 'system') => {
    setLogs((prev) => [...prev, { timestamp: getTimestamp(), text, severity }].slice(-6));
  }, []);

  const clearArenaTimers = useCallback(() => {
    if (arenaSearchTimeoutRef.current) clearTimeout(arenaSearchTimeoutRef.current);
    if (arenaMatchTimeoutRef.current) clearTimeout(arenaMatchTimeoutRef.current);
  }, []);

  const clearMovementTimer = useCallback(() => {
    if (movementTimeoutRef.current) clearTimeout(movementTimeoutRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
      if (ritualTimeoutRef.current) clearTimeout(ritualTimeoutRef.current);
      clearArenaTimers();
      clearMovementTimer();
    };
  }, [clearArenaTimers, clearMovementTimer]);

  const openDemonCombat = useCallback((zone: Exclude<ZoneName, 'City' | 'Pit Arena'>) => {
    const enemy = DEMON_ENCOUNTERS[zone];
    setOverlay({
      kind: 'combat',
      mode: 'demon',
      enemy,
      title: `${zone.toUpperCase()} DEBT RITE`,
      subtitle: `${enemy.name} rises to answer the district covenant.`,
      feedbackText: 'The pact hangs between ash, iron, and a debt not yet bled dry.',
    });
  }, []);

  const startArenaFlow = useCallback(() => {
    clearArenaTimers();
    setOverlay({ kind: 'arena-search' });
    addLog('SEARCHING THE PIT FOR AN OPPONENT...', 'warning');
    triggerImpact(240, 280);

    arenaSearchTimeoutRef.current = setTimeout(() => {
      setOverlay({ kind: 'arena-match' });
      addLog('THE PIT HAS FOUND A RIVAL COLLECTOR.', 'warning');

      arenaMatchTimeoutRef.current = setTimeout(() => {
        setOverlay({
          kind: 'combat',
          mode: 'arena',
          enemy: ARENA_OPPONENT,
          title: 'PIT DUALITY',
          subtitle: 'The arena has answered with a second claimant of ashbound debt.',
          feedbackText: 'The pit wants proof of will before it seals a victor in the cinders.',
        });
      }, 1200);
    }, 1400);
  }, [addLog, clearArenaTimers, triggerImpact]);

  const handleZoneArrival = useCallback((zone: ZoneName) => {
    setSelectedZone(zone);
    addLog(`ENTERING ${zone.toUpperCase()}...`, zone === 'Pit Arena' ? 'warning' : 'system');
    triggerImpact(260, 240);

    if (zone === 'City') {
      clearArenaTimers();
      setOverlay({ kind: 'none' });
      return;
    }

    if (zone === 'Pit Arena') {
      startArenaFlow();
      return;
    }

    openDemonCombat(zone);
  }, [addLog, clearArenaTimers, openDemonCombat, startArenaFlow, triggerImpact]);

  const handleMapMove = (point: MapPoint) => {
    if (overlay.kind !== 'none') return;

    clearMovementTimer();
    setPlayerMoving(true);
    setPlayerPosition(point);

    movementTimeoutRef.current = setTimeout(() => {
      setPlayerMoving(false);
      const zone = getZoneAtPosition(point);
      if (zone) {
        handleZoneArrival(zone);
      }
    }, PLAYER_MOVE_DURATION_MS);
  };

  const handleStartRitual = () => {
    setScreen('ritual');
    if (ritualTimeoutRef.current) clearTimeout(ritualTimeoutRef.current);
    ritualTimeoutRef.current = setTimeout(() => {
      setSelectedZone('City');
      setOverlay({ kind: 'none' });
      setPlayerPosition(DEFAULT_PLAYER_POSITION);
      addLog('TUNING INTO THE ASHEN NEXUS...', 'system');
      setScreen('game');
    }, 1600);
  };

  const handleCombatAction = (action: CombatAction) => {
    const feedbackByAction: Record<CombatAction, string> = {
      attack: 'A debt blade draws a bright wound across the soot-heavy air.',
      defend: 'The seal rises like hammered brass and catches the blow in prayer.',
      invoke: 'A pact-cant rolls through the ironwork and wakes the hidden names.',
    };

    const labelByAction: Record<CombatAction, string> = {
      attack: 'ATTACK',
      defend: 'DEFENSE',
      invoke: 'PACT INVOKED',
    };

    setOverlay((current) =>
      current.kind === 'combat'
        ? {
            ...current,
            feedbackText: feedbackByAction[action],
          }
        : current,
    );

    addLog(`${labelByAction[action]} WITHIN ${selectedZone.toUpperCase()}.`, 'system');
    triggerImpact(220, 200);
  };

  const handleResolveEncounter = () => {
    setOverlay((current) =>
      current.kind === 'combat'
        ? {
            kind: 'results',
            mode: current.mode,
            title: current.mode === 'arena' ? 'PIT RECKONING' : 'DEBT RECKONING',
          }
        : current,
    );
  };

  const handleCloseOverlay = () => {
    clearArenaTimers();
    setOverlay({ kind: 'none' });
  };

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    setVolumeHot(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => setVolumeHot(false), 320);
  };

  const activeContract = useMemo(() => CONTRACT_BY_ZONE[selectedZone], [selectedZone]);
  const latestLogs = logs.slice(-3).reverse();

  const menuButtonClassName = 'menu-button';
  const backButtonClassName = 'back-button';

  const renderMenuScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-3xl px-8 py-10 sm:px-12">
        <div className="relative z-10 text-center">
          <p className="type-block text-[10px] text-[#7d6b57]">corpse of reality</p>
          <h1 className="title-engrave mt-5 text-4xl uppercase sm:text-6xl">ASHBOUND</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm uppercase tracking-[0.26em] text-[#a7967b]">
            A Debt Collector in the Ashen Nexus
          </p>
          <div className="iron-divider mx-auto mt-6 h-px w-48" />
          <p className="mx-auto mt-6 max-w-xl text-xs uppercase tracking-[0.24em] text-[#8e7d66]">
            The city exhales soot, the districts belong to ancient demons, and every debt still beats in your hands.
          </p>
        </div>

        <div className="relative z-10 mt-10 grid gap-4">
          <button onClick={() => setScreen('login')} className={menuButtonClassName}>PLAY</button>
          <button onClick={() => setScreen('instructions')} className={menuButtonClassName}>INSTRUCTIONS</button>
          <button onClick={() => setScreen('config')} className={menuButtonClassName}>SETTINGS</button>
        </div>
      </div>
    </section>
  );

  const renderLoginScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-4xl p-8 sm:p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
          <div>
            <p className="type-block text-[10px] text-[#7d6b57]">ritual synchrony chamber</p>
            <h2 className="title-engrave mt-4 text-3xl uppercase sm:text-4xl">ASHBOUND ACCESS</h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[#baa88f]">
              Passage is not granted through clean credentials or modern light. The envoy must speak his name, score his seal, and let the arcane machine recognize the debt welded to his pulse.
            </p>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="type-block text-[11px] text-[#9c8b72]">ENVOY IDENTITY</span>
                <div className="ritual-field ritual-flicker mt-3">
                  <input
                    type="text"
                    value={envoyIdentity}
                    onChange={(event) => setEnvoyIdentity(event.target.value)}
                    placeholder="Write the name bound by debt"
                    className="w-full bg-transparent px-4 py-4 text-sm uppercase tracking-[0.18em] text-[#e0d2b8] outline-none placeholder:text-[#6f604d]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="type-block text-[11px] text-[#9c8b72]">ACCESS SEAL</span>
                <div className="ritual-field mt-3">
                  <input
                    type="password"
                    value={accessSeal}
                    onChange={(event) => setAccessSeal(event.target.value)}
                    placeholder="Trace the sigil in brass and ash"
                    className="w-full bg-transparent px-4 py-4 text-sm uppercase tracking-[0.22em] text-[#e0d2b8] outline-none placeholder:text-[#6f604d]"
                  />
                </div>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={handleStartRitual} className="menu-button ritual-glitch text-center">
                  INITIATE RITUAL
                </button>
                <button type="button" onClick={() => setScreen('menu')} className={backButtonClassName}>
                  BACK TO MENU
                </button>
              </div>
            </div>
          </div>

          <aside className="parchment-card relative overflow-hidden border border-[#45372d] px-5 py-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(123,47,38,0.14),transparent_38%),repeating-linear-gradient(180deg,rgba(205,189,162,0.016)_0_1px,transparent_1px_4px)] opacity-80" />
            <div className="relative z-10">
              <p className="type-block text-[10px] text-[#7d6b57]">access liturgy</p>
              <div className="iron-divider mt-4 h-px w-full" />
              <div className="mt-5 space-y-4 text-xs uppercase tracking-[0.2em] text-[#cdbda2]">
                <p>1. The envoy names himself before the liturgical engine.</p>
                <p>2. The seal is pressed into copper, grease, and ash.</p>
                <p>3. The nexus listens, bends the flesh, and opens the threshold.</p>
              </div>
              <div className="mt-8 rounded-sm border border-[#4d3d32] bg-[#130f0d]/80 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#7b6b56]">machine state</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#d7c7ab]">Runic cylinders are still warm from the last collector.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );

  const renderRitualScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel ritual-fade w-full max-w-3xl px-8 py-12 sm:px-12">
        <div className="relative z-10 text-center">
          <p className="type-block text-[10px] text-[#7d6b57]">threshold attunement</p>
          <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#4a382d] bg-[#140f0e]/85 shadow-[inset_0_0_0_1px_rgba(205,189,162,0.05),0_16px_30px_rgba(0,0,0,0.32)]">
            <span className="ritual-glyph text-3xl text-[#caa47d]">A</span>
          </div>
          <h2 className="ritual-glitch mt-8 text-2xl uppercase tracking-[0.22em] text-[#e0d2b8] sm:text-3xl">
            TUNING INTO THE ASHEN NEXUS...
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-xs uppercase tracking-[0.24em] text-[#98866d]">
            Brass, soot, and prayer are aligning your pulse to the dead machinery of the city.
          </p>
        </div>
      </div>
    </section>
  );

  const renderGameScreen = () => (
    <section className="relative flex flex-1">
      <div className="relative flex-1">
        <Map
          onMapClick={handleMapMove}
          selectedZone={selectedZone}
          zones={MAP_ZONES}
          playerArt={PLAYER_PROFILE.image}
          playerPosition={playerPosition}
          playerMoving={playerMoving}
          interactionLocked={overlay.kind !== 'none'}
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_20%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.16),transparent_34%)]" />

        <div className="absolute left-4 top-4 z-20 w-[19rem] max-w-[calc(100%-2rem)] space-y-4">
          <div className="panel px-4 py-4">
            <div className="relative z-10">
              <p className="type-block text-[10px] text-[#7d6b57]">ashbound ledger</p>
              <h2 className="mt-2 text-2xl uppercase tracking-[0.14em] text-[#e0d2b8]">ASHBOUND</h2>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#ab9a7e]">
                Active footing in {selectedZone}
              </p>
              <div className="iron-divider mt-4 h-px w-full" />
              <div className="mt-4 space-y-3 text-[11px] uppercase tracking-[0.18em] text-[#c9b89d]">
                {latestLogs.map((entry, index) => (
                  <div key={`${entry.timestamp}-${index}`} className="border-l border-[#5b4636] pl-3">
                    <p className="text-[#7b6b56]">[{entry.timestamp}]</p>
                    <p className={entry.severity === 'warning' ? 'text-[#c89a75]' : entry.severity === 'fatal' ? 'text-[#d9a089]' : 'text-[#cfbea3]'}>
                      {entry.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => setScreen('menu')} className={backButtonClassName}>
            BACK TO MENU
          </button>
        </div>

        <div className="absolute right-4 top-4 z-20 w-[19rem] max-w-[calc(100%-2rem)]">
          <HealthBar current={health} max={100} />
        </div>

        <div className="absolute bottom-4 left-4 z-20 w-[18rem] max-w-[calc(100%-2rem)]">
          <div className="panel px-4 py-4">
            <div className="relative z-10">
              <p className="type-block text-[10px] text-[#7d6b57]">remanent</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-3xl uppercase tracking-[0.12em] text-[#e0d2b8]">{remanent}</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#b49f80]">ashbound tally</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-20 w-[22rem] max-w-[calc(100%-2rem)]">
          <div className="panel px-4 py-4">
            <div className="relative z-10">
              <p className="type-block text-[10px] text-[#7d6b57]">active contract</p>
              <h3 className="mt-2 text-xl uppercase tracking-[0.12em] text-[#e0d2b8]">{activeContract.title}</h3>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#d0bea2]">{activeContract.demon}</p>
              <p className="mt-4 text-sm leading-7 text-[#b9a78c]">{activeContract.note}</p>
              <div className="mt-5 flex items-center justify-between border-t border-[#43342b] pt-4 text-xs uppercase tracking-[0.18em] text-[#bba98d]">
                <span>{activeContract.zone}</span>
                <span>Reward {activeContract.remanent}</span>
              </div>
            </div>
          </div>
        </div>

        {overlay.kind === 'arena-search' && (
          <ArenaFlowPanel stage="searching" player={PLAYER_PROFILE} unknownOpponentArt={UNKNOWN_OPPONENT_ART} />
        )}

        {overlay.kind === 'arena-match' && (
          <ArenaFlowPanel
            stage="matched"
            player={PLAYER_PROFILE}
            opponent={ARENA_OPPONENT}
            unknownOpponentArt={UNKNOWN_OPPONENT_ART}
          />
        )}

        {overlay.kind === 'combat' && (
          <CombatPanel
            player={PLAYER_PROFILE}
            enemy={overlay.enemy}
            title={overlay.title}
            subtitle={overlay.subtitle}
            feedbackText={overlay.feedbackText}
            onAction={handleCombatAction}
            onClose={handleCloseOverlay}
            onResolve={handleResolveEncounter}
          />
        )}

        {overlay.kind === 'results' && (
          <ResultsPanel
            title={overlay.title}
            remanent={RESULTS_BY_MODE[overlay.mode].remanent}
            reputation={RESULTS_BY_MODE[overlay.mode].reputation}
            onClose={handleCloseOverlay}
          />
        )}
      </div>
    </section>
  );

  const renderInstructionsScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-4xl p-8 sm:p-10">
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="type-block text-[10px] text-[#7d6b57]">book of the envoy</p>
            <h2 className="mt-3 text-3xl uppercase tracking-[0.14em] text-[#ddd0b7]">INSTRUCTIONS</h2>
            <p className="mt-5 text-sm leading-8 text-[#bfae94]">
              You are an envoy, a debt collector sent into the Ashen Nexus. Your charge is to enter the demon-ruled districts and wrench the Remanent Hearts from them before the city closes the wound.
            </p>
            <p className="mt-4 text-sm leading-8 text-[#bfae94]">
              Each district answers to an infernal sovereign. They keep the ledgers, warp the streets, and brand those who hesitate. Yours is not a glorious trade. It is a trade of collection, survival, and return.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <div className="parchment-card border border-[#45372d] px-4 py-4">
              <p className="type-block text-[10px] text-[#7d6b57]">oath</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] leading-6 text-[#cfbea3]">
                Collect the debt. Gather the hearts. Do not turn back when the district speaks your true name.
              </p>
            </div>
            <div className="parchment-card border border-[#45372d] px-4 py-4">
              <p className="type-block text-[10px] text-[#7d6b57]">remembrance</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] leading-6 text-[#cfbea3]">
                The hearts of the remanent are not relics. They are live debt, fragments that still refuse the mercy of forgetting.
              </p>
            </div>
            <button onClick={() => setScreen('menu')} className={backButtonClassName}>BACK TO MENU</button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderConfigScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-3xl p-8 sm:p-10">
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="type-block text-[10px] text-[#7d6b57]">nexus adjustments</p>
            <h2 className="mt-3 text-3xl uppercase tracking-[0.14em] text-[#ddd0b7]">SETTINGS</h2>
            <p className="mt-5 text-sm leading-8 text-[#bfae94]">
              Tune the resonance of iron, ash, and liturgical echo. Nothing here is clean. Everything sounds like old timber, wet chain, and prayer trapped beneath stone.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-5">
            <div className="parchment-card border border-[#45372d] px-4 py-4">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-[#cfbea3]">
                <span>resonance</span>
                <span className={volumeHot ? 'text-[#e4c39c]' : 'text-[#9f8c73]'}>{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => handleVolumeChange(Number(event.target.value))}
                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-none border border-[#4d3a2f] bg-[#15100e] accent-[#8a6a43]"
              />
            </div>

            <div className="grid gap-3 text-xs uppercase tracking-[0.2em] text-[#af9e84]">
              <div className="parchment-card border border-[#45372d] px-4 py-3">
                Ritual account: {account ? 'bound' : 'unsealed'}
              </div>
              <div className="parchment-card border border-[#45372d] px-4 py-3">
                Visible district: {selectedZone}
              </div>
            </div>

            <button onClick={() => setScreen('menu')} className={backButtonClassName}>BACK TO MENU</button>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#090807] text-[#d1c2a7] transition-transform duration-75"
      style={{
        transform: impactShake ? `translate3d(${shakeDirection === 'left' ? '-5px' : '5px'}, 0, 0)` : 'none',
      }}
    >
      <div className="ash-noise absolute inset-0" />
      <div className="screen-vignette absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(123,47,38,0.18),transparent_32%),radial-gradient(circle_at_bottom,rgba(138,106,67,0.12),transparent_36%)]" />
      <div
        className={`pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle,rgba(255,248,232,0.08),rgba(123,47,38,0.08),rgba(0,0,0,0.04))] transition-opacity duration-200 ${
          impactFlash ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-5">
        <div className="flex-1">
          {screen === 'game'
            ? renderGameScreen()
            : screen === 'login'
              ? renderLoginScreen()
              : screen === 'ritual'
                ? renderRitualScreen()
                : screen === 'instructions'
                  ? renderInstructionsScreen()
                  : screen === 'config'
                    ? renderConfigScreen()
                    : renderMenuScreen()}
        </div>
      </div>
    </main>
  );
}
