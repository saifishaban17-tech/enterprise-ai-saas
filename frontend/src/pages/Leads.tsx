import { useState } from 'react';
import { useListLeads, useCreateLead } from '../hooks/useQueries';
import LeadCard from '../components/LeadCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function Leads() {
  const { data: leads, isLoading } = useListLeads();
  const createLead = useCreateLead();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('');
  const [formError, setFormError] = useState('');

  const handleCreate = async () => {
    setFormError('');
    if (!name.trim()) return setFormError('Name is required');
    if (!phone.trim()) return setFormError('Phone is required');
    if (!source.trim()) return setFormError('Source is required');

    try {
      await createLead.mutateAsync({ name: name.trim(), phone: phone.trim(), source: source.trim() });
      setName('');
      setPhone('');
      setSource('');
      setShowForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to capture lead';
      setFormError(msg);
    }
  };

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {leads?.length ?? 0} lead{leads?.length !== 1 ? 's' : ''} captured
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="gradient-teal text-charcoal-1 font-semibold rounded-xl h-9 px-3"
        >
          {showForm ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
          {showForm ? 'Hide' : 'Add Lead'}
        </Button>
      </div>

      {/* Capture Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in">
          <h3 className="font-display font-semibold text-sm text-foreground">Capture New Lead</h3>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="bg-charcoal-4 border-border h-10 text-sm rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Phone Number</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="bg-charcoal-4 border-border h-10 text-sm rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Source</Label>
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Website, Referral, LinkedIn..."
              className="bg-charcoal-4 border-border h-10 text-sm rounded-lg"
            />
          </div>

          {formError && (
            <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg p-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Button
            onClick={handleCreate}
            disabled={createLead.isPending}
            className="w-full gradient-teal text-charcoal-1 font-semibold rounded-xl h-10"
          >
            {createLead.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Capture Lead'
            )}
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-charcoal-3" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!leads || leads.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-3 flex items-center justify-center">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No leads yet</p>
          <p className="text-xs text-muted-foreground/70">Tap "Add Lead" to capture your first prospect</p>
        </div>
      )}

      {/* List */}
      {!isLoading && leads && leads.length > 0 && (
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
