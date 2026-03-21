import { useEffect, useRef, useState } from 'react';
import { Arena } from './Arena';
import { EventLog } from './EventLog';
import { HealthBar } from './HealthBar';
import { ContractItem, Inventory } from './Inventory';
import { Map } from './Map';

const contracts: ContractItem[] = [
  { id: 'C-01', title: 'Pediatric Ward Claim', demon: 'Moloch Unit', risk: 'extreme', debt: '9 pints' },
  { id: 'C-04', title: 'Basement Elevator Oath', demon: 'Vein Broker', risk: 'medium', debt: '3 teeth' },
  { id: 'C-07', title: 'Neonatal Furnace Lease', demon: 'Ash Nurse', risk: 'low', debt: '1 vial' },
  { id: 'C-11', title: 'Boiler Room Covenant', demon: 'Carrion Saint', risk: 'extreme', debt: '12 ribs' },
];

type DashboardLog = {
  timestamp: string;
  text: string;
  severity: 'system' | 'warning' | 'fatal';
};

type Screen = 'menu' | 'game' | 'config' | 'logs';

const initialLogs: DashboardLog[] = [
  { timestamp: '23:11:02', text: 'WARD LIGHTS FAILED. GENERATOR B SIGHS BACK TO LIFE.', severity: 'system' },
  { timestamp: '23:11:19', text: 'MOLOCH UNIT DRAGS CHAINS ACROSS THE TILE.', severity: 'warning' },
  { timestamp: '23:11:42', text: 'VEIN BROKER ACCEPTS TERMS. BLOOD TAX UPDATED.', severity: 'system' },
  { timestamp: '23:12:08', text: 'SUDDEN PRESSURE LOSS IN EAST HALLWAY.', severity: 'warning' },
  { timestamp: '23:12:34', text: 'PIT GATE UNSEALED. DUAL HOSTILES ENTER.', severity: 'fatal' },
  { timestamp: '23:12:57', text: 'WITNESS HEART RATE SPIKES ABOVE SAFE LIMIT.', severity: 'fatal' },
];

const combatTexts = [
  'DEMON STRIKES. BLOOD LOSS DETECTED.',
  'CRITICAL PRESSURE DROP.',
  'HOSTILE IMPACT REGISTERED.',
];

function getTimestamp() {
  return new Date().toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function Dashboard() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [health, setHealth] = useState(70);
  const [logs, setLogs] = useState<DashboardLog[]>(initialLogs);
  const [impactFlash, setImpactFlash] = useState(false);
  const [impactShake, setImpactShake] = useState(false);
  const [isAbilityLoading, setIsAbilityLoading] = useState(false);
  const [shakeDirection, setShakeDirection] = useState<'left' | 'right'>('left');
  const [volume, setVolume] = useState(68);
  const [volumeHot, setVolumeHot] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const healthRef = useRef(70);
  const flashTimeoutRef = useRef<number | null>(null);
  const shakeTimeoutRef = useRef<number | null>(null);
  const abilityTimeoutRef = useRef<number | null>(null);
  const volumeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    healthRef.current = health;
  }, [health]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const currentHealth = healthRef.current;

      if (currentHealth <= 0) {
        return;
      }

      const damage = Math.floor(Math.random() * 6) + 5;
      const nextHealth = Math.max(0, currentHealth - damage);
      const text = combatTexts[Math.floor(Math.random() * combatTexts.length)];
      const severity: DashboardLog['severity'] =
        nextHealth <= 30 ? 'fatal' : nextHealth <= 50 ? 'warning' : 'system';

      healthRef.current = nextHealth;
      setHealth(nextHealth);
      setLogs((currentLogs) =>
        [
          ...currentLogs,
          {
            timestamp: getTimestamp(),
            text: `${text} -${damage} $BLOOD.`,
            severity,
          },
        ].slice(-10),
      );

      setImpactFlash(true);
      setImpactShake(true);
      setShakeDirection((currentDirection) => (currentDirection === 'left' ? 'right' : 'left'));

      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }

      if (shakeTimeoutRef.current !== null) {
        window.clearTimeout(shakeTimeoutRef.current);
      }

      flashTimeoutRef.current = window.setTimeout(() => {
        setImpactFlash(false);
      }, 220);

      shakeTimeoutRef.current = window.setTimeout(() => {
        setImpactShake(false);
      }, 260);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);

      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }

      if (shakeTimeoutRef.current !== null) {
        window.clearTimeout(shakeTimeoutRef.current);
      }

      if (abilityTimeoutRef.current !== null) {
        window.clearTimeout(abilityTimeoutRef.current);
      }

      if (volumeTimeoutRef.current !== null) {
        window.clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  const handleUseAbility = () => {
    if (isAbilityLoading || healthRef.current <= 0) {
      return;
    }

    setIsAbilityLoading(true);

    const delay = 1000 + Math.floor(Math.random() * 1001);

    abilityTimeoutRef.current = window.setTimeout(() => {
      const currentHealth = healthRef.current;
      const nextHealth = Math.max(0, currentHealth - 12);
      const severity: DashboardLog['severity'] =
        nextHealth <= 30 ? 'fatal' : nextHealth <= 50 ? 'warning' : 'system';

      healthRef.current = nextHealth;
      setHealth(nextHealth);
      setLogs((currentLogs) =>
        [
          ...currentLogs,
          {
            timestamp: getTimestamp(),
            text: 'x402 BLOOD PAYMENT EXECUTED',
            severity,
          },
        ].slice(-10),
      );

      setImpactFlash(true);
      setImpactShake(true);
      setShakeDirection((currentDirection) => (currentDirection === 'left' ? 'right' : 'left'));
      setIsAbilityLoading(false);

      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }

      if (shakeTimeoutRef.current !== null) {
        window.clearTimeout(shakeTimeoutRef.current);
      }

      flashTimeoutRef.current = window.setTimeout(() => {
        setImpactFlash(false);
      }, 240);

      shakeTimeoutRef.current = window.setTimeout(() => {
        setImpactShake(false);
      }, 280);

      abilityTimeoutRef.current = null;
    }, delay);
  };

  const triggerImpact = (flashDuration = 220, shakeDuration = 260) => {
    setImpactFlash(true);
    setImpactShake(true);
    setShakeDirection((currentDirection) => (currentDirection === 'left' ? 'right' : 'left'));

    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
    }

    if (shakeTimeoutRef.current !== null) {
      window.clearTimeout(shakeTimeoutRef.current);
    }

    flashTimeoutRef.current = window.setTimeout(() => {
      setImpactFlash(false);
    }, flashDuration);

    shakeTimeoutRef.current = window.setTimeout(() => {
      setImpactShake(false);
    }, shakeDuration);
  };

  const navButtonClassName =
    'group relative overflow-hidden border border-zinc-700 bg-black/70 px-6 py-3 text-sm uppercase tracking-[0.35em] text-zinc-200 transition duration-300 hover:border-red-700/80 hover:bg-red-950/20 hover:text-red-100 hover:shadow-[0_0_24px_rgba(210,43,43,0.2)]';

  const backButtonClassName =
    'group relative overflow-hidden border border-zinc-700 bg-black/75 px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-zinc-300 transition duration-300 hover:border-red-700/70 hover:bg-red-950/15 hover:text-red-200 hover:shadow-[0_0_18px_rgba(143,17,23,0.18)]';

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    setVolumeHot(true);

    if (volumeTimeoutRef.current !== null) {
      window.clearTimeout(volumeTimeoutRef.current);
    }

    volumeTimeoutRef.current = window.setTimeout(() => {
      setVolumeHot(false);
      volumeTimeoutRef.current = null;
    }, 320);
  };

  const handleSelectZone = (zone: string) => {
    setSelectedZone(zone);
    const zoneDamage = Math.max(0, Math.floor(Math.random() * 4) + 4);
    const currentHealth = healthRef.current;
    const nextHealth = Math.max(0, currentHealth - zoneDamage);
    const severity: DashboardLog['severity'] =
      nextHealth <= 30 ? 'fatal' : nextHealth <= 50 ? 'warning' : 'system';

    healthRef.current = nextHealth;
    setHealth(nextHealth);
    setLogs((currentLogs) =>
      [
        ...currentLogs,
        {
          timestamp: getTimestamp(),
          text: `ENTERING ${zone}. HOSTILES STIR. -${zoneDamage} $BLOOD.`,
          severity,
        },
      ].slice(-10),
    );
    triggerImpact(260, 300);
  };

  const renderMenuScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-2xl p-6 sm:p-8">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">internal system menu</p>
          <h2 className="glitch-title mt-4 text-4xl uppercase tracking-[0.28em] text-zinc-100 sm:text-5xl">
            BLOOD &amp; DEBT
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
            Mercy Wing terminal online. Select a panel and descend.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <button type="button" onClick={() => setScreen('game')} className={navButtonClassName}>
            <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-0 transition group-hover:opacity-100" />
            <span className="relative">PLAY</span>
          </button>
          <button type="button" onClick={() => setScreen('logs')} className={navButtonClassName}>
            <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-0 transition group-hover:opacity-100" />
            <span className="relative">EVENT LOG</span>
          </button>
          <button type="button" onClick={() => setScreen('config')} className={navButtonClassName}>
            <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-0 transition group-hover:opacity-100" />
            <span className="relative">SETTINGS</span>
          </button>
        </div>
      </div>
    </section>
  );

  const renderGameScreen = () => (
    <>
      <header className="panel mb-5 border border-zinc-800 bg-black/45 px-4 py-4 backdrop-blur-[2px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">infernal collection interface</p>
            <h1 className="glitch-title mt-2 text-3xl uppercase tracking-[0.22em] text-zinc-100 sm:text-4xl">
              BLOOD &amp; DEBT
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400 sm:grid-cols-3">
              <div className="border border-zinc-800 bg-black/50 px-3 py-2">
                <p className="text-[10px] text-zinc-600">sector</p>
                <p className="mt-1 text-zinc-200">Mercy Wing B</p>
              </div>
              <div className="border border-zinc-800 bg-black/50 px-3 py-2">
                <p className="text-[10px] text-zinc-600">cycle</p>
                <p className="mt-1 text-zinc-200">Night Shift 09</p>
              </div>
              <div className="border border-red-950 bg-red-950/10 px-3 py-2">
                <p className="text-[10px] text-zinc-600">alarm</p>
                <p className="mt-1 text-red-300">Level Crimson</p>
              </div>
            </div>

            <button type="button" onClick={() => setScreen('menu')} className={backButtonClassName}>
              <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] opacity-0 transition group-hover:opacity-100" />
              <span className="relative">BACK TO MENU</span>
            </button>
          </div>
        </div>
      </header>

      <section className="grid flex-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)_340px]">
        <div className="grid gap-4 xl:grid-rows-[auto_280px_minmax(0,1fr)]">
          <HealthBar current={health} max={100} />
          <Map onSelectZone={handleSelectZone} selectedZone={selectedZone} />
          <Inventory items={contracts} />
        </div>

        <Arena
          left={{
            name: 'Moloch Unit',
            title: 'Furnace-bred butcher wrapped in cracked restraints',
            condition: '78%',
            sigil: 'M//',
            accent: 'text-red-400',
          }}
          right={{
            name: 'Carrion Saint',
            title: 'Surgical revenant fed by chapel static and bone ash',
            condition: '64%',
            sigil: 'C\\\\',
            accent: 'text-amber-300',
          }}
          onUseAbility={handleUseAbility}
          isAbilityLoading={isAbilityLoading}
        />

        <EventLog entries={logs} />
      </section>
    </>
  );

  const renderLogsScreen = () => (
    <section className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">archived terminal output</p>
          <h2 className="mt-2 text-3xl uppercase tracking-[0.22em] text-zinc-100">Event Log</h2>
        </div>
        <button type="button" onClick={() => setScreen('menu')} className={backButtonClassName}>
          <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] opacity-0 transition group-hover:opacity-100" />
          <span className="relative">BACK TO MENU</span>
        </button>
      </div>

      <div className="flex-1">
        <EventLog entries={logs} />
      </div>
    </section>
  );

  const renderConfigScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">system calibration</p>
            <h2 className="mt-2 text-3xl uppercase tracking-[0.22em] text-zinc-100">Settings</h2>
          </div>
          <button type="button" onClick={() => setScreen('menu')} className={backButtonClassName}>
            <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] opacity-0 transition group-hover:opacity-100" />
            <span className="relative">BACK TO MENU</span>
          </button>
        </div>

        <div
          className={`analog-panel mt-8 border border-zinc-800 bg-black/50 p-5 transition duration-300 ${
            volumeHot ? 'border-red-800/80 shadow-[0_0_24px_rgba(143,17,23,0.16)]' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">ward speaker gain</p>
              <p className="mt-2 text-sm uppercase tracking-[0.28em] text-zinc-200">AUDIO LEVEL</p>
            </div>
            <div className={`rounded-sm border px-3 py-2 text-right ${volumeHot ? 'border-red-700/70 bg-red-950/20' : 'border-zinc-800 bg-black/40'}`}>
              <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-600">output</p>
              <p className={`mt-1 text-lg ${volumeHot ? 'text-red-200' : 'text-red-300'}`}>{volume}%</p>
            </div>
          </div>

          <div className="mt-6 border border-zinc-800 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.32))] p-4">
            <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-zinc-600">
              <span>silence</span>
              <span className={volumeHot ? 'text-red-300' : ''}>amplified static</span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} className="h-5 w-px bg-zinc-700/80" />
                ))}
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => handleVolumeChange(Number(event.target.value))}
                style={{
                  background: `linear-gradient(90deg, rgba(143,17,23,0.95) 0%, rgba(143,17,23,0.95) ${volume}%, rgba(32,32,32,0.95) ${volume}%, rgba(12,12,12,0.95) 100%)`,
                }}
                className={`analog-slider relative z-10 h-4 w-full cursor-pointer appearance-none rounded-none border ${
                  volumeHot ? 'border-red-700/80 shadow-[0_0_18px_rgba(143,17,23,0.18)]' : 'border-zinc-700'
                }`}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between text-[10px] uppercase tracking-[0.28em] text-zinc-600">
            <span>muted</span>
            <span>max feedback</span>
          </div>
        </div>
      </div>
    </section>
  );

  let screenContent: JSX.Element;

  if (screen === 'game') {
    screenContent = renderGameScreen();
  } else if (screen === 'logs') {
    screenContent = renderLogsScreen();
  } else if (screen === 'config') {
    screenContent = renderConfigScreen();
  } else {
    screenContent = renderMenuScreen();
  }

  return (
    <main
      className="crt-shell relative min-h-screen overflow-hidden bg-[#060606] text-zinc-100 transition-transform duration-100"
      style={{
        transform: impactShake
          ? shakeDirection === 'left'
            ? 'translate3d(-6px, 0, 0)'
            : 'translate3d(6px, 0, 0)'
          : 'translate3d(0, 0, 0)',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(143,17,23,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(143,17,23,0.12),transparent_24%),linear-gradient(180deg,#0b0b0c_0%,#050505_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] mix-blend-screen [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_24%),radial-gradient(circle_at_80%_30%,white_0,transparent_18%),radial-gradient(circle_at_60%_80%,white_0,transparent_14%)]" />
      <div className="noise-overlay absolute inset-0" />
      <div className="tv-static absolute inset-0" />
      <div className="signal-jitter absolute inset-0" />
      <div className="screen-vignette absolute inset-0" />
      <div
        className={`pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,rgba(255,84,84,0.16),rgba(110,0,0,0.34)_40%,transparent_72%)] transition-opacity duration-200 ${
          impactFlash ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex-1 transition-opacity duration-300">{screenContent}</div>
      </div>
    </main>
  );
}
