import { useEffect, useRef, useState, useCallback } from 'react';
import { Arena } from './Arena';
import { EventLog } from './EventLog';
import { HealthBar } from './HealthBar';
import { ContractItem, Inventory } from './Inventory';
import { Map } from './Map';
import { useContract } from '../hooks/useContract';

// --- Tipos y Constantes ---
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

// --- Componente Principal ---
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

  const { account, error, ataqueEspecial } = useContract();

  // Refs para limpiar timeouts y evitar fugas de memoria
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Lógica de Impacto Visual ---
  const triggerImpact = useCallback((flashDuration = 220, shakeDuration = 260) => {
    setImpactFlash(true);
    setImpactShake(true);
    setShakeDirection((prev) => (prev === 'left' ? 'right' : 'left'));

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);

    flashTimeoutRef.current = setTimeout(() => setImpactFlash(false), flashDuration);
    shakeTimeoutRef.current = setTimeout(() => setImpactShake(false), shakeDuration);
  }, []);

  // --- Lógica de Logs ---
  const addLog = useCallback((text: string, currentHealth: number) => {
    const severity: DashboardLog['severity'] =
      currentHealth <= 30 ? 'fatal' : currentHealth <= 50 ? 'warning' : 'system';

    setLogs((prev) =>
      [...prev, { timestamp: getTimestamp(), text, severity }].slice(-10)
    );
  }, []);

  // --- Sistema de Daño Pasivo ---
  useEffect(() => {
    if (screen !== 'game' || health <= 0) return;

    const intervalId = setInterval(() => {
      setHealth((prevHealth) => {
        if (prevHealth <= 0) return 0;
        
        const damage = Math.floor(Math.random() * 6) + 5;
        const nextHealth = Math.max(0, prevHealth - damage);
        const randomText = combatTexts[Math.floor(Math.random() * combatTexts.length)];
        
        addLog(`${randomText} -${damage} $BLOOD.`, nextHealth);
        triggerImpact();
        
        return nextHealth;
      });
    }, 3000); // Aumentado a 3s para que sea jugable

    return () => clearInterval(intervalId);
  }, [screen, health, addLog, triggerImpact]);

  // --- Handlers ---
  const handleUseAbility = async () => {
    if (isAbilityLoading || health <= 0 || !account) return;

    setIsAbilityLoading(true);
    try {
      const receipt = await ataqueEspecial("12");
      if (receipt) {
        addLog('x402 BLOOD PAYMENT EXECUTED', health);
      } else {
        addLog(error || 'RITUAL FALLIDO. SIN RESPUESTA.', 0);
      }
    } catch (e) {
      addLog('CRITICAL CONTRACT ERROR', 0);
    } finally {
      setIsAbilityLoading(false);
      triggerImpact(300, 350);
    }
  };

  const handleSelectZone = (zone: string) => {
    setSelectedZone(zone);
    const zoneDamage = Math.floor(Math.random() * 4) + 4;
    
    setHealth((prev) => {
      const next = Math.max(0, prev - zoneDamage);
      addLog(`ENTERING ${zone}. HOSTILES STIR. -${zoneDamage} $BLOOD.`, next);
      return next;
    });
    triggerImpact(260, 300);
  };

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    setVolumeHot(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => setVolumeHot(false), 320);
  };

  // --- Estilos Reutilizables ---
  const navButtonClassName = "group relative overflow-hidden border border-zinc-700 bg-black/70 px-6 py-3 text-sm uppercase tracking-[0.35em] text-zinc-200 transition duration-300 hover:border-red-700/80 hover:bg-red-950/20 hover:text-red-100";
  const backButtonClassName = "group relative overflow-hidden border border-zinc-700 bg-black/75 px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-zinc-300 transition duration-300 hover:border-red-700/70 hover:bg-red-950/15 hover:text-red-200";

  // --- Vistas de Pantalla ---
  const renderMenuScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-2xl p-8 border border-zinc-800 bg-black/60 backdrop-blur-md">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">internal system menu</p>
          <h2 className="glitch-title mt-4 text-5xl uppercase tracking-[0.28em] text-zinc-100">BLOOD &amp; DEBT</h2>
          <p className="mx-auto mt-4 max-w-xl text-xs uppercase tracking-[0.22em] text-zinc-500">Mercy Wing terminal online. Select a panel and descend.</p>
        </div>
        <div className="mt-8 grid gap-4">
          <button onClick={() => setScreen('game')} className={navButtonClassName}>PLAY</button>
          <button onClick={() => setScreen('logs')} className={navButtonClassName}>EVENT LOG</button>
          <button onClick={() => setScreen('config')} className={navButtonClassName}>SETTINGS</button>
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
            <h1 className="glitch-title mt-2 text-3xl uppercase tracking-[0.22em] text-zinc-100 sm:text-4xl">BLOOD &amp; DEBT</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400 sm:grid-cols-3">
              <div className="border border-zinc-800 bg-black/50 px-3 py-2"><p className="text-[10px] text-zinc-600">sector</p><p className="mt-1 text-zinc-200">Mercy Wing B</p></div>
              <div className="border border-zinc-800 bg-black/50 px-3 py-2"><p className="text-[10px] text-zinc-600">cycle</p><p className="mt-1 text-zinc-200">Night Shift 09</p></div>
              <div className="border border-red-950 bg-red-950/10 px-3 py-2"><p className="text-[10px] text-zinc-600">alarm</p><p className="mt-1 text-red-300">Level Crimson</p></div>
            </div>
            <button onClick={() => setScreen('menu')} className={backButtonClassName}>BACK TO MENU</button>
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
          left={{ name: 'Moloch Unit', title: 'Furnace-bred butcher', condition: '78%', sigil: 'M//', accent: 'text-red-400' }}
          right={{ name: 'Carrion Saint', title: 'Surgical revenant', condition: '64%', sigil: 'C\\\\', accent: 'text-amber-300' }}
          onUseAbility={handleUseAbility}
          isAbilityLoading={isAbilityLoading}
        />
        <EventLog entries={logs} />
      </section>
    </>
  );

  return (
    <main
      className="crt-shell relative min-h-screen overflow-hidden bg-[#060606] text-zinc-100 transition-transform duration-75"
      style={{
        transform: impactShake ? `translate3d(${shakeDirection === 'left' ? '-6px' : '6px'}, 0, 0)` : 'none',
      }}
    >
      {/* Capas de Efectos Visuales */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(143,17,23,0.28),transparent_32%)]" />
      <div className="noise-overlay absolute inset-0 opacity-[0.05]" />
      <div className={`pointer-events-none absolute inset-0 z-40 bg-red-600/10 transition-opacity duration-200 ${impactFlash ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-5">
        <div className="flex-1">
          {screen === 'game' ? renderGameScreen() : screen === 'logs' ? null : screen === 'config' ? null : renderMenuScreen()}
        </div>
      </div>
    </main>
  );
}