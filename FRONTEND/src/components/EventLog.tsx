type EventEntry = {
  timestamp: string;
  text: string;
  severity: 'system' | 'warning' | 'fatal';
};

type EventLogProps = {
  entries: EventEntry[];
};

const severityTone: Record<EventEntry['severity'], string> = {
  system: 'text-[#cfbea3]',
  warning: 'text-[#c89a75]',
  fatal: 'text-[#d9a089]',
};

export function EventLog({ entries }: EventLogProps) {
  return (
    <section className="panel flex h-full flex-col p-4">
      <div className="relative z-10 mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="type-block text-[10px] text-[#7d6b57]">cronica del cobro</p>
          <h2 className="mt-2 text-xl uppercase tracking-[0.14em] text-[#ddd0b7]">Registro</h2>
        </div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#8c7a62]">pergamino vivo</p>
      </div>

      <div className="relative flex-1 overflow-hidden border border-[#3d3128] bg-[#0f0c0b]">
        <div className="pointer-events-none absolute inset-0 bg-dust opacity-[0.16]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(205,189,162,0.05)_0,transparent_7%,transparent_93%,rgba(90,32,28,0.04)_100%)]" />

        <div className="relative z-10 h-full space-y-3 overflow-y-auto p-4 text-[12px] leading-6 tracking-[0.12em]">
          {entries.map((entry, index) => (
            <div
              key={`${entry.timestamp}-${index}`}
              className="border-b border-dashed border-[#2a211d] pb-3 last:border-b-0"
            >
              <span className="mr-3 text-[#746553]">[{entry.timestamp}]</span>
              <span className={severityTone[entry.severity]}>{entry.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
