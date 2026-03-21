export type ContractItem = {
  id: string;
  title: string;
  demon: string;
  risk: 'low' | 'medium' | 'extreme';
  debt: string;
};

type InventoryProps = {
  items: ContractItem[];
};

const riskTone: Record<ContractItem['risk'], string> = {
  low: 'text-[#bba88e] border-[#514137]',
  medium: 'text-[#c59a72] border-[#6b5036]',
  extreme: 'text-[#d6a188] border-[#733b30]',
};

export function Inventory({ items }: InventoryProps) {
  return (
    <section className="panel flex h-full flex-col p-4">
      <div className="relative z-10 mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="type-block text-[10px] text-[#7d6b57]">registro de deudas</p>
          <h2 className="mt-2 text-xl uppercase tracking-[0.14em] text-[#ddd0b7]">Libro de Cobro</h2>
        </div>
        <p className="text-sm uppercase tracking-[0.2em] text-[#a39278]">{items.length} activas</p>
      </div>

      <div className="relative z-10 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <article
            key={item.id}
            className="parchment-card group relative overflow-hidden border border-[#3d3128] p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[#6f563c] hover:bg-[#181311]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(205,189,162,0.04),transparent_20%,transparent_75%,rgba(90,32,28,0.08))] opacity-70" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-[linear-gradient(180deg,transparent,rgba(138,106,67,0.72),transparent)] opacity-80" />
            <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-[#796a57]">{item.id}</p>
                <h3 className="mt-2 text-sm uppercase tracking-[0.14em] text-[#e0d2b8]">{item.title}</h3>
              </div>
              <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.24em] ${riskTone[item.risk]}`}>
                {item.risk}
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.14em] text-[#aa997e]">
              <div>
                <p className="text-[10px] text-[#756653]">demonio regente</p>
                <p className="mt-1 text-[#d8cab0]">{item.demon}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#756653]">cobro</p>
                <p className="mt-1 text-[#c69575]">{item.debt}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
