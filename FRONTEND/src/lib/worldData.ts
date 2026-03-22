import { CITY_ENEMY_ASSETS, DEMON_ASSETS, PLAYER_ASSETS, UI_ASSETS, ZONE_ASSETS } from './assets';

export type ZoneName =
  | 'City'
  | 'Echo Abyss'
  | 'Ashen Forge'
  | 'Tileries of Sorrow'
  | 'Dome of Avarice'
  | 'Pit Arena';

export type DemonContractId = 'thalassos' | 'pyrrhus' | 'maliki' | 'valerius';
export type ContractTheme = 'Abyss' | 'Fire' | 'Shadow' | 'Gold';
export type TokenBoostType = 'attack' | 'defense' | 'special';
export type BehaviorMetricType = 'attackCount' | 'defendCount' | 'abilityCount' | 'tokenUsage';

export type ReplaceableArt = {
  src: string;
  alt: string;
  fit?: 'cover' | 'contain';
  position?: string;
  mirrored?: boolean;
};

export type CombatStats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
};

export type ContractCoreStats = {
  attack: number;
  defense: number;
  specialAttack: number;
};

export type CombatRewards = {
  reputationGain: number;
  tokensReward: number;
};

export type PlayerBehaviorStats = {
  battlesWon: number;
  attackCount: number;
  defendCount: number;
  abilityCount: number;
  tokenUsage: number;
};

export type CombatStatRange = {
  min: number;
  max: number;
};

export type CombatStatRanges = {
  hp: CombatStatRange;
  attack: CombatStatRange;
  defense: CombatStatRange;
  specialAttack: CombatStatRange;
};

export type EncounterEntity = {
  id: string;
  name: string;
  title: string;
  contract: string;
  accent: string;
  image: ReplaceableArt;
  type?: string;
  strategyHint?: string;
  stats: CombatStats;
};

export type EnemyEncounter = EncounterEntity & {
  rewards: CombatRewards;
};

export type EnemyEncounterTemplate = Omit<EnemyEncounter, 'stats'> & {
  statRanges: CombatStatRanges;
};

export type ContractAbilityTier = {
  level: number;
  abilities: string[];
};

export type DemonPersonalityProfile = {
  favoredBehavior: BehaviorMetricType;
  minimumReputation: number;
  preferredRatio: number;
  minimumFavoredActions: number;
  allowUnproven: boolean;
  preferenceLabel: string;
  evaluationLabel: string;
  rejectionDialogue: string;
};

export type DemonContract = {
  id: DemonContractId;
  name: string;
  title: string;
  zone: ZoneName;
  theme: ContractTheme;
  accent: string;
  image: ReplaceableArt;
  note: string;
  progressionLabel: string;
  baseStats: ContractCoreStats;
  levelGrowth: ContractCoreStats;
  economyBonusTokens: number;
  abilitiesByLevel: ContractAbilityTier[];
  personality: DemonPersonalityProfile;
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
  backgroundArt: ReplaceableArt;
  demonArt: ReplaceableArt;
  markerArt: ReplaceableArt;
};

export type TokenBoostOption = {
  id: TokenBoostType;
  label: string;
  cost: number;
  effect: number;
  probability: string;
  description: string;
};

export type TokenHealOption = {
  cost: number;
  healAmount: number;
  probability: string;
  description: string;
};

export const SOUL_ACTION_COSTS = {
  attack: 1,
  ability: 3,
  contractAttempt: 5,
  boost: 2,
  heal: 2,
} as const;

export const PLAYER_PROFILE = {
  id: 'ashbound-envoy',
  name: 'Ashbound Envoy',
  title: 'Debt Collector of the Nexus',
  contract: 'Ashbound Writ',
  accent: '#d7c5aa',
  image: PLAYER_ASSETS.envoy,
  type: 'Envoy',
  maxHp: 82,
};

export const CITY_ENEMIES: EnemyEncounterTemplate[] = [
  {
    id: 'rift-runner',
    name: 'Rift Runner',
    title: 'Knife-fast scavenger of the cinder lanes',
    contract: 'Smoke alley levy',
    accent: '#d8a06d',
    image: CITY_ENEMY_ASSETS.RiftRunner,
    type: 'Raider',
    statRanges: {
      hp: { min: 120, max: 168 },
      attack: { min: 18, max: 30 },
      defense: { min: 10, max: 18 },
      specialAttack: { min: 24, max: 36 },
    },
    rewards: {
      reputationGain: 4,
      tokensReward: 16,
    },
  },
  {
    id: 'cinder-brute',
    name: 'Cinder Brute',
    title: 'Ash-swollen breaker from the foundry outskirts',
    contract: 'Collapsed furnace tithe',
    accent: '#cf8d6a',
    image: CITY_ENEMY_ASSETS.CinderBrute,
    type: 'Juggernaut',
    statRanges: {
      hp: { min: 182, max: 250 },
      attack: { min: 22, max: 35 },
      defense: { min: 16, max: 30 },
      specialAttack: { min: 20, max: 33 },
    },
    rewards: {
      reputationGain: 6,
      tokensReward: 22,
    },
  },
  {
    id: 'brass-sentinel',
    name: 'Brass Sentinel',
    title: 'Clockwork collector armed by dead magistrates',
    contract: 'Municipal brass decree',
    accent: '#ddc283',
    image: CITY_ENEMY_ASSETS.BrassSentinel,
    type: 'Construct',
    statRanges: {
      hp: { min: 160, max: 220 },
      attack: { min: 15, max: 27 },
      defense: { min: 20, max: 30 },
      specialAttack: { min: 22, max: 34 },
    },
    rewards: {
      reputationGain: 7,
      tokensReward: 25,
    },
  },
  {
    id: 'ash-wraith',
    name: 'Ash Wraith',
    title: 'Veiled siphon haunting the broken roofs',
    contract: 'Unburied ember clause',
    accent: '#9db6d8',
    image: CITY_ENEMY_ASSETS.AshWraith,
    type: 'Specter',
    statRanges: {
      hp: { min: 132, max: 188 },
      attack: { min: 17, max: 28 },
      defense: { min: 12, max: 22 },
      specialAttack: { min: 28, max: 40 },
    },
    rewards: {
      reputationGain: 8,
      tokensReward: 28,
    },
  },
];

export const DEMON_CONTRACTS: Record<DemonContractId, DemonContract> = {
  thalassos: {
    id: 'thalassos',
    name: 'Thalassos',
    title: 'Abyssal Sovereign of the Echo Well',
    zone: 'Echo Abyss',
    theme: 'Abyss',
    accent: '#8eb4da',
    image: DEMON_ASSETS.Thalassos,
    note: 'A defensive abyss pact that stabilizes the envoy behind heavy warding and clean counters.',
    progressionLabel: 'Resonant Undertow Covenant',
    baseStats: {
      attack: 19,
      defense: 28,
      specialAttack: 18,
    },
    levelGrowth: {
      attack: 2,
      defense: 4,
      specialAttack: 2,
    },
    economyBonusTokens: 0,
    abilitiesByLevel: [
      { level: 1, abilities: ['Undertow Slash'] },
      { level: 2, abilities: ['Echo Ward', 'Undertow Slash'] },
      { level: 3, abilities: ['Echo Ward', 'Undertow Slash', 'Abyssal Break'] },
    ],
    personality: {
      favoredBehavior: 'defendCount',
      minimumReputation: 28,
      preferredRatio: 0.34,
      minimumFavoredActions: 3,
      allowUnproven: false,
      preferenceLabel: 'Favors disciplined defense and patient counterplay.',
      evaluationLabel: 'Thalassos studies how often you defend under pressure.',
      rejectionDialogue: 'You lack patience. Your mind is too shallow for my depths.',
    },
  },
  pyrrhus: {
    id: 'pyrrhus',
    name: 'Pyrrhus',
    title: 'Black-brass smith of the foundries',
    zone: 'Ashen Forge',
    theme: 'Fire',
    accent: '#d7a16e',
    image: DEMON_ASSETS.Pyrrhus,
    note: 'A fire contract built for aggression, trading restraint for crushing attack output.',
    progressionLabel: 'Broken Anvil Compact',
    baseStats: {
      attack: 31,
      defense: 14,
      specialAttack: 18,
    },
    levelGrowth: {
      attack: 4,
      defense: 1,
      specialAttack: 2,
    },
    economyBonusTokens: 0,
    abilitiesByLevel: [
      { level: 1, abilities: ['Anvil Drive'] },
      { level: 2, abilities: ['Cinder Guard', 'Anvil Drive'] },
      { level: 3, abilities: ['Cinder Guard', 'Anvil Drive', 'Foundry Crash'] },
    ],
    personality: {
      favoredBehavior: 'attackCount',
      minimumReputation: 42,
      preferredRatio: 0.36,
      minimumFavoredActions: 4,
      allowUnproven: false,
      preferenceLabel: 'Favors relentless aggression and repeated attack choices.',
      evaluationLabel: 'Pyrrhus measures how often you choose direct attacks.',
      rejectionDialogue: 'You fight like a coward. I have no pact with the weak.',
    },
  },
  maliki: {
    id: 'maliki',
    name: 'Maliki',
    title: 'Mist-mother of the grieving kilns',
    zone: 'Tileries of Sorrow',
    theme: 'Shadow',
    accent: '#b395d7',
    image: DEMON_ASSETS.Maliki,
    note: 'A shadow contract that overindexes on special pressure and strange ability spikes.',
    progressionLabel: 'Violet Shingle Covenant',
    baseStats: {
      attack: 20,
      defense: 15,
      specialAttack: 32,
    },
    levelGrowth: {
      attack: 2,
      defense: 2,
      specialAttack: 5,
    },
    economyBonusTokens: 0,
    abilitiesByLevel: [
      { level: 1, abilities: ['Kiln Whisper'] },
      { level: 2, abilities: ['Mist Screen', 'Kiln Whisper'] },
      { level: 3, abilities: ['Mist Screen', 'Kiln Whisper', 'Sorrow Bloom'] },
    ],
    personality: {
      favoredBehavior: 'abilityCount',
      minimumReputation: 34,
      preferredRatio: 0.3,
      minimumFavoredActions: 3,
      allowUnproven: false,
      preferenceLabel: 'Favors ability play and unpredictable special pressure.',
      evaluationLabel: 'Maliki watches how often you invoke pact abilities.',
      rejectionDialogue: "No fun... you don't play enough. Maliki doesn't like boring toys.",
    },
  },
  valerius: {
    id: 'valerius',
    name: 'Valerius',
    title: 'Ivory warden of hollow wealth',
    zone: 'Dome of Avarice',
    theme: 'Gold',
    accent: '#e7d39b',
    image: DEMON_ASSETS.Valerius,
    note: 'A balanced gold contract that grows evenly and squeezes extra value from every City victory.',
    progressionLabel: 'Exhausted Gold Decree',
    baseStats: {
      attack: 24,
      defense: 22,
      specialAttack: 23,
    },
    levelGrowth: {
      attack: 3,
      defense: 3,
      specialAttack: 3,
    },
    economyBonusTokens: 8,
    abilitiesByLevel: [
      { level: 1, abilities: ['Ivory Debt'] },
      { level: 2, abilities: ['Golden Bulwark', 'Ivory Debt'] },
      { level: 3, abilities: ['Golden Bulwark', 'Ivory Debt', 'Vault Rupture'] },
    ],
    personality: {
      favoredBehavior: 'tokenUsage',
      minimumReputation: 0,
      preferredRatio: 0.14,
      minimumFavoredActions: 0,
      allowUnproven: true,
      preferenceLabel: 'Favors token spending, leverage, and efficient investment.',
      evaluationLabel: 'Valerius values how often you spend tokens to create advantage.',
      rejectionDialogue: 'You hoard nothing. You are not worth investing in.',
    },
  },
};

export const DEMON_CONTRACT_ORDER: DemonContractId[] = ['pyrrhus', 'thalassos', 'maliki', 'valerius'];

export const CONTRACT_ZONE_MAP: Record<Exclude<ZoneName, 'City' | 'Pit Arena'>, DemonContractId> = {
  'Echo Abyss': 'thalassos',
  'Ashen Forge': 'pyrrhus',
  'Tileries of Sorrow': 'maliki',
  'Dome of Avarice': 'valerius',
};

export const TOKEN_BOOST_OPTIONS: TokenBoostOption[] = [
  {
    id: 'attack',
    label: 'Attack Boost',
    cost: SOUL_ACTION_COSTS.boost,
    effect: 15,
    probability: '78%',
    description: '+15 Attack on your next strike.',
  },
  {
    id: 'defense',
    label: 'Defense Boost',
    cost: SOUL_ACTION_COSTS.boost,
    effect: 10,
    probability: '84%',
    description: '+10 Defense on your next guard.',
  },
  {
    id: 'special',
    label: 'Ability Boost',
    cost: SOUL_ACTION_COSTS.boost,
    effect: 20,
    probability: '67%',
    description: '+20 Special Power on your next ability.',
  },
];

export const TOKEN_HEAL_OPTION: TokenHealOption = {
  cost: SOUL_ACTION_COSTS.heal,
  healAmount: 14,
  probability: '88%',
  description: 'Restore 14 HP to your vital hold.',
};

export const CONTRACT_LEVEL_THRESHOLDS = [0, 2, 4, 7];

export const UNKNOWN_OPPONENT_ART: ReplaceableArt = {
  ...UI_ASSETS.brand,
  alt: 'Arena ward sigil',
};

export const MAP_ZONES: ZoneVisual[] = [
  {
    id: 'Echo Abyss',
    label: 'Echo Abyss',
    sublabel: 'Contract district',
    top: '11%',
    left: '10%',
    width: '22%',
    height: '19%',
    tone: 'from-[#6786a8] via-[#5b7b96] to-[#465e73]',
    border: '#7a96b6',
    text: '#eef4fc',
    backgroundArt: ZONE_ASSETS['Echo Abyss'],
    demonArt: DEMON_ASSETS.Thalassos,
    markerArt: ZONE_ASSETS['Echo Abyss'],
  },
  {
    id: 'Ashen Forge',
    label: 'Ashen Forge',
    sublabel: 'Contract district',
    top: '12%',
    left: '66%',
    width: '22%',
    height: '18%',
    tone: 'from-[#b78654] via-[#a06f45] to-[#7f5938]',
    border: '#d3a06b',
    text: '#fff0df',
    backgroundArt: ZONE_ASSETS['Ashen Forge'],
    demonArt: DEMON_ASSETS.Pyrrhus,
    markerArt: ZONE_ASSETS['Ashen Forge'],
  },
  {
    id: 'Tileries of Sorrow',
    label: 'Tileries of Sorrow',
    sublabel: 'Contract district',
    top: '58%',
    left: '10%',
    width: '22%',
    height: '18%',
    tone: 'from-[#8a7299] via-[#756083] to-[#5f4d6e]',
    border: '#a489b8',
    text: '#faf2ff',
    backgroundArt: ZONE_ASSETS['Tileries of Sorrow'],
    demonArt: DEMON_ASSETS.Maliki,
    markerArt: ZONE_ASSETS['Tileries of Sorrow'],
  },
  {
    id: 'Dome of Avarice',
    label: 'Dome of Avarice',
    sublabel: 'Contract district',
    top: '56%',
    left: '67%',
    width: '22%',
    height: '18%',
    tone: 'from-[#d8c58d] via-[#c7b47d] to-[#a69266]',
    border: '#f0deb0',
    text: '#3a3123',
    backgroundArt: ZONE_ASSETS['Dome of Avarice'],
    demonArt: DEMON_ASSETS.Valerius,
    markerArt: ZONE_ASSETS['Dome of Avarice'],
  },
  {
    id: 'City',
    label: 'City',
    sublabel: 'Combat district',
    top: '30%',
    left: '38%',
    width: '24%',
    height: '22%',
    tone: 'from-[#a8a198] via-[#91897f] to-[#6f685f]',
    border: '#d4ccc0',
    text: '#1f1c18',
    backgroundArt: ZONE_ASSETS.City,
    demonArt: CITY_ENEMIES[0].image,
    markerArt: ZONE_ASSETS.City,
  },
  {
    id: 'Pit Arena',
    label: 'Pit Arena',
    sublabel: 'Online arena',
    top: '70%',
    left: '40%',
    width: '20%',
    height: '13%',
    tone: 'from-[#966255] via-[#7d5046] to-[#603a33]',
    border: '#be8676',
    text: '#fff0e8',
    backgroundArt: ZONE_ASSETS['Pit Arena'],
    demonArt: UNKNOWN_OPPONENT_ART,
    markerArt: ZONE_ASSETS['Pit Arena'],
  },
];

export function getContractLevel(progress: number) {
  if (progress >= CONTRACT_LEVEL_THRESHOLDS[3]) return 4;
  if (progress >= CONTRACT_LEVEL_THRESHOLDS[2]) return 3;
  if (progress >= CONTRACT_LEVEL_THRESHOLDS[1]) return 2;
  return 1;
}

export function getContractProgressPercent(progress: number) {
  const level = getContractLevel(progress);

  if (level >= CONTRACT_LEVEL_THRESHOLDS.length) {
    return 100;
  }

  const currentFloor = CONTRACT_LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextTarget = CONTRACT_LEVEL_THRESHOLDS[level] ?? currentFloor;
  const span = Math.max(1, nextTarget - currentFloor);

  return Math.min(100, Math.round(((progress - currentFloor) / span) * 100));
}

export function buildContractCombatStats(contractId: DemonContractId, level: number): CombatStats {
  const contract = DEMON_CONTRACTS[contractId];
  const levelOffset = Math.max(0, level - 1);

  return {
    hp: PLAYER_PROFILE.maxHp,
    attack: contract.baseStats.attack + contract.levelGrowth.attack * levelOffset,
    defense: contract.baseStats.defense + contract.levelGrowth.defense * levelOffset,
    specialAttack: contract.baseStats.specialAttack + contract.levelGrowth.specialAttack * levelOffset,
  };
}

export function getUnlockedAbilities(contractId: DemonContractId, level: number) {
  return DEMON_CONTRACTS[contractId].abilitiesByLevel
    .filter((entry) => entry.level <= level)
    .flatMap((entry) => entry.abilities);
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollStat(range: CombatStatRange, bonus: number) {
  return getRandomInt(range.min, range.max) + bonus;
}

function getEnemyThreat(stats: CombatStats) {
  const pressureScore =
    stats.hp + stats.attack * 2 + stats.defense * 2 + stats.specialAttack * 2;

  if (pressureScore >= 420) return 'ELITE';
  if (pressureScore >= 335) return 'BALANCED';
  return 'WEAK';
}

function getEnemyStrategyHint(stats: CombatStats) {
  if (stats.defense >= 24) {
    return 'High defense detected. Ability bursts cut through this shell fastest.';
  }

  if (stats.attack >= 30) {
    return 'Attack pressure is severe. Defend to reduce the next counterblow.';
  }

  if (stats.specialAttack >= 34) {
    return 'Special pressure is unstable. Burst quickly before the backlash stacks.';
  }

  return 'Balanced threat. Mix strikes, guard windows, and boosted abilities.';
}

export function spawnCityEnemy(contractLevel: number, reputation: number): EnemyEncounter {
  const template = CITY_ENEMIES[Math.floor(Math.random() * CITY_ENEMIES.length)];
  const levelPressure = Math.max(0, contractLevel - 1);
  const reputationPressure = Math.max(0, Math.floor(reputation / 20));

  const stats: CombatStats = {
    hp: rollStat(template.statRanges.hp, levelPressure * 16 + reputationPressure * 10),
    attack: rollStat(template.statRanges.attack, levelPressure * 3 + reputationPressure * 2),
    defense: rollStat(template.statRanges.defense, levelPressure * 2 + reputationPressure),
    specialAttack: rollStat(
      template.statRanges.specialAttack,
      levelPressure * 3 + reputationPressure * 2,
    ),
  };

  const threat = getEnemyThreat(stats);
  const strategyHint = getEnemyStrategyHint(stats);

  return {
    id: `${template.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: template.name,
    title: template.title,
    contract: `${threat} THREAT`,
    accent: template.accent,
    image: template.image,
    type: template.type ? `${threat} / ${template.type}` : threat,
    strategyHint,
    stats,
    rewards: {
      reputationGain: template.rewards.reputationGain + levelPressure + Math.floor(reputationPressure / 2),
      tokensReward: template.rewards.tokensReward + levelPressure * 2 + reputationPressure,
    },
  };
}
