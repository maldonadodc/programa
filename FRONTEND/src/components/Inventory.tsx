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
  low: 'text-zinc-400 border-zinc-800',
  medium: 'text-amber-400 border-amber-900/60',
  extreme: 'text-red-400 border-red-900/70',
};

export function Inventory({ items }: InventoryProps) {
  return (
    <section className="panel flex h-full flex-col p-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">contract inventory</p>
          <h2 className="mt-2 text-xl uppercase tracking-[0.18em] text-zinc-100">Ledger</h2>
        </div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">{items.length} active</p>
      </div>

      <div className="space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <article
            key={item.id}
            className="inventory-contract group relative overflow-hidden border border-zinc-800 bg-black/50 p-3 transition duration-300 hover:-translate-y-0.5 hover:scale-[1.015] hover:border-red-900/80 hover:bg-black/70 hover:shadow-[0_16px_34px_rgba(0,0,0,0.5),0_0_22px_rgba(143,17,23,0.18)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_20%,transparent_75%,rgba(143,17,23,0.08))] opacity-70" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-red-900/70 to-transparent opacity-80" />
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-600">{item.id}</p>
                <h3 className="mt-2 text-sm uppercase tracking-[0.16em] text-zinc-100">{item.title}</h3>
              </div>
              <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.25em] ${riskTone[item.risk]}`}>
                {item.risk}
              </span>
            </div>

            <div className="relative grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.14em] text-zinc-400">
              <div>
                <p className="text-[10px] text-zinc-600">bound entity</p>
                <p className="mt-1 text-zinc-200">{item.demon}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-600">debt value</p>
                <p className="mt-1 text-red-300">{item.debt}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
