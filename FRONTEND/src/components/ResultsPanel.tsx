type ResultsPanelProps = {
  title: string;
  remanent: string;
  reputation: string;
  enemyName: string;
  onClose: () => void;
};

export function ResultsPanel({
  title,
  remanent,
  reputation,
  enemyName,
  onClose,
}: ResultsPanelProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(8,6,6,0.58)] p-3 backdrop-blur-[2px] sm:p-4">
      <section className="panel w-full max-w-[760px] px-4 py-4 sm:px-5 sm:py-5">
        <div className="relative z-10">
          <div className="text-center">
            <p className="type-block text-[10px] text-[#7d6b57]">reckoning ledger</p>
            <h2 className="mt-3 text-2xl uppercase tracking-[0.12em] text-[#e0d2b8] sm:text-3xl">{title}</h2>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#baa88f]">{enemyName} has been claimed by the ledger.</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="parchment-card border border-[#46372d] px-4 py-4 text-center">
              <p className="type-block text-[10px] text-[#7d6b57]">REMANENT ACQUIRED: {remanent}</p>
              <p className="mt-3 text-3xl uppercase tracking-[0.12em] text-[#ecdcc0] sm:text-4xl">{remanent}</p>
            </div>

            <div className="parchment-card border border-[#46372d] px-4 py-4 text-center">
              <p className="type-block text-[10px] text-[#7d6b57]">REPUTATION GAINED: {reputation}</p>
              <p className="mt-3 text-3xl uppercase tracking-[0.12em] text-[#ecdcc0] sm:text-4xl">{reputation}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button type="button" onClick={onClose} className="menu-button text-center">
              RETURN TO THE CITY MAP
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
