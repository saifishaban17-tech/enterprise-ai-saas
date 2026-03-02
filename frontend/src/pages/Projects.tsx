import { useState } from 'react';
import { useListProjects, useCreateProject, useGetCallerUserProfile } from '../hooks/useQueries';
import ProjectCard from '../components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FolderKanban, AlertCircle, Loader2 } from 'lucide-react';

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const { data: profile } = useGetCallerUserProfile();
  const createProject = useCreateProject();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('pending');
  const [formError, setFormError] = useState('');

  const canCreate = profile?.role === 'admin' || profile?.role === 'company';

  const handleCreate = async () => {
    setFormError('');
    if (!name.trim()) return setFormError('Project name is required');
    if (!clientId.trim()) return setFormError('Client ID is required');

    try {
      await createProject.mutateAsync({ name: name.trim(), clientId: clientId.trim(), status });
      setOpen(false);
      setName('');
      setClientId('');
      setStatus('pending');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
      setFormError(msg);
    }
  };

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">Projects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects?.length ?? 0} project{projects?.length !== 1 ? 's' : ''} in workspace
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            className="gradient-teal text-charcoal-1 font-semibold rounded-xl h-9 px-3"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-charcoal-3" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!projects || projects.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-3 flex items-center justify-center">
            <FolderKanban className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No projects yet</p>
          {canCreate && (
            <p className="text-xs text-muted-foreground/70">Tap "New" to create your first project</p>
          )}
        </div>
      )}

      {/* List */}
      {!isLoading && projects && projects.length > 0 && (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-charcoal-2 border-border rounded-2xl max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-foreground">New Project</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Project Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Website Redesign"
                className="bg-charcoal-4 border-border h-10 text-sm rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Client ID</Label>
              <Input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="client-001"
                className="bg-charcoal-4 border-border h-10 text-sm rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-charcoal-4 border-border h-10 text-sm rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-charcoal-3 border-border">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg p-2.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border rounded-xl h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createProject.isPending}
              className="flex-1 gradient-teal text-charcoal-1 font-semibold rounded-xl h-10"
            >
              {createProject.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
