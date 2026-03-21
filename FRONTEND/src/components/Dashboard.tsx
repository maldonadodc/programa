import { useEffect, useRef, useState } from 'react';
import { Arena } from './Arena';
import { EventLog } from './EventLog';
import { HealthBar } from './HealthBar';
import { ContractItem, Inventory } from './Inventory';

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

const initialLogs: DashboardLog[] = [
  { timestamp: '23:11:02', text: 'WARD LIGHTS FAILED. GENERATOR B SIGHS BACK TO LIFE.', severity: 'system' as const },
  { timestamp: '23:11:19', text: 'MOLOCH UNIT DRAGS CHAINS ACROSS THE TILE.', severity: 'warning' as const },
  { timestamp: '23:11:42', text: 'VEIN BROKER ACCEPTS TERMS. BLOOD TAX UPDATED.', severity: 'system' as const },
  { timestamp: '23:12:08', text: 'SUDDEN PRESSURE LOSS IN EAST HALLWAY.', severity: 'warning' as const },
  { timestamp: '23:12:34', text: 'PIT GATE UNSEALED. DUAL HOSTILES ENTER.', severity: 'fatal' as const },
  { timestamp: '23:12:57', text: 'WITNESS HEART RATE SPIKES ABOVE SAFE LIMIT.', severity: 'fatal' as const },
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
  const [health, setHealth] = useState(70);
  const [logs, setLogs] = useState<DashboardLog[]>(initialLogs);
  const [impactFlash, setImpactFlash] = useState(false);
  const [impactShake, setImpactShake] = useState(false);
  const [shakeDirection, setShakeDirection] = useState<'left' | 'right'>('left');
  const healthRef = useRef(70);
  const flashTimeoutRef = useRef<number | null>(null);
  const shakeTimeoutRef = useRef<number | null>(null);

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
    };
  }, []);

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
      <div className="screen-vignette absolute inset-0" />
      <div
        className={`pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,rgba(255,84,84,0.16),rgba(110,0,0,0.34)_40%,transparent_72%)] transition-opacity duration-200 ${
          impactFlash ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="panel mb-5 border border-zinc-800 bg-black/45 px-4 py-4 backdrop-blur-[2px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">infernal collection interface</p>
              <h1 className="glitch-title mt-2 text-3xl uppercase tracking-[0.22em] text-zinc-100 sm:text-4xl">
                BLOOD &amp; DEBT
              </h1>
            </div>
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
          </div>
        </header>

        <section className="grid flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          <div className="grid gap-4 xl:grid-rows-[auto_minmax(0,1fr)]">
            <HealthBar current={health} max={100} />
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
          />

          <EventLog entries={logs} />
        </section>
      </div>
    </main>
  );
}
