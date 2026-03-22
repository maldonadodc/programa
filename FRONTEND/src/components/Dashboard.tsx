import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CombatPanel, type DamageIndicator } from './CombatPanel';
import { ContractPanel } from './ContractPanel';
import { ContractSelectionModal } from './ContractSelectionModal';
import { HealthBar } from './HealthBar';
import { Map } from './Map';
import { ResultsPanel } from './ResultsPanel';
import { useGameProgress, type ContractDecisionFeedback } from '../context/GameProgressContext';
import { useContract } from '../hooks/useContract';
import { useSceneAudio } from '../hooks/useSceneAudio';
import { AUDIO_ASSETS, UI_ASSETS } from '../lib/assets';
import {
  CONTRACT_ZONE_MAP,
  DEMON_CONTRACTS,
  MAP_ZONES,
  PLAYER_PROFILE,
  SOUL_ACTION_COSTS,
  TOKEN_BOOST_OPTIONS,
  TOKEN_HEAL_OPTION,
  spawnCityEnemy,
  type CombatRewards,
  type DemonContractId,
  type EncounterEntity,
  type EnemyEncounter,
  type TokenBoostType,
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

type CombatVisuals = {
  playerIndicator: DamageIndicator | null;
  enemyIndicator: DamageIndicator | null;
  playerHit: boolean;
  enemyHit: boolean;
};

type CombatOverlay = {
  kind: 'combat';
  enemy: EnemyEncounter;
  enemyHealth: number;
  title: string;
  subtitle: string;
  feedbackText: string;
  locked: boolean;
};

type OverlayState =
  | { kind: 'none' }
  | CombatOverlay
  | { kind: 'results'; title: string; rewards: CombatRewards; enemyName: string }
  | { kind: 'arena-disabled' };

const initialLogs: DashboardLog[] = [
  { timestamp: '23:11:02', text: 'The Ashen Nexus stirs beneath the corpse of the world.', severity: 'system' },
  { timestamp: '23:11:19', text: 'The sealed districts answer to infernal signatures.', severity: 'warning' },
  { timestamp: '23:11:42', text: 'An envoy stands ready to tune his pulse to the threshold.', severity: 'system' },
];

const DEFAULT_PLAYER_POSITION: MapPoint = { x: 50, y: 43 };
const PLAYER_MOVE_DURATION_MS = 850;
const DEFAULT_CONTRACT_MESSAGE = 'Choose one pact to unlock movement, City access, and combat.';

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

function clampHealth(next: number, max: number) {
  return Math.max(0, Math.min(next, max));
}

function getResultsTitle() {
  return 'CITY RECKONING';
}

export function Dashboard() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [loginError, setLoginError] = useState('');
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
  const [playerHealth, setPlayerHealth] = useState(PLAYER_PROFILE.maxHp);
  const [combatVisuals, setCombatVisuals] = useState<CombatVisuals>({
    playerIndicator: null,
    enemyIndicator: null,
    playerHit: false,
    enemyHit: false,
  });
  const [recoveryText, setRecoveryText] = useState('');
  const [contractModalState, setContractModalState] = useState<{
    open: boolean;
    focusId: DemonContractId | null;
    message: string;
  }>({
    open: false,
    focusId: null,
    message: DEFAULT_CONTRACT_MESSAGE,
  });
  const [unlockNotice, setUnlockNotice] = useState('');
  const [contractDecisionFeedback, setContractDecisionFeedback] = useState<ContractDecisionFeedback | null>(null);

  const { account, isConnecting, connect, clearError, walletDetected } = useContract();
  const {
    currentWalletAddress,
    syncState,
    syncMessage,
    activeContractId,
    hasChosenFirstContract,
    activeContract,
    activeContractLevel,
    activeContractStats,
    activeAbilities,
    behaviorSummary,
    contractProgress,
    contractOffers,
    tokens,
    reputation,
    queuedBoost,
    connectWalletSession,
    spendSoul,
    attemptContractSelection,
    rerollContractRequirements,
    recordCombatAction,
    primeBoost,
    consumeBoost,
    healWithTokens,
    awardCombatVictory,
    saveProgress,
  } = useGameProgress();

  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ritualTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const combatVisualTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recoveryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const victoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const combatSequenceRef = useRef(0);
  const unlockedContractsRef = useRef<string[] | null>(null);

  const playerEntity = useMemo<EncounterEntity | null>(() => {
    if (!activeContract || !activeContractStats) {
      return null;
    }

    return {
      id: PLAYER_PROFILE.id,
      name: PLAYER_PROFILE.name,
      title: `${PLAYER_PROFILE.title} / Contract Lv.${activeContractLevel}`,
      contract: activeContract.progressionLabel,
      accent: activeContract.accent,
      image: PLAYER_PROFILE.image,
      type: `${activeContract.theme} Contract`,
      stats: activeContractStats,
    };
  }, [activeContract, activeContractLevel, activeContractStats]);

  const activeContractOffer = useMemo(
    () => contractOffers.find((offer) => offer.id === activeContractId) ?? null,
    [activeContractId, contractOffers],
  );
  const contractOffersById = useMemo(
    () =>
      contractOffers.reduce((accumulator, offer) => {
        accumulator[offer.id] = offer;
        return accumulator;
      }, {} as Record<DemonContractId, (typeof contractOffers)[number]>),
    [contractOffers],
  );

  const triggerImpact = useCallback((flashDuration = 200, shakeDuration = 240) => {
    setImpactFlash(true);
    setImpactShake(true);
    setShakeDirection((previous) => (previous === 'left' ? 'right' : 'left'));

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);

    flashTimeoutRef.current = setTimeout(() => setImpactFlash(false), flashDuration);
    shakeTimeoutRef.current = setTimeout(() => setImpactShake(false), shakeDuration);
  }, []);

  const addLog = useCallback((text: string, severity: DashboardLog['severity'] = 'system') => {
    setLogs((previous) => [...previous, { timestamp: getTimestamp(), text, severity }].slice(-6));
  }, []);

  const clearMovementTimer = useCallback(() => {
    if (movementTimeoutRef.current) clearTimeout(movementTimeoutRef.current);
  }, []);

  const clearCombatVisualTimer = useCallback(() => {
    if (combatVisualTimeoutRef.current) clearTimeout(combatVisualTimeoutRef.current);
  }, []);

  const clearRecoveryInterval = useCallback(() => {
    if (recoveryIntervalRef.current) clearInterval(recoveryIntervalRef.current);
    recoveryIntervalRef.current = null;
  }, []);

  const clearRecoveryTimeout = useCallback(() => {
    if (recoveryTimeoutRef.current) clearTimeout(recoveryTimeoutRef.current);
    recoveryTimeoutRef.current = null;
  }, []);

  const clearVictoryTimeout = useCallback(() => {
    if (victoryTimeoutRef.current) clearTimeout(victoryTimeoutRef.current);
    victoryTimeoutRef.current = null;
  }, []);

  const resetCombatVisuals = useCallback(() => {
    setCombatVisuals({
      playerIndicator: null,
      enemyIndicator: null,
      playerHit: false,
      enemyHit: false,
    });
  }, []);

  const queueCombatVisuals = useCallback(
    ({
      playerIndicator,
      enemyIndicator,
      playerHit,
      enemyHit,
    }: {
      playerIndicator?: Omit<DamageIndicator, 'sequence'> | null;
      enemyIndicator?: Omit<DamageIndicator, 'sequence'> | null;
      playerHit?: boolean;
      enemyHit?: boolean;
    }) => {
      combatSequenceRef.current += 1;
      const sequence = combatSequenceRef.current;

      setCombatVisuals({
        playerIndicator: playerIndicator ? { ...playerIndicator, sequence } : null,
        enemyIndicator: enemyIndicator ? { ...enemyIndicator, sequence } : null,
        playerHit: Boolean(playerHit),
        enemyHit: Boolean(enemyHit),
      });

      clearCombatVisualTimer();
      combatVisualTimeoutRef.current = setTimeout(resetCombatVisuals, 850);
    },
    [clearCombatVisualTimer, resetCombatVisuals],
  );

  const startRecovery = useCallback(
    (fromHealth: number) => {
      clearRecoveryInterval();
      clearRecoveryTimeout();

      const maxHealth = PLAYER_PROFILE.maxHp;
      const target = Math.min(maxHealth, fromHealth + Math.ceil(maxHealth * 0.28));
      const step = Math.max(2, Math.ceil(maxHealth * 0.08));

      if (target <= fromHealth) {
        setRecoveryText('VITAL HOLD STABLE');
        recoveryTimeoutRef.current = setTimeout(() => setRecoveryText(''), 1000);
        return;
      }

      let current = fromHealth;
      setRecoveryText('AUTO-RECOVERY ENGAGED');

      recoveryIntervalRef.current = setInterval(() => {
        const nextHealth = Math.min(target, current + step);
        const healedAmount = nextHealth - current;
        current = nextHealth;
        setPlayerHealth(nextHealth);
        setRecoveryText(`RESTORING +${healedAmount} HP`);

        if (nextHealth >= target) {
          clearRecoveryInterval();
          setRecoveryText('VITAL HOLD STABILIZED');
          clearRecoveryTimeout();
          recoveryTimeoutRef.current = setTimeout(() => setRecoveryText(''), 1200);
        }
      }, 380);
    },
    [clearRecoveryInterval, clearRecoveryTimeout],
  );

  const openCityCombat = useCallback(() => {
    if (!playerEntity || !activeContract) {
      setContractModalState((current) => ({
        ...current,
        message: 'YOU MUST FORM A CONTRACT FIRST',
      }));
      addLog('YOU MUST FORM A CONTRACT FIRST.', 'fatal');
      return;
    }

    const enemy = spawnCityEnemy(activeContractLevel, reputation);
    addLog(`CITY CONTACT: ${enemy.name.toUpperCase()} BREACHES THE CENTRAL WARDS.`, 'warning');
    resetCombatVisuals();
    clearVictoryTimeout();

    setOverlay({
      kind: 'combat',
      enemy,
      enemyHealth: enemy.stats.hp,
      title: 'CITY INTERCEPTION',
      subtitle: `${enemy.name} (${enemy.contract}) challenges the ${activeContract.name} pact in the City.`,
      feedbackText:
        playerHealth <= 0
          ? 'YOU ARE TOO WEAK TO FIGHT'
          : `${activeContract.name} supplies the combat stats for this encounter. ${enemy.strategyHint ?? ''}`.trim(),
      locked: playerHealth <= 0,
    });
  }, [
    activeContract,
    activeContractLevel,
    addLog,
    clearVictoryTimeout,
    playerEntity,
    playerHealth,
    reputation,
    resetCombatVisuals,
  ]);

  const openContractArchive = useCallback(
    (focusId: DemonContractId | null = activeContractId, message = 'Review available and locked contracts.') => {
      setContractDecisionFeedback(null);
      setContractModalState({
        open: true,
        focusId,
        message,
      });
    },
    [activeContractId],
  );

  const audioScene = useMemo<'menu' | 'game' | 'combat'>(() => {
    if (screen === 'game' && overlay.kind === 'combat') return 'combat';
    if (screen === 'game') return 'game';
    return 'menu';
  }, [overlay.kind, screen]);

  useSceneAudio({
    enabled: audioEnabled,
    scene: audioScene,
    volume,
    tracks: AUDIO_ASSETS,
  });

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
      if (ritualTimeoutRef.current) clearTimeout(ritualTimeoutRef.current);
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
      clearMovementTimer();
      clearCombatVisualTimer();
      clearRecoveryInterval();
      clearRecoveryTimeout();
      clearVictoryTimeout();
    };
  }, [
    clearCombatVisualTimer,
    clearMovementTimer,
    clearRecoveryInterval,
    clearRecoveryTimeout,
    clearVictoryTimeout,
  ]);

  useEffect(() => {
    const unlockedIds = contractOffers.filter((offer) => offer.unlocked).map((offer) => offer.id);

    if (!unlockedContractsRef.current) {
      unlockedContractsRef.current = unlockedIds;
      return;
    }

    const previous = new Set(unlockedContractsRef.current);
    const newlyUnlocked = unlockedIds.filter((id) => !previous.has(id) && id !== activeContractId);

    if (newlyUnlocked.length > 0) {
      setUnlockNotice('NEW CONTRACT AVAILABLE');
      addLog(`${DEMON_CONTRACTS[newlyUnlocked[0]].name.toUpperCase()} CONTRACT NOW AVAILABLE.`, 'warning');

      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
      unlockTimeoutRef.current = setTimeout(() => setUnlockNotice(''), 2400);
    }

    unlockedContractsRef.current = unlockedIds;
  }, [activeContractId, addLog, contractOffers]);

  const handleZoneArrival = useCallback(
    (zone: ZoneName) => {
      setSelectedZone(zone);
      triggerImpact(240, 220);

      if (zone === 'City') {
        openCityCombat();
        return;
      }

      if (zone === 'Pit Arena') {
        addLog('COMING SOON - ONLINE ARENA.', 'warning');
        setOverlay({ kind: 'arena-disabled' });
        return;
      }

      const contractId = CONTRACT_ZONE_MAP[zone];
      openContractArchive(contractId, `${DEMON_CONTRACTS[contractId].name.toUpperCase()} TERMS EXPOSED.`);
      addLog(`${DEMON_CONTRACTS[contractId].name.toUpperCase()} CONTRACT REQUESTED.`, 'system');
    },
    [addLog, openCityCombat, openContractArchive, triggerImpact],
  );

  const handleMapMove = (point: MapPoint) => {
    if (overlay.kind !== 'none' || !hasChosenFirstContract || contractModalState.open) return;

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

  const handleStartRitual = async () => {
    clearError();
    setLoginError('');

    if (!walletDetected) {
      setLoginError('WALLET NOT DETECTED');
      return;
    }

    const walletAddress = await connect();
    if (!walletAddress) {
      setLoginError('WALLET CONNECTION FAILED');
      return;
    }

    const result = await connectWalletSession(walletAddress);
    if (!result.ok) {
      setLoginError(result.message);
      return;
    }

    setLoginError('');
    setAudioEnabled(true);
    setScreen('ritual');
    setPlayerHealth(PLAYER_PROFILE.maxHp);
    setContractModalState({
      open: false,
      focusId: activeContractId,
      message: DEFAULT_CONTRACT_MESSAGE,
    });
    setContractDecisionFeedback(null);
    setUnlockNotice('');
    clearRecoveryInterval();
    clearRecoveryTimeout();
    setRecoveryText('');
    resetCombatVisuals();

    if (ritualTimeoutRef.current) clearTimeout(ritualTimeoutRef.current);
    ritualTimeoutRef.current = setTimeout(() => {
      setSelectedZone('City');
      setOverlay({ kind: 'none' });
      setPlayerPosition(DEFAULT_PLAYER_POSITION);
      addLog(result.created ? 'NEW ACCOUNT ETCHED INTO THE ASHEN LEDGER.' : 'RETURNING ACCOUNT VERIFIED.', 'system');
      setScreen('game');
    }, 1600);
  };

  const handleConfirmFirstContract = async (contractId: DemonContractId) => {
    const previousContractId = activeContractId;
    const offer = contractOffersById[contractId];

    if (!offer?.unlocked) {
      return;
    }

    const result = await attemptContractSelection(contractId);
    setContractDecisionFeedback(result.feedback);

    if (!result.ok) {
      setContractModalState((current) => ({
        ...current,
        open: true,
        focusId: contractId,
        message: `${DEMON_CONTRACTS[contractId].name.toUpperCase()} REJECTS THE PACT.`,
      }));
      addLog(
        `${DEMON_CONTRACTS[contractId].name.toUpperCase()} REJECTS THE PACT. ${result.feedback.summary}`.toUpperCase(),
        'fatal',
      );
      return;
    }

    setContractModalState({
      open: false,
      focusId: contractId,
      message: DEFAULT_CONTRACT_MESSAGE,
    });
    setContractDecisionFeedback(null);
    setSelectedZone(DEMON_CONTRACTS[contractId].zone);
    addLog(
      previousContractId && previousContractId !== contractId
        ? `${DEMON_CONTRACTS[previousContractId].name.toUpperCase()} RELEASED. ${DEMON_CONTRACTS[contractId].name.toUpperCase()} BOUND.`
        : `${DEMON_CONTRACTS[contractId].name.toUpperCase()} BOUND AS THE FIRST CONTRACT.`,
      'warning',
    );
  };

  const handleRetryLockedContract = (contractId: DemonContractId) => {
    const result = rerollContractRequirements(contractId);
    setContractModalState((current) => ({
      ...current,
      focusId: contractId,
      message: `${DEMON_CONTRACTS[contractId].name.toUpperCase()} TERMS SHIFT. ${result.requirementLabel}.`,
    }));
    setContractDecisionFeedback(null);
    addLog(`${DEMON_CONTRACTS[contractId].name.toUpperCase()} TERMS RESET.`, 'warning');
  };

  const handlePrimeBoost = async (type: TokenBoostType) => {
    const result = await primeBoost(type);

    setOverlay((current) =>
      current.kind === 'combat'
        ? {
            ...current,
            feedbackText: result.message,
          }
        : current,
    );

    addLog(result.message, result.ok ? 'system' : 'warning');
  };

  const handleHeal = async () => {
    const result = await healWithTokens(playerHealth);

    if (!result.ok) {
      setOverlay((current) =>
        current.kind === 'combat'
          ? {
              ...current,
              feedbackText: result.message,
            }
          : current,
      );
      addLog(result.message, 'warning');
      return;
    }

    setPlayerHealth(result.nextHealth);
    queueCombatVisuals({
      playerIndicator: {
        amount: result.healed,
        label: `+${result.healed}`,
        tone: 'heal',
      },
    });
    setOverlay((current) =>
      current.kind === 'combat'
        ? {
            ...current,
            feedbackText: result.message,
          }
        : current,
    );
    addLog(`${result.message} TOKENS SPENT: ${TOKEN_HEAL_OPTION.cost}.`, 'system');
  };

  const handleCombatAction = async (action: CombatAction) => {
    if (overlay.kind !== 'combat' || overlay.locked || !playerEntity) return;

    if (action === 'attack' || action === 'invoke') {
      const spendResult = await spendSoul(
        action === 'attack' ? 'attack' : 'ability',
        action === 'attack' ? SOUL_ACTION_COSTS.attack : SOUL_ACTION_COSTS.ability,
      );

      if (!spendResult.ok) {
        setOverlay((current) =>
          current.kind === 'combat'
            ? {
                ...current,
                feedbackText: spendResult.message,
              }
            : current,
        );
        addLog(spendResult.message, 'warning');
        return;
      }
    }

    const boostTypeByAction: Record<CombatAction, TokenBoostType> = {
      attack: 'attack',
      defend: 'defense',
      invoke: 'special',
    };

    recordCombatAction(action);
    const boostAmount = consumeBoost(boostTypeByAction[action]);
    const playerStats = playerEntity.stats;
    const enemyStats = overlay.enemy.stats;

    let nextEnemyHealth = overlay.enemyHealth;
    let nextPlayerHealth = playerHealth;
    let feedbackText = overlay.feedbackText;
    let playerIndicator: Omit<DamageIndicator, 'sequence'> | null = null;
    let enemyIndicator: Omit<DamageIndicator, 'sequence'> | null = null;
    let playerHit = false;
    let enemyHit = false;

    if (action === 'attack') {
      const dealt = Math.max(1, playerStats.attack + boostAmount - enemyStats.defense);
      nextEnemyHealth = clampHealth(overlay.enemyHealth - dealt, enemyStats.hp);
      enemyIndicator = { amount: dealt, label: `-${dealt}`, tone: boostAmount > 0 ? 'ability' : 'damage' };
      enemyHit = true;
      feedbackText =
        boostAmount > 0
          ? `Attack Boost lands for ${dealt} damage.`
          : `${overlay.enemy.name} loses ${dealt} HP under a direct strike.`;

      if (nextEnemyHealth > 0) {
        const retaliation = Math.max(1, enemyStats.attack - playerStats.defense);
        nextPlayerHealth = clampHealth(playerHealth - retaliation, playerStats.hp);
        playerIndicator = { amount: retaliation, label: `-${retaliation}`, tone: 'damage' };
        playerHit = true;
        feedbackText = `${feedbackText} The counterblow hits for ${retaliation}.`;
      }
    }

    if (action === 'defend') {
      const fortifiedDefense = playerStats.defense + boostAmount;
      const reducedDamage = Math.max(0, enemyStats.attack - fortifiedDefense);
      nextPlayerHealth = clampHealth(playerHealth - reducedDamage, playerStats.hp);
      playerIndicator = {
        amount: reducedDamage,
        label: reducedDamage === 0 ? 'BLOCK' : `-${reducedDamage}`,
        tone: 'guard',
      };
      playerHit = reducedDamage > 0;
      feedbackText =
        boostAmount > 0
          ? `Defense Boost raises defense to ${fortifiedDefense}, limiting damage to ${reducedDamage}.`
          : `Defense holds, cutting the incoming damage to ${reducedDamage}.`;
    }

    if (action === 'invoke') {
      const dealt = Math.max(1, playerStats.specialAttack + boostAmount - Math.floor(enemyStats.defense / 2));
      nextEnemyHealth = clampHealth(overlay.enemyHealth - dealt, enemyStats.hp);
      enemyIndicator = { amount: dealt, label: `-${dealt}`, tone: 'ability' };
      enemyHit = true;
      feedbackText =
        boostAmount > 0
          ? `Ability Boost detonates for ${dealt} special damage.`
          : `${activeContract?.name ?? 'The contract'} surges through the envoy for ${dealt} ability damage.`;

      if (nextEnemyHealth > 0) {
        const retaliation = Math.max(1, enemyStats.specialAttack - Math.floor(playerStats.defense / 2));
        nextPlayerHealth = clampHealth(playerHealth - retaliation, playerStats.hp);
        playerIndicator = { amount: retaliation, label: `-${retaliation}`, tone: 'damage' };
        playerHit = true;
        feedbackText = `${feedbackText} The backlash lands for ${retaliation}.`;
      }
    }

    const playerDefeated = nextPlayerHealth <= 0;
    const enemyDefeated = nextEnemyHealth <= 0;

    setPlayerHealth(nextPlayerHealth);
    queueCombatVisuals({
      playerIndicator,
      enemyIndicator,
      playerHit,
      enemyHit,
    });

    const nextOverlay: CombatOverlay = {
      ...overlay,
      enemyHealth: nextEnemyHealth,
      feedbackText: playerDefeated
        ? 'YOU ARE TOO WEAK TO FIGHT'
        : enemyDefeated
          ? `${overlay.enemy.name} falls. Contract progression increases.`
          : feedbackText,
      locked: playerDefeated || enemyDefeated,
    };

    setOverlay(nextOverlay);
    triggerImpact(action === 'defend' ? 180 : 240, action === 'defend' ? 180 : 240);

    if (playerDefeated) {
      addLog('THE ENVOY HAS COLLAPSED. CITY COMBAT HALTED.', 'fatal');
      return;
    }

    if (enemyDefeated) {
      const victory = awardCombatVictory(overlay.enemy.rewards);
      startRecovery(nextPlayerHealth);

      if (victory) {
        addLog(
          `${(activeContract?.name ?? 'CONTRACT').toUpperCase()} CLAIMS +${victory.awardedTokens} TOKENS AND +${victory.reputationGain} REPUTATION.`,
          'system',
        );

        if (victory.leveledUp) {
          addLog(
            `${(activeContract?.name ?? 'CONTRACT').toUpperCase()} ADVANCED TO LEVEL ${victory.nextLevel}.`,
            'warning',
          );
        }
      }

      clearVictoryTimeout();
      victoryTimeoutRef.current = setTimeout(() => {
        setOverlay({
          kind: 'results',
          title: getResultsTitle(),
          rewards: {
            reputationGain: victory?.reputationGain ?? overlay.enemy.rewards.reputationGain,
            tokensReward: victory?.awardedTokens ?? overlay.enemy.rewards.tokensReward,
          },
          enemyName: overlay.enemy.name,
        });
      }, 720);
    }
  };

  const handleCloseOverlay = () => {
    clearVictoryTimeout();
    clearCombatVisualTimer();
    resetCombatVisuals();
    setOverlay({ kind: 'none' });
  };

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    setVolumeHot(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => setVolumeHot(false), 320);
  };

  const latestLogs = logs.slice(-3).reverse();
  const backButtonClassName = 'back-button';
  const menuButtonClassName = 'menu-button';

  const renderMenuScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-[900px] px-6 py-8 sm:px-8 sm:py-9">
        <div className="relative z-10 text-center">
          <div className="mx-auto flex w-full max-w-[18rem] justify-center sm:max-w-[20rem]">
            <img
              src={UI_ASSETS.brand.src}
              alt={UI_ASSETS.brand.alt}
              className="h-auto w-full object-contain"
            />
          </div>
          <p className="type-block text-[10px] text-[#7d6b57]">corpse of reality</p>
          <h1 className="title-engrave mt-4 text-3xl uppercase sm:text-5xl">ASHBOUND</h1>
          <p className="mx-auto mt-4 max-w-xl text-xs uppercase tracking-[0.24em] text-[#a7967b] sm:text-sm">
            Contracts, tokens, and City combat
          </p>
          <div className="iron-divider mx-auto mt-5 h-px w-40" />
          <p className="mx-auto mt-5 max-w-xl text-[11px] uppercase tracking-[0.2em] text-[#8e7d66] sm:text-xs sm:tracking-[0.24em]">
            Progress is now driven by demon contracts, wallet identity, and simulated `$SOUL` spending.
          </p>
        </div>

        <div className="relative z-10 mt-8 grid gap-3">
          <button onClick={() => setScreen('login')} className={menuButtonClassName}>PLAY</button>
          <button onClick={() => setScreen('instructions')} className={menuButtonClassName}>INSTRUCTIONS</button>
          <button onClick={() => setScreen('config')} className={menuButtonClassName}>SETTINGS</button>
        </div>
      </div>
    </section>
  );

  const renderLoginScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-[900px] p-6 sm:p-7">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div>
            <p className="type-block text-[10px] text-[#7d6b57]">ritual synchrony chamber</p>
            <h2 className="title-engrave mt-4 text-2xl uppercase sm:text-3xl">ASHBOUND ACCESS</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#baa88f]">
              Connect MetaMask to use your wallet address as identity. The backend creates or fetches your envoy and keeps `$SOUL`, reputation, behavior stats, and contract state in sync.
            </p>

            <div className="mt-6 space-y-4">
              <div className="ritual-field px-4 py-4">
                <p className="type-block text-[11px] text-[#9c8b72]">wallet status</p>
                <p className="mt-3 break-all text-sm uppercase tracking-[0.18em] text-[#e0d2b8]">
                  {account ?? 'NO WALLET CONNECTED'}
                </p>
              </div>

              {loginError && (
                <div className="rounded-sm border border-[#7b4b3b] bg-[#1a110f]/90 px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#efbba2]">
                  {loginError}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={handleStartRitual} className="menu-button ritual-glitch text-center">
                  {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
                </button>
                <button type="button" onClick={() => setScreen('menu')} className={backButtonClassName}>
                  BACK TO MENU
                </button>
              </div>
            </div>
          </div>

          <aside className="parchment-card relative overflow-hidden border border-[#45372d] px-4 py-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(123,47,38,0.14),transparent_38%),repeating-linear-gradient(180deg,rgba(205,189,162,0.016)_0_1px,transparent_1px_4px)] opacity-80" />
            <div className="relative z-10">
              <div className="mb-5 flex justify-center border-b border-[#43342b] pb-5">
                <img
                  src={UI_ASSETS.brand.src}
                  alt={UI_ASSETS.brand.alt}
                  className="h-16 w-auto max-w-full object-contain opacity-90"
                />
              </div>
              <p className="type-block text-[10px] text-[#7d6b57]">access liturgy</p>
              <div className="iron-divider mt-4 h-px w-full" />
              <div className="mt-5 space-y-4 text-xs uppercase tracking-[0.2em] text-[#cdbda2]">
                <p>1. Click CONNECT WALLET to request MetaMask access with `eth_requestAccounts`.</p>
                <p>2. The wallet address becomes your identity and the backend creates or fetches the user.</p>
                <p>3. Attacks, abilities, contract attempts, boosts, and healing spend simulated `$SOUL` through API x402.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );

  const renderRitualScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel ritual-fade w-full max-w-[760px] px-6 py-10 sm:px-8">
        <div className="relative z-10 text-center">
          <p className="type-block text-[10px] text-[#7d6b57]">threshold attunement</p>
          <div className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#4a382d] bg-[#140f0e]/85 shadow-[inset_0_0_0_1px_rgba(205,189,162,0.05),0_16px_30px_rgba(0,0,0,0.32)]">
            <img
              src={UI_ASSETS.brand.src}
              alt={UI_ASSETS.brand.alt}
              className="ritual-glyph h-12 w-12 object-contain opacity-90"
            />
          </div>
          <h2 className="ritual-glitch mt-7 text-xl uppercase tracking-[0.2em] text-[#e0d2b8] sm:text-2xl">
            TUNING INTO THE ASHEN NEXUS...
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-xs uppercase tracking-[0.24em] text-[#98866d]">
            Progress is loading into the ashbound ledger.
          </p>
        </div>
      </div>
    </section>
  );

  const renderArenaDisabledOverlay = () => (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(8,6,6,0.68)] p-4 backdrop-blur-[2px]">
      <section className="panel w-full max-w-[720px] px-4 py-4 text-center sm:px-5 sm:py-5">
        <div className="relative z-10">
          <p className="type-block text-[10px] text-[#7d6b57]">pit arena</p>
          <h2 className="mt-3 text-2xl uppercase tracking-[0.12em] text-[#e0d2b8] sm:text-3xl">COMING SOON - ONLINE ARENA</h2>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#baa88f]">
            The arena is still sealed. City combat and contract progression remain active.
          </p>
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={handleCloseOverlay} className="menu-button text-center">
              RETURN TO MAP
            </button>
          </div>
        </div>
      </section>
    </div>
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
          interactionLocked={overlay.kind !== 'none' || !hasChosenFirstContract || contractModalState.open}
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_20%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.16),transparent_34%)]" />

        <div className="absolute left-3 top-3 z-20 w-[16rem] max-w-[calc(100%-1.5rem)] space-y-3 sm:left-4 sm:top-4 sm:w-[17rem]">
          <div className="panel px-4 py-4">
            <div className="relative z-10">
              <p className="type-block text-[10px] text-[#7d6b57]">ashbound ledger</p>
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={UI_ASSETS.brand.src}
                  alt={UI_ASSETS.brand.alt}
                  className="h-12 w-12 object-contain"
                />
                <h2 className="text-2xl uppercase tracking-[0.14em] text-[#e0d2b8]">ASHBOUND</h2>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#ab9a7e]">
                Visible district: {selectedZone}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#cdbda2]">
                Wallet: {currentWalletAddress ?? 'unbound'}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#b49f80]">
                Sync: {syncState === 'saving' ? syncMessage : syncMessage || 'IDLE'}
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

        {unlockNotice && (
          <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2">
            <div className="panel px-5 py-3">
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.28em] text-[#e4c39c]">{unlockNotice}</p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute right-3 top-3 z-20 w-[16rem] max-w-[calc(100%-1.5rem)] sm:right-4 sm:top-4 sm:w-[17rem]">
          <HealthBar
            current={playerHealth}
            max={playerEntity?.stats.hp ?? PLAYER_PROFILE.maxHp}
            statusText={playerHealth <= 0 ? 'YOU ARE TOO WEAK TO FIGHT' : recoveryText}
            isRecovering={Boolean(recoveryText) && playerHealth > 0}
          />
        </div>

        <div className="absolute bottom-3 left-3 z-20 w-[15rem] max-w-[calc(100%-1.5rem)] sm:bottom-4 sm:left-4 sm:w-[16rem]">
          <div className="panel px-4 py-4">
            <div className="relative z-10">
              <p className="type-block text-[10px] text-[#7d6b57]">$SOUL ledger</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-3xl uppercase tracking-[0.12em] text-[#e0d2b8]">{tokens}</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#b49f80]">$SOUL balance</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#43342b] pt-4 text-[11px] uppercase tracking-[0.2em] text-[#cdbda2]">
                <span>Reputation</span>
                <span className="text-[#e4c39c]">{reputation}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 right-3 z-20 w-[18rem] max-w-[calc(100%-1.5rem)] sm:bottom-4 sm:right-4 sm:w-[20rem]">
          <ContractPanel
            contract={activeContract}
            level={activeContractLevel}
            stats={playerEntity?.stats ?? null}
            progress={activeContractId ? contractProgress[activeContractId] : 0}
            progressPercent={activeContractOffer?.progressPercent ?? 0}
            abilities={activeAbilities}
            onManageContracts={() =>
              openContractArchive(activeContractId, hasChosenFirstContract ? 'Review available and locked contracts.' : DEFAULT_CONTRACT_MESSAGE)
            }
            onSave={() => void saveProgress()}
          />
        </div>

        {overlay.kind === 'combat' && playerEntity && (
          <CombatPanel
            player={playerEntity}
            playerHealth={playerHealth}
            enemy={overlay.enemy}
            enemyHealth={overlay.enemyHealth}
            title={overlay.title}
            subtitle={overlay.subtitle}
            feedbackText={overlay.feedbackText}
            onAction={handleCombatAction}
            onClose={handleCloseOverlay}
            onPrimeBoost={handlePrimeBoost}
            onHeal={handleHeal}
            tokens={tokens}
            activeBoost={queuedBoost}
            boostOptions={TOKEN_BOOST_OPTIONS}
            healOption={TOKEN_HEAL_OPTION}
            damageIndicators={{
              player: combatVisuals.playerIndicator,
              enemy: combatVisuals.enemyIndicator,
            }}
            hitStates={{
              player: combatVisuals.playerHit,
              enemy: combatVisuals.enemyHit,
            }}
            actionsDisabled={overlay.locked || playerHealth <= 0}
          />
        )}

        {overlay.kind === 'results' && (
          <ResultsPanel
            title={overlay.title}
            remanent={`+${overlay.rewards.tokensReward}`}
            reputation={`+${overlay.rewards.reputationGain}`}
            enemyName={overlay.enemyName}
            onClose={handleCloseOverlay}
          />
        )}

        {overlay.kind === 'arena-disabled' && renderArenaDisabledOverlay()}

        {(!hasChosenFirstContract || contractModalState.open) && (
          <ContractSelectionModal
            offers={contractOffers}
            activeContractId={activeContractId}
            focusedContractId={contractModalState.focusId}
            mandatory={!hasChosenFirstContract}
            message={contractModalState.message}
            reputation={reputation}
            behaviorSummary={behaviorSummary}
            decisionFeedback={contractDecisionFeedback}
            onSelect={handleConfirmFirstContract}
            onRetryLocked={handleRetryLockedContract}
            onBack={() => {
              if (!hasChosenFirstContract) {
                setContractDecisionFeedback(null);
                setScreen('menu');
                return;
              }

              setContractDecisionFeedback(null);
              setContractModalState({
                open: false,
                focusId: activeContractId,
                message: DEFAULT_CONTRACT_MESSAGE,
              });
            }}
            onClose={() => {
              setContractDecisionFeedback(null);
              setContractModalState({
                open: false,
                focusId: activeContractId,
                message: DEFAULT_CONTRACT_MESSAGE,
              });
            }}
          />
        )}
      </div>
    </section>
  );

  const renderInstructionsScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-[900px] p-6 sm:p-7">
        <div className="relative z-10 space-y-5">
          <div className="max-w-2xl">
            <p className="type-block text-[10px] text-[#7d6b57]">book of the envoy</p>
            <h2 className="mt-3 text-2xl uppercase tracking-[0.12em] text-[#ddd0b7] sm:text-3xl">INSTRUCTIONS</h2>
            <p className="mt-4 text-sm leading-7 text-[#bfae94]">
              You are the Ashbound Envoy, a debt collector moving through the corpse of reality to form demon contracts and enforce the ledger.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="parchment-card border border-[#45372d] px-4 py-4">
              <p className="type-block text-[10px] text-[#7d6b57]">Your Role</p>
              <ul className="mt-3 space-y-2 text-xs uppercase tracking-[0.18em] leading-6 text-[#cfbea3]">
                <li>You are an Envoy, the debt collector bound to the Ashbound ledger.</li>
                <li>You must form a contract before you can fight or advance.</li>
                <li>The named demons are not enemies. They are the contracts that empower you.</li>
              </ul>
            </div>

            <div className="parchment-card border border-[#45372d] px-4 py-4">
              <p className="type-block text-[10px] text-[#7d6b57]">Combat Flow</p>
              <ul className="mt-3 space-y-2 text-xs uppercase tracking-[0.18em] leading-6 text-[#cfbea3]">
                <li>Combat only happens in the City.</li>
                <li>Your active contract defines your attack, defense, and special power.</li>
                <li>Different contracts unlock different abilities and progression paths.</li>
              </ul>
            </div>

            <div className="parchment-card border border-[#45372d] px-4 py-4">
              <p className="type-block text-[10px] text-[#7d6b57]">Tokens And Reputation</p>
              <ul className="mt-3 space-y-2 text-xs uppercase tracking-[0.18em] leading-6 text-[#cfbea3]">
                <li>`$SOUL` can boost attack, boost defense, empower abilities, or restore health.</li>
                <li>Reputation rises through City combat victories.</li>
                <li>More reputation unlocks new contract options.</li>
              </ul>
            </div>

            <div className="parchment-card border border-[#45372d] px-4 py-4">
              <p className="type-block text-[10px] text-[#7d6b57]">Arena Status</p>
              <ul className="mt-3 space-y-2 text-xs uppercase tracking-[0.18em] leading-6 text-[#cfbea3]">
                <li>The Arena is currently unavailable.</li>
                <li>When you enter it, the game will show COMING SOON.</li>
                <li>Until then, the City is the core progression loop.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-start">
            <button onClick={() => setScreen('menu')} className={backButtonClassName}>BACK TO MENU</button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderConfigScreen = () => (
    <section className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-[900px] p-6 sm:p-7">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="type-block text-[10px] text-[#7d6b57]">nexus adjustments</p>
            <h2 className="mt-3 text-2xl uppercase tracking-[0.12em] text-[#ddd0b7] sm:text-3xl">SETTINGS</h2>
            <p className="mt-4 text-sm leading-7 text-[#bfae94]">
              Tune the resonance of iron, ash, and liturgical echo. Progress now syncs through the wallet-backed FastAPI ledger.
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
                Wallet: {currentWalletAddress ?? 'none'}
              </div>
              <div className="parchment-card border border-[#45372d] px-4 py-3">
                Active contract: {activeContract?.name ?? 'none'}
              </div>
              <div className="parchment-card border border-[#45372d] px-4 py-3">
                Sync state: {syncState}
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
