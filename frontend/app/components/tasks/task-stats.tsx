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
    <section className="grid grid-cols-2 gap-4">
      <Stat className="border-t-4 border-t-primary/60 hover:shadow-primary/20" label="Total" value={stats.total} />
      <Stat className="border-t-4 border-t-warning/60 hover:shadow-warning/20" label="À faire" value={stats.pending} />
      <Stat className="border-t-4 border-t-info/60 hover:shadow-info/20" label="En cours" value={stats.progress} />
      <Stat className="border-t-4 border-t-success/60 hover:shadow-success/20" label="Terminées" value={stats.completed} />
    </section>
  );
}

function Stat({ label, value, className }: { label: string; value: number, className?: string }) {
  return (
    <div className={`glass-panel rounded-xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${className || ""}`}>
      <p className="text-sm font-medium text-base-content/60 uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-base-content animate-fade-in">{value}</p>
    </div>
  );
}
