type EventEntry = {
  timestamp: string;
  text: string;
  severity: 'system' | 'warning' | 'fatal';
};

type EventLogProps = {
  entries: EventEntry[];
};

const severityTone: Record<EventEntry['severity'], string> = {
  system: 'text-zinc-300',
  warning: 'text-amber-300',
  fatal: 'text-red-300',
};

export function EventLog({ entries }: EventLogProps) {
  return (
    <section className="panel crt-panel flex h-full flex-col p-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">dot matrix output</p>
          <h2 className="mt-2 text-xl uppercase tracking-[0.18em] text-zinc-100">Event Log</h2>
        </div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">printer feed online</p>
      </div>

      <div className="relative flex-1 overflow-hidden border border-zinc-800 bg-[#050505]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0,transparent_7%,transparent_93%,rgba(255,255,255,0.03)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_3px)] opacity-35" />

        <div className="h-full space-y-3 overflow-y-auto p-4 text-[12px] leading-6 tracking-[0.18em]">
          {entries.map((entry, index) => (
            <div
              key={`${entry.timestamp}-${index}`}
              className="overflow-hidden whitespace-nowrap border-b border-dashed border-zinc-900 pb-3 last:border-b-0"
              style={{
                animation: 'typeLine 2.4s steps(40, end) forwards',
                animationDelay: `${index * 200}ms`,
                width: 0,
              }}
            >
              <span className="mr-3 text-zinc-600">[{entry.timestamp}]</span>
              <span className={severityTone[entry.severity]}>{entry.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
