import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'teal' | 'green' | 'yellow' | 'purple';
  subtitle?: string;
}

const colorMap = {
  teal: 'text-primary bg-primary/15',
  green: 'text-emerald-400 bg-emerald-400/15',
  yellow: 'text-amber-400 bg-amber-400/15',
  purple: 'text-violet-400 bg-violet-400/15',
};

export default function StatCard({ title, value, icon: Icon, color = 'teal', subtitle }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 card-hover animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
      </div>
    </div>
  );
}
