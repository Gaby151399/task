type TaskStatsProps = {
  stats: {
    total: number;
    pending: number;
    progress: number;
    completed: number;
  };
};

export function TaskStats({ stats }: TaskStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
      <Stat label="Total" value={stats.total} />
      <Stat label="A faire" value={stats.pending} />
      <Stat label="En cours" value={stats.progress} />
      <Stat label="Terminees" value={stats.completed} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-base-200 p-4">
      <p className="text-sm text-base-content/60">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
