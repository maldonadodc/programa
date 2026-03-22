import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  connectWalletPlayer,
  processSoulTransaction,
  savePlayer,
  type ApiContractHistoryEntry,
  type ApiPlayer,
} from '../lib/api';
import {
  type BehaviorMetricType,
  DEMON_CONTRACTS,
  DEMON_CONTRACT_ORDER,
  PLAYER_PROFILE,
  SOUL_ACTION_COSTS,
  TOKEN_BOOST_OPTIONS,
  TOKEN_HEAL_OPTION,
  buildContractCombatStats,
  getContractLevel,
  getContractProgressPercent,
  getUnlockedAbilities,
  type CombatRewards,
  type CombatStats,
  type DemonContractId,
  type PlayerBehaviorStats,
  type TokenBoostType,
} from '../lib/worldData';

type ContractRequirementType = 'reputation' | 'battlesWon' | BehaviorMetricType;
type CombatActionMetric = 'attack' | 'defend' | 'invoke';
type SyncState = 'idle' | 'saving' | 'saved' | 'error';
type SoulSpendAction = 'attack' | 'ability' | 'contract_attempt' | 'boost' | 'heal';

type StoredRequirement = {
  type: ContractRequirementType;
  required: number;
};

type StoredContractHistoryEntry = ApiContractHistoryEntry & {
  contractId: DemonContractId;
};

type StoredProgress = {
  activeContractId: DemonContractId | null;
  contractProgress: Record<DemonContractId, number>;
  contractRequirements: Record<DemonContractId, StoredRequirement[]>;
  metrics: PlayerBehaviorStats;
  contractHistory: StoredContractHistoryEntry[];
  tokens: number;
  reputation: number;
  queuedBoost: TokenBoostType | null;
};

export type ContractOfferRequirement = StoredRequirement & {
  label: string;
  current: number;
  satisfied: boolean;
};

export type ContractOfferState = {
  id: DemonContractId;
  contract: (typeof DEMON_CONTRACTS)[DemonContractId];
  level: number;
  progress: number;
  progressPercent: number;
  stats: CombatStats;
  abilities: string[];
  isActive: boolean;
  unlocked: boolean;
  primaryRequirementLabel: string;
  requirements: ContractOfferRequirement[];
};

export type ContractDecisionFeedback = {
  contractId: DemonContractId;
  accepted: boolean;
  dialogue: string;
  summary: string;
  dominantBehavior: BehaviorMetricType | 'unproven';
  favoredBehavior: BehaviorMetricType;
};

type BoostResult = {
  ok: boolean;
  message: string;
};

type HealResult = {
  ok: boolean;
  healed: number;
  nextHealth: number;
  message: string;
};

type VictoryResult = {
  awardedTokens: number;
  reputationGain: number;
  previousLevel: number;
  nextLevel: number;
  leveledUp: boolean;
};

type RequirementResetResult = {
  requirementLabel: string;
};

type LoginResult = {
  ok: boolean;
  message: string;
  created: boolean;
};

type SpendSoulResult = {
  ok: boolean;
  message: string;
  balanceRemaining: number | null;
  transactionId: string | null;
  log: string;
};

type ContractAttemptResult = {
  ok: boolean;
  feedback: ContractDecisionFeedback;
};

type GameProgressContextValue = {
  currentWalletAddress: string | null;
  isAuthenticated: boolean;
  syncState: SyncState;
  syncMessage: string;
  activeContractId: DemonContractId | null;
  hasChosenFirstContract: boolean;
  activeContract: (typeof DEMON_CONTRACTS)[DemonContractId] | null;
  activeContractLevel: number;
  activeContractStats: ReturnType<typeof buildContractCombatStats> | null;
  activeAbilities: string[];
  behaviorSummary: PlayerBehaviorStats;
  contractHistory: StoredContractHistoryEntry[];
  contractProgress: Record<DemonContractId, number>;
  contractOffers: ContractOfferState[];
  tokens: number;
  reputation: number;
  queuedBoost: TokenBoostType | null;
  connectWalletSession: (walletAddress: string) => Promise<LoginResult>;
  spendSoul: (action: SoulSpendAction, amount?: number) => Promise<SpendSoulResult>;
  attemptContractSelection: (id: DemonContractId) => Promise<ContractAttemptResult>;
  rerollContractRequirements: (id: DemonContractId) => RequirementResetResult;
  recordCombatAction: (action: CombatActionMetric) => void;
  primeBoost: (type: TokenBoostType) => Promise<BoostResult>;
  consumeBoost: (type: TokenBoostType) => number;
  healWithTokens: (currentHealth: number) => Promise<HealResult>;
  awardCombatVictory: (rewards: CombatRewards) => VictoryResult | null;
  saveProgress: () => Promise<void>;
};

const STORAGE_KEY = 'ashbound-progress-v4';
const INITIAL_TOKENS = 120;
const INITIAL_REPUTATION = 0;
const INITIAL_CONTRACT_REQUIREMENT_LABEL = 'INITIAL CONTRACT – NO REQUIREMENTS';

const GameProgressContext = createContext<GameProgressContextValue | null>(null);

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createEmptyContractProgress() {
  return DEMON_CONTRACT_ORDER.reduce((accumulator, id) => {
    accumulator[id] = 0;
    return accumulator;
  }, {} as Record<DemonContractId, number>);
}

function createEmptyMetrics(): PlayerBehaviorStats {
  return {
    battlesWon: 0,
    attackCount: 0,
    defendCount: 0,
    abilityCount: 0,
    tokenUsage: 0,
  };
}

function buildRequirementsForContract(id: DemonContractId): StoredRequirement[] {
  switch (id) {
    case 'pyrrhus':
      return [
        { type: 'reputation', required: getRandomInt(44, 60) },
        { type: 'attackCount', required: getRandomInt(4, 8) },
        { type: 'battlesWon', required: getRandomInt(2, 4) },
      ];
    case 'thalassos':
      return [
        { type: 'reputation', required: getRandomInt(28, 42) },
        { type: 'defendCount', required: getRandomInt(4, 8) },
      ];
    case 'maliki':
      return [
        { type: 'reputation', required: getRandomInt(34, 50) },
        { type: 'abilityCount', required: getRandomInt(4, 8) },
      ];
    case 'valerius':
      return [
        { type: 'reputation', required: getRandomInt(0, 12) },
        { type: 'tokenUsage', required: getRandomInt(0, 1) },
      ];
  }

  return [];
}

function createContractRequirements() {
  return DEMON_CONTRACT_ORDER.reduce((accumulator, id) => {
    accumulator[id] = buildRequirementsForContract(id);
    return accumulator;
  }, {} as Record<DemonContractId, StoredRequirement[]>);
}

function getDefaultProgress(): StoredProgress {
  return {
    activeContractId: null,
    contractProgress: createEmptyContractProgress(),
    contractRequirements: createContractRequirements(),
    metrics: createEmptyMetrics(),
    contractHistory: [],
    tokens: INITIAL_TOKENS,
    reputation: INITIAL_REPUTATION,
    queuedBoost: null,
  };
}

function normalizeRequirement(input: unknown): StoredRequirement | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const candidate = input as { type?: string; required?: number };
  const normalizedType =
    candidate.type === 'abilityUses'
      ? 'abilityCount'
      : candidate.type === 'defensivePlays'
        ? 'defendCount'
        : candidate.type;

  if (
    normalizedType !== 'reputation' &&
    normalizedType !== 'battlesWon' &&
    normalizedType !== 'attackCount' &&
    normalizedType !== 'defendCount' &&
    normalizedType !== 'abilityCount' &&
    normalizedType !== 'tokenUsage'
  ) {
    return null;
  }

  if (typeof candidate.required !== 'number' || candidate.required < 0) {
    return null;
  }

  return {
    type: normalizedType,
    required: Math.round(candidate.required),
  };
}

function sanitizeStoredProgress(input: Partial<StoredProgress> | null | undefined): StoredProgress {
  const defaults = getDefaultProgress();
  if (!input) {
    return defaults;
  }
 
  const activeContractId =
    input.activeContractId && input.activeContractId in DEMON_CONTRACTS ? input.activeContractId : null;

  const contractProgress = { ...defaults.contractProgress };
  if (input.contractProgress && typeof input.contractProgress === 'object') {
    for (const id of DEMON_CONTRACT_ORDER) {
      const value = input.contractProgress[id];
      contractProgress[id] = typeof value === 'number' && value >= 0 ? value : 0;
    }
  }

  const contractRequirements = createContractRequirements();
  if (input.contractRequirements && typeof input.contractRequirements === 'object') {
    for (const id of DEMON_CONTRACT_ORDER) {
      const rawRequirements = input.contractRequirements[id];
      if (!Array.isArray(rawRequirements)) {
        continue;
      }

      const parsed = rawRequirements
        .map((entry) => normalizeRequirement(entry))
        .filter((entry): entry is StoredRequirement => entry !== null);

      if (parsed.length > 0) {
        contractRequirements[id] = parsed;
      }
    }
  }

  const metrics = createEmptyMetrics();
  if (input.metrics && typeof input.metrics === 'object') {
    metrics.battlesWon = typeof input.metrics.battlesWon === 'number' && input.metrics.battlesWon >= 0 ? input.metrics.battlesWon : 0;
    metrics.attackCount =
      typeof input.metrics.attackCount === 'number' && input.metrics.attackCount >= 0
        ? input.metrics.attackCount
        : 0;
    metrics.defendCount =
      typeof input.metrics.defendCount === 'number' && input.metrics.defendCount >= 0
        ? input.metrics.defendCount
        : typeof (input.metrics as { defensivePlays?: number }).defensivePlays === 'number' &&
            (input.metrics as { defensivePlays?: number }).defensivePlays! >= 0
          ? (input.metrics as { defensivePlays?: number }).defensivePlays!
          : 0;
    metrics.abilityCount =
      typeof input.metrics.abilityCount === 'number' && input.metrics.abilityCount >= 0
        ? input.metrics.abilityCount
        : typeof (input.metrics as { abilityUses?: number }).abilityUses === 'number' &&
            (input.metrics as { abilityUses?: number }).abilityUses! >= 0
          ? (input.metrics as { abilityUses?: number }).abilityUses!
          : 0;
    metrics.tokenUsage =
      typeof input.metrics.tokenUsage === 'number' && input.metrics.tokenUsage >= 0 ? input.metrics.tokenUsage : 0;
  }

  const contractHistory = Array.isArray(input.contractHistory)
    ? input.contractHistory
        .filter(
          (entry): entry is StoredContractHistoryEntry =>
            Boolean(
              entry &&
                typeof entry === 'object' &&
                entry.contractId &&
                entry.contractId in DEMON_CONTRACTS &&
                (entry.outcome === 'accepted' || entry.outcome === 'rejected'),
            ),
        )
        .map((entry): StoredContractHistoryEntry => {
          const dominantBehavior: StoredContractHistoryEntry['dominantBehavior'] =
            entry.dominantBehavior === 'attackCount' ||
            entry.dominantBehavior === 'defendCount' ||
            entry.dominantBehavior === 'abilityCount' ||
            entry.dominantBehavior === 'tokenUsage'
              ? entry.dominantBehavior
              : 'unproven';

          return {
            contractId: entry.contractId as DemonContractId,
            outcome: entry.outcome,
            reason: entry.reason,
            reputation: typeof entry.reputation === 'number' ? Math.max(0, entry.reputation) : 0,
            dominantBehavior,
            timestamp: entry.timestamp,
          };
        })
    : defaults.contractHistory;

  return {
    activeContractId,
    contractProgress,
    contractRequirements,
    metrics,
    contractHistory,
    tokens: typeof input.tokens === 'number' && input.tokens >= 0 ? input.tokens : defaults.tokens,
    reputation: typeof input.reputation === 'number' && input.reputation >= 0 ? input.reputation : defaults.reputation,
    queuedBoost:
      input.queuedBoost === 'attack' || input.queuedBoost === 'defense' || input.queuedBoost === 'special'
        ? input.queuedBoost
        : null,
  };
}

function buildProgressFromApiPlayer(player: ApiPlayer): StoredProgress {
  return sanitizeStoredProgress({
    activeContractId:
      player.contract && player.contract in DEMON_CONTRACTS ? (player.contract as DemonContractId) : null,
    contractProgress: player.contractProgress as Record<DemonContractId, number>,
    contractRequirements: player.contractRequirements as Record<DemonContractId, StoredRequirement[]>,
    metrics: player.metrics,
    contractHistory: player.contractHistory as StoredContractHistoryEntry[],
    tokens: player.tokens,
    reputation: player.reputation,
    queuedBoost: null,
  });
}

function getMetricValue(progress: StoredProgress, type: ContractRequirementType) {
  if (type === 'reputation') return progress.reputation;
  if (type === 'battlesWon') return progress.metrics.battlesWon;
  return progress.metrics[type];
}

function getRequirementLabel(type: ContractRequirementType, required: number) {
  if (type === 'reputation') return `Reach ${required} reputation`;
  if (type === 'battlesWon') return `Win ${required} battles`;
  if (type === 'attackCount') return `Attack ${required} times`;
  if (type === 'defendCount') return `Defend ${required} times`;
  if (type === 'abilityCount') return `Use ability ${required} times`;
  return `Spend $SOUL ${required} times`;
}

function getPrimaryRequirementLabel(requirements: StoredRequirement[]) {
  const reputationRequirement = requirements.find((entry) => entry.type === 'reputation') ?? requirements[0];
  return `REQUIRES: ${reputationRequirement.required} ${reputationRequirement.type === 'reputation' ? 'REPUTATION' : reputationRequirement.type.toUpperCase()}`;
}

function getDominantBehavior(metrics: PlayerBehaviorStats) {
  const entries: Array<[BehaviorMetricType, number]> = [
    ['attackCount', metrics.attackCount],
    ['defendCount', metrics.defendCount],
    ['abilityCount', metrics.abilityCount],
    ['tokenUsage', metrics.tokenUsage],
  ];

  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) {
    return 'unproven' as const;
  }

  return entries.reduce((best, entry) => (entry[1] > best[1] ? entry : best))[0];
}

function getBehaviorLabel(metric: BehaviorMetricType | 'unproven') {
  if (metric === 'attackCount') return 'attacks';
  if (metric === 'defendCount') return 'defensive plays';
  if (metric === 'abilityCount') return 'ability use';
  if (metric === 'tokenUsage') return '$SOUL spending';
  return 'an unproven record';
}

function evaluateContractAttempt(progress: StoredProgress, contractId: DemonContractId): ContractDecisionFeedback {
  const contract = DEMON_CONTRACTS[contractId];
  const favoredBehavior = contract.personality.favoredBehavior;
  const dominantBehavior = getDominantBehavior(progress.metrics);
  const totalBehavior =
    progress.metrics.attackCount +
    progress.metrics.defendCount +
    progress.metrics.abilityCount +
    progress.metrics.tokenUsage;
  const favoredCount = progress.metrics[favoredBehavior];
  const favoredRatio = totalBehavior > 0 ? favoredCount / totalBehavior : 0;
  const hasReputation = progress.reputation >= contract.personality.minimumReputation;
  const hasFavoredCount = favoredCount >= contract.personality.minimumFavoredActions;
  const satisfiesRatio =
    (totalBehavior === 0 && contract.personality.allowUnproven) || favoredRatio >= contract.personality.preferredRatio;
  const accepted = hasReputation && hasFavoredCount && satisfiesRatio;

  const reasons: string[] = [];
  if (!hasReputation) {
    reasons.push(`Requires ${contract.personality.minimumReputation} reputation.`);
  }
  if (!hasFavoredCount) {
    reasons.push(
      `Needs ${contract.personality.minimumFavoredActions} actions aligned with ${getBehaviorLabel(favoredBehavior)}.`,
    );
  }
  if (!satisfiesRatio && dominantBehavior !== 'unproven') {
    reasons.push(
      `Your history leans toward ${getBehaviorLabel(dominantBehavior)} instead of ${getBehaviorLabel(favoredBehavior)}.`,
    );
  }
  if (!satisfiesRatio && dominantBehavior === 'unproven') {
    reasons.push(`No meaningful ${getBehaviorLabel(favoredBehavior)} history has been proven yet.`);
  }

  return {
    contractId,
    accepted,
    dialogue: accepted
      ? `${contract.name} accepts your pattern and binds the ledger.`
      : contract.personality.rejectionDialogue,
    summary: accepted
      ? `${contract.personality.evaluationLabel} The pact accepts your record.`
      : reasons.join(' '),
    dominantBehavior,
    favoredBehavior,
  };
}

function createPaymentFailureFeedback(contractId: DemonContractId, message: string): ContractDecisionFeedback {
  const contract = DEMON_CONTRACTS[contractId];

  return {
    contractId,
    accepted: false,
    dialogue: 'The ledger refuses the pact.',
    summary: message,
    dominantBehavior: 'unproven',
    favoredBehavior: contract.personality.favoredBehavior,
  };
}

function createInitialContractFeedback(contractId: DemonContractId): ContractDecisionFeedback {
  const contract = DEMON_CONTRACTS[contractId];

  return {
    contractId,
    accepted: true,
    dialogue: `${contract.name} accepts the first pact without resistance.`,
    summary: INITIAL_CONTRACT_REQUIREMENT_LABEL,
    dominantBehavior: 'unproven',
    favoredBehavior: contract.personality.favoredBehavior,
  };
}

function getSpendAmount(action: SoulSpendAction): number {
  switch (action) {
    case 'attack':
      return SOUL_ACTION_COSTS.attack;
    case 'ability':
      return SOUL_ACTION_COSTS.ability;
    case 'contract_attempt':
      return SOUL_ACTION_COSTS.contractAttempt;
    case 'boost':
      return SOUL_ACTION_COSTS.boost;
    case 'heal':
      return SOUL_ACTION_COSTS.heal;
  }

  return SOUL_ACTION_COSTS.attack;
}

export function GameProgressProvider({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState<StoredProgress>(() => getDefaultProgress());
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const progressRef = useRef(progress);
  const walletAddressRef = useRef<string | null>(null);

  const persistRemoteSnapshot = useCallback(async (snapshot: StoredProgress, walletAddressOverride?: string | null) => {
    const walletAddress = walletAddressOverride ?? walletAddressRef.current;
    if (!walletAddress) {
      return;
    }

    setSyncState('saving');
    setSyncMessage('SYNCING WALLET LEDGER...');

    try {
      await savePlayer({
        walletAddress,
        tokens: snapshot.tokens,
        reputation: snapshot.reputation,
        contract: snapshot.activeContractId,
        contractLevel: snapshot.activeContractId ? getContractLevel(snapshot.contractProgress[snapshot.activeContractId]) : 0,
        contractProgress: snapshot.contractProgress,
        contractRequirements: snapshot.contractRequirements,
        metrics: snapshot.metrics,
        contractHistory: snapshot.contractHistory,
        maxHealth: PLAYER_PROFILE.maxHp,
      });

      setSyncState('saved');
      setSyncMessage('WALLET STATE SEALED');
    } catch (error) {
      setSyncState('error');
      setSyncMessage(error instanceof Error ? error.message.toUpperCase() : 'SYNC FAILED');
    }
  }, []);

  const writeProgress = useCallback(
    (snapshot: StoredProgress, options?: { persistRemote?: boolean; walletAddressOverride?: string | null }) => {
      progressRef.current = snapshot;
      setProgress(snapshot);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      }

      if (options?.persistRemote !== false) {
        void persistRemoteSnapshot(snapshot, options?.walletAddressOverride);
      }
    },
    [persistRemoteSnapshot],
  );

  const updateProgress = useCallback(
    (updater: (previous: StoredProgress) => StoredProgress, options?: { persistRemote?: boolean }) => {
      const next = updater(progressRef.current);
      writeProgress(next, { persistRemote: options?.persistRemote });
      return next;
    },
    [writeProgress],
  );

  const connectWalletSession = useCallback(async (walletAddress: string): Promise<LoginResult> => {
    if (!walletAddress.trim()) {
      return {
        ok: false,
        created: false,
        message: 'Wallet not detected',
      };
    }

    try {
      const response = await connectWalletPlayer(walletAddress.trim());
      const nextProgress = buildProgressFromApiPlayer(response.player);

      walletAddressRef.current = response.player.walletAddress;
      setCurrentWalletAddress(response.player.walletAddress);
      writeProgress(nextProgress, {
        persistRemote: false,
        walletAddressOverride: response.player.walletAddress,
      });
      await persistRemoteSnapshot(nextProgress, response.player.walletAddress);

      return {
        ok: true,
        created: response.created,
        message: response.created ? 'WALLET REGISTERED. ACCESS GRANTED.' : 'WALLET VERIFIED. ACCESS GRANTED.',
      };
    } catch (error) {
      return {
        ok: false,
        created: false,
        message: error instanceof Error ? error.message.toUpperCase() : 'WALLET ACCESS DENIED.',
      };
    }
  }, [persistRemoteSnapshot, writeProgress]);

  const spendSoul = useCallback(
    async (action: SoulSpendAction, amount?: number): Promise<SpendSoulResult> => {
      const walletAddress = walletAddressRef.current;
      if (!walletAddress) {
        return {
          ok: false,
          message: 'CONNECT WALLET FIRST.',
          balanceRemaining: null,
          transactionId: null,
          log: '',
        };
      }

      const spendAmount = amount ?? getSpendAmount(action);

      try {
        setSyncState('saving');
        setSyncMessage('SIMULATING $SOUL TRANSACTION...');

        const response = await processSoulTransaction({
          walletAddress,
          amount: spendAmount,
          action,
        });

        if (!response.success) {
          const failureMessage = response.failureReason ?? response.log ?? 'TRANSACTION FAILED.';
          setSyncState('error');
          setSyncMessage(failureMessage.toUpperCase());
          return {
            ok: false,
            message: failureMessage.toUpperCase(),
            balanceRemaining: response.balanceRemaining,
            transactionId: response.transactionId,
            log: response.log,
          };
        }

        updateProgress(
          (previous) => ({
            ...previous,
            tokens: response.balanceRemaining,
            metrics: {
              ...previous.metrics,
              tokenUsage: previous.metrics.tokenUsage + (spendAmount > 0 ? 1 : 0),
            },
          }),
          { persistRemote: false },
        );

        setSyncState('saved');
        setSyncMessage(response.log.toUpperCase());

        return {
          ok: true,
          message: response.log.toUpperCase(),
          balanceRemaining: response.balanceRemaining,
          transactionId: response.transactionId,
          log: response.log,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message.toUpperCase() : 'TRANSACTION FAILED.';
        setSyncState('error');
        setSyncMessage(message);
        return {
          ok: false,
          message,
          balanceRemaining: null,
          transactionId: null,
          log: '',
        };
      }
    },
    [updateProgress],
  );

  const saveProgress = useCallback(async () => {
    await persistRemoteSnapshot(progressRef.current);
  }, [persistRemoteSnapshot]);

  const activeContractId = progress.activeContractId;
  const activeContract = activeContractId ? DEMON_CONTRACTS[activeContractId] : null;
  const activeContractLevel = activeContractId ? getContractLevel(progress.contractProgress[activeContractId]) : 0;
  const activeContractStats = activeContractId ? buildContractCombatStats(activeContractId, activeContractLevel) : null;
  const activeAbilities = activeContractId ? getUnlockedAbilities(activeContractId, activeContractLevel) : [];

  const attemptContractSelection = useCallback(
    async (id: DemonContractId): Promise<ContractAttemptResult> => {
      const spendResult = await spendSoul('contract_attempt', SOUL_ACTION_COSTS.contractAttempt);
      if (!spendResult.ok) {
        return {
          ok: false,
          feedback: createPaymentFailureFeedback(id, spendResult.message),
        };
      }

      const feedback = progressRef.current.activeContractId
        ? evaluateContractAttempt(progressRef.current, id)
        : createInitialContractFeedback(id);
      const timestamp = new Date().toISOString();
      const outcome: StoredContractHistoryEntry['outcome'] = feedback.accepted ? 'accepted' : 'rejected';

      updateProgress((previous) => ({
        ...previous,
        activeContractId: feedback.accepted ? id : previous.activeContractId,
        queuedBoost: null,
        contractHistory: [
          ...previous.contractHistory,
          {
            contractId: id,
            outcome,
            reason: feedback.accepted ? feedback.summary : `${feedback.dialogue} ${feedback.summary}`.trim(),
            reputation: previous.reputation,
            dominantBehavior: feedback.dominantBehavior,
            timestamp,
          },
        ].slice(-40),
      }));

      return {
        ok: feedback.accepted,
        feedback,
      };
    },
    [spendSoul, updateProgress],
  );

  const rerollContractRequirements = useCallback(
    (id: DemonContractId): RequirementResetResult => {
      const nextRequirements = buildRequirementsForContract(id);

      updateProgress((previous) => ({
        ...previous,
        contractRequirements: {
          ...previous.contractRequirements,
          [id]: nextRequirements,
        },
      }));

      return {
        requirementLabel: getPrimaryRequirementLabel(nextRequirements),
      };
    },
    [updateProgress],
  );

  const recordCombatAction = useCallback(
    (action: CombatActionMetric) => {
      updateProgress((previous) => ({
        ...previous,
        metrics: {
          ...previous.metrics,
          attackCount: action === 'attack' ? previous.metrics.attackCount + 1 : previous.metrics.attackCount,
          defendCount: action === 'defend' ? previous.metrics.defendCount + 1 : previous.metrics.defendCount,
          abilityCount: action === 'invoke' ? previous.metrics.abilityCount + 1 : previous.metrics.abilityCount,
        },
      }));
    },
    [updateProgress],
  );

  const primeBoost = useCallback(
    async (type: TokenBoostType): Promise<BoostResult> => {
      const config = TOKEN_BOOST_OPTIONS.find((entry) => entry.id === type);
      if (!config) {
        return {
          ok: false,
          message: 'UNKNOWN BOOST.',
        };
      }

      const spendResult = await spendSoul('boost', config.cost);
      if (!spendResult.ok) {
        return {
          ok: false,
          message: spendResult.message,
        };
      }

      updateProgress((previous) => ({
        ...previous,
        queuedBoost: type,
      }));

      return {
        ok: true,
        message: `${config.label.toUpperCase()} PRIMED. ${spendResult.message}`,
      };
    },
    [spendSoul, updateProgress],
  );

  const consumeBoost = useCallback(
    (type: TokenBoostType) => {
      const current = progressRef.current;
      if (current.queuedBoost !== type) {
        return 0;
      }

      const config = TOKEN_BOOST_OPTIONS.find((entry) => entry.id === type);
      updateProgress(
        (previous) => ({
          ...previous,
          queuedBoost: null,
        }),
        { persistRemote: false },
      );

      return config?.effect ?? 0;
    },
    [updateProgress],
  );

  const healWithTokens = useCallback(
    async (currentHealth: number): Promise<HealResult> => {
      const maxHealth = PLAYER_PROFILE.maxHp;

      if (currentHealth >= maxHealth) {
        return {
          ok: false,
          healed: 0,
          nextHealth: currentHealth,
          message: 'VITAL HOLD IS ALREADY FULL.',
        };
      }

      const spendResult = await spendSoul('heal', TOKEN_HEAL_OPTION.cost);
      if (!spendResult.ok) {
        return {
          ok: false,
          healed: 0,
          nextHealth: currentHealth,
          message: spendResult.message,
        };
      }

      const healed = Math.min(TOKEN_HEAL_OPTION.healAmount, maxHealth - currentHealth);
      return {
        ok: true,
        healed,
        nextHealth: currentHealth + healed,
        message: `VITAL HOLD RESTORED BY ${healed}. ${spendResult.message}`,
      };
    },
    [spendSoul],
  );

  const awardCombatVictory = useCallback(
    (rewards: CombatRewards): VictoryResult | null => {
      const current = progressRef.current;
      if (!current.activeContractId) {
        return null;
      }

      const contract = DEMON_CONTRACTS[current.activeContractId];
      const previousLevel = getContractLevel(current.contractProgress[current.activeContractId]);
      const nextProgressValue = current.contractProgress[current.activeContractId] + 1;
      const nextLevel = getContractLevel(nextProgressValue);
      const awardedTokens = rewards.tokensReward + contract.economyBonusTokens;

      updateProgress((previous) => ({
        ...previous,
        tokens: previous.tokens + awardedTokens,
        reputation: previous.reputation + rewards.reputationGain,
        metrics: {
          ...previous.metrics,
          battlesWon: previous.metrics.battlesWon + 1,
        },
        contractProgress: {
          ...previous.contractProgress,
          [current.activeContractId!]: nextProgressValue,
        },
        queuedBoost: null,
      }));

      return {
        awardedTokens,
        reputationGain: rewards.reputationGain,
        previousLevel,
        nextLevel,
        leveledUp: nextLevel > previousLevel,
      };
    },
    [updateProgress],
  );

  const contractOffers = useMemo<ContractOfferState[]>(
    () => {
      const isInitialContractSelection = !progress.activeContractId;

      return (
      DEMON_CONTRACT_ORDER.map((id) => {
        const contract = DEMON_CONTRACTS[id];
        const progressValue = progress.contractProgress[id];
        const level = getContractLevel(progressValue);
        const stats = buildContractCombatStats(id, level);
        const abilities = getUnlockedAbilities(id, level);
        const requirements = isInitialContractSelection
          ? []
          : (progress.contractRequirements[id] ?? []).map((entry) => {
              const current = getMetricValue(progress, entry.type);

              return {
                ...entry,
                label: getRequirementLabel(entry.type, entry.required),
                current,
                satisfied: current >= entry.required,
              };
            });

        const isActive = progress.activeContractId === id;
        const unlocked = isInitialContractSelection || isActive || requirements.every((entry) => entry.satisfied);

        return {
          id,
          contract,
          level,
          progress: progressValue,
          progressPercent: getContractProgressPercent(progressValue),
          stats,
          abilities,
          isActive,
          unlocked,
          primaryRequirementLabel: isInitialContractSelection
            ? INITIAL_CONTRACT_REQUIREMENT_LABEL
            : getPrimaryRequirementLabel(progress.contractRequirements[id] ?? []),
          requirements,
        };
      })
      );
    },
    [progress],
  );

  const value = useMemo<GameProgressContextValue>(
    () => ({
      currentWalletAddress,
      isAuthenticated: Boolean(currentWalletAddress),
      syncState,
      syncMessage,
      activeContractId,
      hasChosenFirstContract: Boolean(activeContractId),
      activeContract,
      activeContractLevel,
      activeContractStats,
      activeAbilities,
      behaviorSummary: progress.metrics,
      contractHistory: progress.contractHistory,
      contractProgress: progress.contractProgress,
      contractOffers,
      tokens: progress.tokens,
      reputation: progress.reputation,
      queuedBoost: progress.queuedBoost,
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
    }),
    [
      activeAbilities,
      activeContract,
      activeContractId,
      activeContractLevel,
      activeContractStats,
      attemptContractSelection,
      awardCombatVictory,
      connectWalletSession,
      consumeBoost,
      contractOffers,
      currentWalletAddress,
      healWithTokens,
      primeBoost,
      progress.contractHistory,
      progress.contractProgress,
      progress.metrics,
      progress.queuedBoost,
      progress.reputation,
      progress.tokens,
      recordCombatAction,
      rerollContractRequirements,
      saveProgress,
      spendSoul,
      syncMessage,
      syncState,
    ],
  );

  return <GameProgressContext.Provider value={value}>{children}</GameProgressContext.Provider>;
}

export function useGameProgress() {
  const context = useContext(GameProgressContext);

  if (!context) {
    throw new Error('useGameProgress must be used within a GameProgressProvider');
  }

  return context;
}
