import type { Project } from '../backend';

interface ProjectCardProps {
  project: Project;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-400/15 text-amber-400 border-amber-400/30' },
  active: { label: 'Active', className: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground border-border' },
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.pending;

  return (
    <div className="bg-card border border-border rounded-xl p-4 card-hover animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-sm truncate">{project.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Client: {project.clientId}</p>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
          {status.label}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground font-mono truncate">ID: {project.id}</p>
      </div>
    </div>
  );
}
