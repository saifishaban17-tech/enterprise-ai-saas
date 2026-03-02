import type { Lead } from '../backend';
import { Phone, Globe } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-primary/15 text-primary border-primary/30' },
  contacted: { label: 'Contacted', className: 'bg-amber-400/15 text-amber-400 border-amber-400/30' },
  converted: { label: 'Converted', className: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30' },
};

export default function LeadCard({ lead }: LeadCardProps) {
  const status = statusConfig[lead.status] || statusConfig.new;

  return (
    <div className="bg-card border border-border rounded-xl p-4 card-hover animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-sm">{lead.name}</h3>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
          {status.label}
        </span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="w-3 h-3" />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Globe className="w-3 h-3" />
          <span>{lead.source}</span>
        </div>
      </div>
    </div>
  );
}
