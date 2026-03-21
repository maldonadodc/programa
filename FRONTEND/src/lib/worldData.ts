export type ZoneName =
  | 'City'
  | 'Echo Abyss'
  | 'Ashen Forge'
  | 'Tileries of Sorrow'
  | 'Dome of Avarice'
  | 'Pit Arena';

export type ReplaceableArt = {
  src: string;
  alt: string;
};

export type ZoneVisual = {
  id: ZoneName;
  label: string;
  sublabel: string;
  top: string;
  left: string;
  width: string;
  height: string;
  tone: string;
  border: string;
  text: string;
  demonArt: ReplaceableArt;
  markerArt: ReplaceableArt;
};

export type EncounterEntity = {
  name: string;
  title: string;
  contract: string;
  accent: string;
  image: ReplaceableArt;
  health: number;
};

export type ZoneContract = {
  zone: ZoneName;
  title: string;
  demon: string;
  remanent: string;
  note: string;
};

function svgDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function portraitSvg({
  label,
  glyph,
  background,
  accent,
  frame,
}: {
  label: string;
  glyph: string;
  background: string;
  accent: string;
  frame: string;
}) {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" shape-rendering="crispEdges">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${background}"/>
          <stop offset="100%" stop-color="#16110f"/>
        </linearGradient>
      </defs>
      <rect width="240" height="280" fill="url(#bg)"/>
      <rect x="12" y="12" width="216" height="256" fill="none" stroke="${frame}" stroke-width="4"/>
      <rect x="28" y="26" width="184" height="228" fill="${accent}" opacity="0.12"/>
      <rect x="78" y="46" width="84" height="54" fill="${accent}" opacity="0.25"/>
      <rect x="64" y="108" width="112" height="86" fill="${accent}" opacity="0.35"/>
      <rect x="86" y="196" width="68" height="38" fill="${accent}" opacity="0.28"/>
      <text x="120" y="168" fill="${frame}" font-family="Courier New" font-size="46" text-anchor="middle">${glyph}</text>
      <text x="120" y="248" fill="${frame}" font-family="Courier New" font-size="18" text-anchor="middle">${label}</text>
    </svg>
  `);
}

function tokenSvg({
  label,
  glyph,
  background,
  accent,
}: {
  label: string;
  glyph: string;
  background: string;
  accent: string;
}) {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" shape-rendering="crispEdges">
      <rect width="96" height="96" rx="8" fill="${background}"/>
      <rect x="6" y="6" width="84" height="84" fill="none" stroke="${accent}" stroke-width="4"/>
      <rect x="18" y="18" width="60" height="36" fill="${accent}" opacity="0.16"/>
      <rect x="22" y="58" width="52" height="18" fill="${accent}" opacity="0.28"/>
      <text x="48" y="53" fill="${accent}" font-family="Courier New" font-size="24" text-anchor="middle">${glyph}</text>
      <text x="48" y="86" fill="${accent}" font-family="Courier New" font-size="11" text-anchor="middle">${label}</text>
    </svg>
  `);
}

export const PLAYER_PROFILE: EncounterEntity = {
  name: 'Ashbound Envoy',
  title: 'Debt Collector of the Nexus',
  contract: 'Ashbound Writ',
  accent: '#d7c5aa',
  image: {
    src: portraitSvg({
      label: 'ENVOY',
      glyph: 'EV',
      background: '#3a322b',
      accent: '#d7c5aa',
      frame: '#f1e0c0',
    }),
    alt: 'Portrait placeholder for the Ashbound envoy',
  },
  health: 82,
};

export const DEMON_ENCOUNTERS: Record<Exclude<ZoneName, 'City' | 'Pit Arena'>, EncounterEntity> = {
  'Echo Abyss': {
    name: 'Thalassos',
    title: 'Abyssal Sovereign of the Echo Well',
    contract: 'Resonant undertow covenant',
    accent: '#8eb4da',
    image: {
      src: portraitSvg({
        label: 'THALASSOS',
        glyph: 'TH',
        background: '#27455d',
        accent: '#8eb4da',
        frame: '#d7ebff',
      }),
      alt: 'Portrait placeholder for Thalassos',
    },
    health: 88,
  },
  'Ashen Forge': {
    name: 'Pyrrhus',
    title: 'Black-brass smith of the foundries',
    contract: 'Broken anvil compact',
    accent: '#d7a16e',
    image: {
      src: portraitSvg({
        label: 'PYRRHUS',
        glyph: 'PY',
        background: '#5d3925',
        accent: '#d7a16e',
        frame: '#ffe2bf',
      }),
      alt: 'Portrait placeholder for Pyrrhus',
    },
    health: 84,
  },
  'Tileries of Sorrow': {
    name: 'Maliki',
    title: 'Mist-mother of the grieving kilns',
    contract: 'Violet shingle covenant',
    accent: '#b395d7',
    image: {
      src: portraitSvg({
        label: 'MALIKI',
        glyph: 'MK',
        background: '#433553',
        accent: '#b395d7',
        frame: '#f0e2ff',
      }),
      alt: 'Portrait placeholder for Maliki',
    },
    health: 79,
  },
  'Dome of Avarice': {
    name: 'Valerius',
    title: 'Ivory warden of hollow wealth',
    contract: 'Exhausted gold decree',
    accent: '#e7d39b',
    image: {
      src: portraitSvg({
        label: 'VALERIUS',
        glyph: 'VA',
        background: '#67593d',
        accent: '#e7d39b',
        frame: '#fff3ca',
      }),
      alt: 'Portrait placeholder for Valerius',
    },
    health: 91,
  },
};

export const ARENA_OPPONENT: EncounterEntity = {
  name: 'Exiled Envoy',
  title: 'Collector of the Pit',
  contract: 'Blind iron pact',
  accent: '#c89b8b',
  image: {
    src: portraitSvg({
      label: 'OPPONENT',
      glyph: '??',
      background: '#4a2e28',
      accent: '#c89b8b',
      frame: '#f3d7cb',
    }),
    alt: 'Portrait placeholder for the pit opponent',
  },
  health: 76,
};

export const UNKNOWN_OPPONENT_ART: ReplaceableArt = {
  src: portraitSvg({
    label: 'UNKNOWN',
    glyph: '?',
    background: '#2d2724',
    accent: '#9f8f79',
    frame: '#ddd0b7',
  }),
  alt: 'Unknown opponent placeholder',
};

export const MAP_ZONES: ZoneVisual[] = [
  {
    id: 'Echo Abyss',
    label: 'Echo Abyss',
    sublabel: 'Abyssal district',
    top: '11%',
    left: '10%',
    width: '22%',
    height: '19%',
    tone: 'from-[#6786a8] via-[#5b7b96] to-[#465e73]',
    border: '#7a96b6',
    text: '#eef4fc',
    demonArt: {
      src: tokenSvg({ label: 'THA', glyph: 'TH', background: '#304a61', accent: '#d8e9f9' }),
      alt: 'Map token for Thalassos',
    },
    markerArt: {
      src: tokenSvg({ label: 'ABYSS', glyph: '~', background: '#3f5f77', accent: '#eef4fc' }),
      alt: 'Map token for Echo Abyss',
    },
  },
  {
    id: 'Ashen Forge',
    label: 'Ashen Forge',
    sublabel: 'Foundry district',
    top: '12%',
    left: '66%',
    width: '22%',
    height: '18%',
    tone: 'from-[#b78654] via-[#a06f45] to-[#7f5938]',
    border: '#d3a06b',
    text: '#fff0df',
    demonArt: {
      src: tokenSvg({ label: 'PYR', glyph: 'PY', background: '#6f4a2c', accent: '#ffe0bd' }),
      alt: 'Map token for Pyrrhus',
    },
    markerArt: {
      src: tokenSvg({ label: 'FORGE', glyph: '*', background: '#835739', accent: '#fff0df' }),
      alt: 'Map token for Ashen Forge',
    },
  },
  {
    id: 'Tileries of Sorrow',
    label: 'Tileries of Sorrow',
    sublabel: 'Fog-shrouded district',
    top: '58%',
    left: '10%',
    width: '22%',
    height: '18%',
    tone: 'from-[#8a7299] via-[#756083] to-[#5f4d6e]',
    border: '#a489b8',
    text: '#faf2ff',
    demonArt: {
      src: tokenSvg({ label: 'MAL', glyph: 'MK', background: '#59476a', accent: '#f2e9ff' }),
      alt: 'Map token for Maliki',
    },
    markerArt: {
      src: tokenSvg({ label: 'TILES', glyph: '#', background: '#6a567a', accent: '#faf2ff' }),
      alt: 'Map token for Tileries of Sorrow',
    },
  },
  {
    id: 'Dome of Avarice',
    label: 'Dome of Avarice',
    sublabel: 'Ivory district',
    top: '56%',
    left: '67%',
    width: '22%',
    height: '18%',
    tone: 'from-[#d8c58d] via-[#c7b47d] to-[#a69266]',
    border: '#f0deb0',
    text: '#3a3123',
    demonArt: {
      src: tokenSvg({ label: 'VAL', glyph: 'VA', background: '#8a7a4f', accent: '#fff4d1' }),
      alt: 'Map token for Valerius',
    },
    markerArt: {
      src: tokenSvg({ label: 'DOME', glyph: '$', background: '#a08e61', accent: '#3a3123' }),
      alt: 'Map token for Dome of Avarice',
    },
  },
  {
    id: 'City',
    label: 'City',
    sublabel: 'Ashen Nexus',
    top: '30%',
    left: '38%',
    width: '24%',
    height: '22%',
    tone: 'from-[#a8a198] via-[#91897f] to-[#6f685f]',
    border: '#d4ccc0',
    text: '#1f1c18',
    demonArt: {
      src: tokenSvg({ label: 'NEXUS', glyph: 'NX', background: '#70695f', accent: '#f9f2e7' }),
      alt: 'Map token for the Ashen Nexus',
    },
    markerArt: {
      src: tokenSvg({ label: 'CITY', glyph: '[]', background: '#857d72', accent: '#1f1c18' }),
      alt: 'Map token for the City',
    },
  },
  {
    id: 'Pit Arena',
    label: 'Pit Arena',
    sublabel: 'Judgment pit',
    top: '70%',
    left: '40%',
    width: '20%',
    height: '13%',
    tone: 'from-[#966255] via-[#7d5046] to-[#603a33]',
    border: '#be8676',
    text: '#fff0e8',
    demonArt: {
      src: tokenSvg({ label: 'PIT', glyph: 'AF', background: '#73483f', accent: '#ffe1d7' }),
      alt: 'Map token for Pit Arena',
    },
    markerArt: {
      src: tokenSvg({ label: 'ARENA', glyph: 'O', background: '#83584d', accent: '#fff0e8' }),
      alt: 'Map token for Pit Arena',
    },
  },
];

export const MAP_DECOR_ART = {
  ruin: {
    src: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" shape-rendering="crispEdges">
        <rect width="120" height="100" fill="#241d19"/>
        <rect x="8" y="30" width="104" height="62" fill="#4a3f37"/>
        <rect x="16" y="18" width="24" height="18" fill="#69594d"/>
        <rect x="48" y="8" width="28" height="28" fill="#756456"/>
        <rect x="82" y="22" width="20" height="14" fill="#69594d"/>
        <rect x="20" y="48" width="14" height="18" fill="#1b1613"/>
        <rect x="48" y="52" width="16" height="20" fill="#1b1613"/>
        <rect x="76" y="46" width="18" height="22" fill="#1b1613"/>
      </svg>
    `),
    alt: 'Map ruin placeholder',
  },
  tower: {
    src: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 180" shape-rendering="crispEdges">
        <rect width="80" height="180" fill="#221c18"/>
        <rect x="18" y="18" width="44" height="152" fill="#5a4c41"/>
        <rect x="22" y="26" width="36" height="18" fill="#6f5f52"/>
        <rect x="26" y="60" width="10" height="18" fill="#1b1613"/>
        <rect x="44" y="92" width="10" height="18" fill="#1b1613"/>
        <rect x="28" y="128" width="24" height="30" fill="#322923"/>
      </svg>
    `),
    alt: 'Map tower placeholder',
  },
};

export const CONTRACT_BY_ZONE: Record<ZoneName, ZoneContract> = {
  City: {
    zone: 'City',
    title: 'Custody of the Nexus',
    demon: 'Chancellor of Cinders',
    remanent: '42',
    note: 'The city core breathes like a sacred furnace and holds the pulse of every debt ever named.',
  },
  'Echo Abyss': {
    zone: 'Echo Abyss',
    title: 'Debt of the Resonant Well',
    demon: 'Thalassos',
    remanent: '73',
    note: 'Beneath its drowned chambers, indebted voices still call for the collector by name.',
  },
  'Ashen Forge': {
    zone: 'Ashen Forge',
    title: 'Tribute of the Black Anvil',
    demon: 'Pyrrhus',
    remanent: '91',
    note: 'Its chimneys forge neither steel nor mercy, only pacts and scorched hearts fit for collection.',
  },
  'Tileries of Sorrow': {
    zone: 'Tileries of Sorrow',
    title: 'Lament of the Broken Tile',
    demon: 'Maliki',
    remanent: '58',
    note: 'A violet fog blankets the roofline and leaves the indebted suspended between grief and soot.',
  },
  'Dome of Avarice': {
    zone: 'Dome of Avarice',
    title: 'Rent of the Ivory Vault',
    demon: 'Valerius',
    remanent: '116',
    note: 'Gold rots into pale bone there, and every oath is weighed like coin against a dead throne.',
  },
  'Pit Arena': {
    zone: 'Pit Arena',
    title: 'Clause of the Pit Warden',
    demon: 'Champion of the Pit',
    remanent: '64',
    note: 'The arena grants no triumph, only a reckoning for the cost of standing again.',
  },
};

export const RESULTS_BY_MODE = {
  demon: {
    remanent: '+38',
    reputation: '+6',
  },
  arena: {
    remanent: '+52',
    reputation: '+11',
  },
};
