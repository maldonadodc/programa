import { useEffect, useMemo, useState } from 'react';
import type { ContractDecisionFeedback, ContractOfferState } from '../context/GameProgressContext';
import type { DemonContractId, PlayerBehaviorStats } from '../lib/worldData';

type ContractSelectionModalProps = {
  offers: ContractOfferState[];
  activeContractId: DemonContractId | null;
  focusedContractId?: DemonContractId | null;
  mandatory?: boolean;
  message?: string;
  reputation: number;
  behaviorSummary: PlayerBehaviorStats;
  decisionFeedback?: ContractDecisionFeedback | null;
  onSelect: (id: DemonContractId) => void;
  onRetryLocked: (id: DemonContractId) => void;
  onBack?: () => void;
  onClose?: () => void;
};

export function ContractSelectionModal({
  offers,
  activeContractId,
  focusedContractId = null,
  mandatory = false,
  message = 'Choose one pact to unlock movement, City access, and combat.',
  reputation,
  behaviorSummary,
  decisionFeedback = null,
  onSelect,
  onRetryLocked,
  onBack,
  onClose,
}: ContractSelectionModalProps) {
  const defaultSelection = useMemo(
    () => focusedContractId ?? activeContractId ?? offers.find((offer) => offer.unlocked)?.id ?? offers[0]?.id ?? null,
    [activeContractId, focusedContractId, offers],
  );
  const [selectedId, setSelectedId] = useState<DemonContractId | null>(defaultSelection);

  useEffect(() => {
    setSelectedId(defaultSelection);
  }, [defaultSelection]);

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedId) ?? offers[0] ?? null,
    [offers, selectedId],
  );
  const selectedFeedback = selectedOffer && decisionFeedback?.contractId === selectedOffer.id ? decisionFeedback : null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(6,5,5,0.72)] p-3 backdrop-blur-[2px] sm:p-4">
      <section className="panel relative flex w-full max-w-[920px] max-h-[80vh] flex-col overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
        {(onBack || onClose) && (
          <div className="absolute left-4 top-4 z-20">
            <button type="button" onClick={onBack ?? onClose} className="back-button">
              BACK
            </button>
          </div>
        )}

        <div className="relative z-10 shrink-0 border-b border-[#403228] pb-5 pt-12">
          <div>
            <p className="type-block text-[10px] text-[#7d6b57]">{mandatory ? 'first binding' : 'contract archive'}</p>
            <h2 className="mt-3 text-2xl uppercase tracking-[0.12em] text-[#e0d2b8] sm:text-3xl">
              {mandatory ? 'CHOOSE YOUR FIRST CONTRACT' : 'DEMON CONTRACTS'}
            </h2>
            <p className="mt-3 max-w-2xl text-[11px] uppercase tracking-[0.18em] text-[#bea98d] sm:text-xs sm:tracking-[0.22em]">{message}</p>
          </div>
        </div>

        <div className="subtle-scroll relative z-10 mt-5 min-h-0 flex-1 overflow-y-auto scroll-smooth pr-2 sm:pr-3">
          <div className="grid gap-3 md:grid-cols-2">
            {offers.map((offer) => {
              const isSelected = selectedOffer?.id === offer.id;
              const isLocked = !offer.unlocked && !offer.isActive;

              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setSelectedId(offer.id)}
                  className={`parchment-card group relative overflow-hidden border p-3 text-left transition duration-300 sm:p-4 ${
                    isSelected
                      ? 'border-[#e1c79b] bg-[#19120f] shadow-[0_0_0_1px_rgba(225,199,155,0.22),0_16px_28px_rgba(0,0,0,0.24)]'
                      : 'border-[#47382e] hover:-translate-y-0.5 hover:border-[#8a6a43]'
                  }`}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: isSelected ? offer.contract.accent : `${offer.contract.accent}66` }}
                  />
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.22em]">
                    <span style={{ color: offer.contract.accent }}>{offer.contract.theme}</span>
                    <div className="flex items-center gap-2">
                      {offer.isActive && (
                        <span className="border border-[#6f5a42] bg-[#1b1512] px-2 py-1 text-[#eadcc3]">ACTIVE</span>
                      )}
                      {mandatory && !offer.isActive && (
                        <span className="border border-[#5d6b42] bg-[#12160f] px-2 py-1 text-[#d8e7b7]">AVAILABLE</span>
                      )}
                      {isLocked && (
                        <span className="border border-[#5a4435] bg-[#120f0d] px-2 py-1 text-[#d5b59a]">LOCKED</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden border border-[#4b3a2f] bg-[#161210]">
                    <img
                      src={offer.contract.image.src}
                      alt={offer.contract.image.alt}
                      className={`h-40 w-full object-contain p-2 transition duration-500 group-hover:scale-[1.02] sm:h-48 ${
                        isLocked ? 'grayscale opacity-60' : ''
                      }`}
                      style={{ objectPosition: offer.contract.image.position ?? 'center' }}
                    />
                  </div>

                  <div className="mt-3">
                    <h3 className="text-xl uppercase tracking-[0.12em] text-[#eadcc3] sm:text-2xl">{offer.contract.name}</h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#bca78c] sm:text-[11px] sm:tracking-[0.22em]">{offer.contract.title}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#d9c4a1] sm:text-[11px] sm:tracking-[0.22em]">
                      {offer.primaryRequirementLabel}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="border border-[#43352b] bg-[#120f0d]/80 px-2 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7d6b57]">Attack</p>
                      <p className="mt-1 text-base uppercase tracking-[0.12em] text-[#eadcc3] sm:text-lg">{offer.stats.attack}</p>
                    </div>
                    <div className="border border-[#43352b] bg-[#120f0d]/80 px-2 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7d6b57]">Defense</p>
                      <p className="mt-1 text-base uppercase tracking-[0.12em] text-[#eadcc3] sm:text-lg">{offer.stats.defense}</p>
                    </div>
                    <div className="border border-[#43352b] bg-[#120f0d]/80 px-2 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7d6b57]">Special</p>
                      <p className="mt-1 text-base uppercase tracking-[0.12em] text-[#eadcc3] sm:text-lg">{offer.stats.specialAttack}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 border-t border-[#43342b] pt-3">
                    {offer.requirements.map((requirement) => (
                      <div key={`${offer.id}-${requirement.type}`} className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.2em]">
                        <span className={requirement.satisfied ? 'text-[#cfe1b9]' : 'text-[#ab9478]'}>{requirement.label}</span>
                        <span className={requirement.satisfied ? 'text-[#cfe1b9]' : 'text-[#efc0a0]'}>
                          {requirement.current}/{requirement.required}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedOffer && (
            <div className="mt-5 grid gap-4 border-t border-[#403228] pt-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <p className="type-block text-[10px] text-[#7d6b57]">selection</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl uppercase tracking-[0.12em] text-[#eadcc3] sm:text-3xl">{selectedOffer.contract.name}</h3>
                  <span
                    className="border px-3 py-1 text-[10px] uppercase tracking-[0.24em]"
                    style={{ borderColor: `${selectedOffer.contract.accent}88`, color: selectedOffer.contract.accent }}
                  >
                    LVL {selectedOffer.level}
                  </span>
                  {selectedOffer.isActive && (
                    <span className="border border-[#6f5a42] bg-[#1b1512] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#eadcc3]">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="mt-3 max-w-3xl text-xs leading-6 text-[#bca78c] sm:text-sm sm:leading-7">{selectedOffer.contract.note}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#d8c29f]">
                  {selectedOffer.contract.personality.preferenceLabel}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedOffer.abilities.map((ability) => (
                    <span
                      key={ability}
                      className="border border-[#5a4435] bg-[#15110f]/80 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#e4d2b6]"
                    >
                      {ability}
                    </span>
                  ))}
                </div>
              </div>

              <div className="parchment-card border border-[#46382d] px-4 py-4">
                <p className="type-block text-[10px] text-[#7d6b57]">binding status</p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#d9c4a1]">
                  {selectedOffer.primaryRequirementLabel}
                </p>
                <p className="mt-3 text-[11px] uppercase leading-6 tracking-[0.22em] text-[#bba78d]">
                  {mandatory
                    ? 'INITIAL CONTRACT – REQUIREMENTS, REPUTATION, AND REJECTION CHECKS ARE DISABLED.'
                    : selectedOffer.contract.personality.evaluationLabel}
                </p>
                {!mandatory && (
                  <p className="mt-4 text-[11px] uppercase leading-6 tracking-[0.22em] text-[#bba78d]">
                    Only one contract can remain active at a time. Selecting a new pact replaces the previous one.
                  </p>
                )}

                {!mandatory && (
                  <div className="mt-5 grid gap-3 border-t border-[#43342b] pt-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#bca78c]">
                      <span>Current reputation</span>
                      <span className="text-[#e4c39c]">{reputation}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.18em] text-[#cfbea3]">
                      <div className="border border-[#43352b] bg-[#120f0d]/80 px-3 py-2">Attacks {behaviorSummary.attackCount}</div>
                      <div className="border border-[#43352b] bg-[#120f0d]/80 px-3 py-2">Defends {behaviorSummary.defendCount}</div>
                      <div className="border border-[#43352b] bg-[#120f0d]/80 px-3 py-2">Abilities {behaviorSummary.abilityCount}</div>
                      <div className="border border-[#43352b] bg-[#120f0d]/80 px-3 py-2">Token Uses {behaviorSummary.tokenUsage}</div>
                    </div>
                  </div>
                )}

                {selectedFeedback && (
                  <div
                    className={`mt-5 border px-3 py-3 ${
                      selectedFeedback.accepted
                        ? 'border-[#4e5a3a] bg-[#12140f]'
                        : 'border-[#71463b] bg-[#180f0d]'
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#e6d6bb]">
                      {selectedFeedback.accepted ? 'PACT ACCEPTED' : 'PACT REJECTED'}
                    </p>
                    <p className="mt-3 text-[11px] uppercase leading-6 tracking-[0.18em] text-[#efc7af]">
                      "{selectedFeedback.dialogue}"
                    </p>
                    <p className="mt-3 text-[10px] uppercase leading-6 tracking-[0.18em] text-[#c9b59b]">
                      {selectedFeedback.summary}
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => onSelect(selectedOffer.id)}
                    disabled={!selectedOffer.unlocked || selectedOffer.isActive}
                    className="menu-button w-full text-center disabled:cursor-not-allowed disabled:border-[#413328] disabled:bg-[#17120f] disabled:text-[#6f604d]"
                  >
                    {selectedOffer.isActive
                      ? 'ACTIVE CONTRACT'
                      : mandatory
                        ? 'FORM INITIAL CONTRACT'
                        : 'REPLACE CONTRACT'}
                  </button>

                  {!selectedOffer.unlocked && (
                    <button
                      type="button"
                      onClick={() => onRetryLocked(selectedOffer.id)}
                      className="back-button w-full"
                    >
                      RETRY CONDITIONS
                    </button>
                  )}

                  {!selectedOffer.unlocked && (
                    <p className="text-[10px] uppercase leading-6 tracking-[0.22em] text-[#d9a089]">
                      Conditions reset each time you attempt this binding.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
