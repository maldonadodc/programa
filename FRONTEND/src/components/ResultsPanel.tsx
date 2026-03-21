type ResultsPanelProps = {
  title: string;
  remanent: string;
  reputation: string;
  onClose: () => void;
};

export function ResultsPanel({
  title,
  remanent,
  reputation,
  onClose,
}: ResultsPanelProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(8,6,6,0.68)] p-4 backdrop-blur-[2px]">
      <section className="panel w-full max-w-2xl px-6 py-6">
        <div className="relative z-10">
          <div className="text-center">
            <p className="type-block text-[10px] text-[#7d6b57]">reckoning ledger</p>
            <h2 className="mt-3 text-3xl uppercase tracking-[0.14em] text-[#e0d2b8]">{title}</h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="parchment-card border border-[#46372d] px-5 py-5 text-center">
              <p className="type-block text-[10px] text-[#7d6b57]">REMANENT ACQUIRED</p>
              <p className="mt-4 text-4xl uppercase tracking-[0.12em] text-[#ecdcc0]">{remanent}</p>
            </div>

            <div className="parchment-card border border-[#46372d] px-5 py-5 text-center">
              <p className="type-block text-[10px] text-[#7d6b57]">REPUTATION SHIFTED</p>
              <p className="mt-4 text-4xl uppercase tracking-[0.12em] text-[#ecdcc0]">{reputation}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button type="button" onClick={onClose} className="menu-button text-center">
              RETURN TO THE CITY MAP
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
