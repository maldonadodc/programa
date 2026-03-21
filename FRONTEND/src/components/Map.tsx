import { useRef, useState, type MouseEvent } from 'react';
import { MAP_DECOR_ART, type ReplaceableArt, type ZoneName, type ZoneVisual } from '../lib/worldData';

type MapPoint = {
  x: number;
  y: number;
};

type MapProps = {
  onMapClick: (point: MapPoint) => void;
  selectedZone: ZoneName | null;
  zones: ZoneVisual[];
  playerArt: ReplaceableArt;
  playerPosition: MapPoint;
  playerMoving: boolean;
  interactionLocked?: boolean;
};

const ruins = [
  { left: '4%', bottom: '12%', width: '9%', height: '11%' },
  { left: '14%', bottom: '18%', width: '6%', height: '7%' },
  { left: '28%', bottom: '10%', width: '10%', height: '8%' },
  { left: '41%', bottom: '14%', width: '7%', height: '10%' },
  { left: '56%', bottom: '9%', width: '12%', height: '8%' },
  { left: '72%', bottom: '16%', width: '9%', height: '7%' },
  { left: '86%', bottom: '11%', width: '7%', height: '10%' },
];

const towers = [
  { left: '8%', height: '28%', width: '4%' },
  { left: '22%', height: '36%', width: '5%' },
  { left: '37%', height: '30%', width: '4%' },
  { left: '61%', height: '34%', width: '5%' },
  { left: '78%', height: '29%', width: '4%' },
];

const connectors = [
  { left: '31%', top: '22%', width: '17%', rotate: '18deg' },
  { left: '52%', top: '22%', width: '17%', rotate: '-18deg' },
  { left: '31%', top: '59%', width: '17%', rotate: '-16deg' },
  { left: '52%', top: '59%', width: '18%', rotate: '16deg' },
  { left: '47%', top: '52%', width: '6%', rotate: '90deg' },
];

export function Map({
  onMapClick,
  selectedZone,
  zones,
  playerArt,
  playerPosition,
  playerMoving,
  interactionLocked = false,
}: MapProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hoveredZone, setHoveredZone] = useState<ZoneName | null>(null);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (interactionLocked || !rootRef.current) return;

    const rect = rootRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(4, Math.min(96, x));
    const clampedY = Math.max(8, Math.min(92, y));

    onMapClick({ x: clampedX, y: clampedY });
  };

  return (
    <section className="panel relative h-full min-h-[48rem] overflow-hidden p-0">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#2c2823_0%,#1f1b18_38%,#161311_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,248,232,0.08),transparent_20%),radial-gradient(circle_at_18%_72%,rgba(122,104,160,0.14),transparent_22%),radial-gradient(circle_at_80%_22%,rgba(187,134,84,0.18),transparent_22%),radial-gradient(circle_at_18%_18%,rgba(103,134,168,0.16),transparent_20%),radial-gradient(circle_at_82%_70%,rgba(216,197,141,0.14),transparent_22%)]" />
      <div className="absolute inset-0 bg-hatch bg-[size:22px_22px] opacity-[0.14]" />
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-[linear-gradient(180deg,rgba(19,15,13,0.1),rgba(12,10,9,0.6))]" />

      {towers.map((tower) => (
        <img
          key={`${tower.left}-${tower.height}`}
          src={MAP_DECOR_ART.tower.src}
          alt={MAP_DECOR_ART.tower.alt}
          className="pointer-events-none absolute bottom-[21%] object-fill opacity-85"
          style={{ left: tower.left, height: tower.height, width: tower.width }}
        />
      ))}

      {ruins.map((ruin) => (
        <img
          key={`${ruin.left}-${ruin.width}`}
          src={MAP_DECOR_ART.ruin.src}
          alt={MAP_DECOR_ART.ruin.alt}
          className="pointer-events-none absolute object-fill opacity-90"
          style={{ left: ruin.left, bottom: ruin.bottom, width: ruin.width, height: ruin.height }}
        />
      ))}

      {connectors.map((connector) => (
        <div
          key={`${connector.left}-${connector.top}`}
          className="absolute h-[6px] origin-left border-y border-[#65533f] bg-[linear-gradient(90deg,rgba(214,196,162,0.9),rgba(120,96,64,0.9))] opacity-70"
          style={{
            left: connector.left,
            top: connector.top,
            width: connector.width,
            transform: `rotate(${connector.rotate})`,
          }}
        />
      ))}

      <div className="absolute left-[49%] top-[38%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,248,232,0.22),rgba(255,248,232,0.05)_55%,transparent_72%)] blur-2xl" />

      <div
        ref={rootRef}
        className={`relative z-10 h-full w-full ${interactionLocked ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={handleClick}
      >
        {zones.map((zone) => {
          const isActive = selectedZone === zone.id;
          const isHovered = hoveredZone === zone.id;

          return (
            <div
              key={zone.id}
              className={`group absolute overflow-hidden border text-left transition duration-300 ${
                isActive ? 'zone-active scale-[1.01]' : ''
              } ${isHovered ? 'zone-hovered' : ''}`}
              style={{
                top: zone.top,
                left: zone.left,
                width: zone.width,
                height: zone.height,
                borderColor: zone.border,
                color: zone.text,
                boxShadow: isActive
                  ? `0 0 0 1px ${zone.border}, 0 18px 34px rgba(0,0,0,0.25), 0 0 28px ${zone.border}33`
                  : isHovered
                    ? `0 0 0 1px ${zone.border}, 0 12px 26px rgba(0,0,0,0.16), 0 0 18px ${zone.border}22`
                    : '0 14px 28px rgba(0,0,0,0.16)',
                backgroundImage: `linear-gradient(180deg, rgba(255,248,232,0.08), transparent 20%, transparent 80%, rgba(0,0,0,0.18)), linear-gradient(135deg, rgba(255,255,255,0.05), transparent 36%)`,
              }}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone((current) => (current === zone.id ? null : current))}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${zone.tone}`} />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,232,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,248,232,0.05)_1px,transparent_1px)] bg-[size:9px_9px] opacity-45" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,248,232,0.18),transparent_32%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.16),transparent_40%)]" />
              <div className="absolute inset-y-0 left-0 w-[4px] bg-[linear-gradient(180deg,transparent,rgba(255,248,232,0.75),transparent)] opacity-90" />

              <div className="relative flex h-full flex-col justify-between p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] opacity-80">{zone.sublabel}</p>
                    <h3 className="mt-2 text-sm uppercase tracking-[0.14em]">{zone.label}</h3>
                  </div>
                  <img
                    src={zone.demonArt.src}
                    alt={zone.demonArt.alt}
                    className="zone-token-image h-12 w-12"
                  />
                </div>

                <div className="flex items-end justify-between gap-3">
                  <img
                    src={zone.markerArt.src}
                    alt={zone.markerArt.alt}
                    className="zone-token-image h-12 w-12"
                  />

                  <div className={`type-block text-[10px] text-[#f2e7d4] transition-opacity duration-300 ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}`}>
                    ENTER
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: `${playerPosition.x}%`,
            top: `${playerPosition.y}%`,
            transform: 'translate(-50%, -88%)',
            transition: 'left 850ms ease-in-out, top 850ms ease-in-out',
          }}
        >
          <div className={`relative ${playerMoving ? 'map-player-moving' : 'map-player-idle'}`}>
            <div className="map-player-aura" />
            <img
              src={playerArt.src}
              alt={playerArt.alt}
              className="map-player-sprite relative h-16 w-16"
            />
          </div>
        </div>

        <div className="absolute left-1/2 top-[7%] -translate-x-1/2 text-center">
          <p className="type-block text-[10px] text-[#8a7862]">world ledger</p>
          <h2 className="mt-2 text-2xl uppercase tracking-[0.16em] text-[#efe4d0]">Ashen Nexus</h2>
        </div>
      </div>
    </section>
  );
}
