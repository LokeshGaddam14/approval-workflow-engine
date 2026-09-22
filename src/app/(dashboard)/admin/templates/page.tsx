'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTemplates, getAllTemplates, createTemplate, deactivateTemplate, activateTemplate } from '@/lib/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

const ROLES = ['MANAGER','HR','DIRECTOR','ADMIN']

export default function TemplatesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState([{ stepName: '', approverRole: 'MANAGER', description: '' }])

  const { data: templates, isLoading } = useQuery({ queryKey: ['templates', 'all'], queryFn: getAllTemplates })

  const createMutation = useMutation({
    mutationFn: () => createTemplate({ name, description, steps: steps.map((s, i) => ({ ...s, stepOrder: i + 1 })) }),
    onSuccess: () => {
      toast.success('Template created')
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      setOpen(false)
      setName(''); setDescription('')
      setSteps([{ stepName: '', approverRole: 'MANAGER', description: '' }])
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => deactivateTemplate(id),
    onSuccess: () => { toast.success('Template deactivated'); queryClient.invalidateQueries({ queryKey: ['templates'] }) },
  })

  const activateMutation = useMutation({
    mutationFn: (id: number) => activateTemplate(id),
    onSuccess: () => { toast.success('Template activated'); queryClient.invalidateQueries({ queryKey: ['templates'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to activate'),
  })

  const addStep = () => setSteps([...steps, { stepName: '', approverRole: 'MANAGER', description: '' }])
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i))
  const updateStep = (i: number, field: string, value: string) => {
    const s = [...steps]; s[i] = { ...s[i], [field]: value }; setSteps(s)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workflow Templates</h1>
        <Button onClick={() => setOpen(true)}><Plus className="size-4 mr-2" />New Template</Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {templates?.map((t: any) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.active ? 'default' : 'secondary'}>{t.active ? 'Active' : 'Inactive'}</Badge>
                  {t.active ? (
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => deactivateMutation.mutate(t.id)} title="Deactivate">
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => activateMutation.mutate(t.id)} title="Activate">
                      <CheckCircle className="size-3.5 text-green-600" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {t.steps?.map((step: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="size-4 rounded-full bg-muted flex items-center justify-center text-[10px] shrink-0">{step.stepOrder}</span>
                    <span>{step.stepName}</span>
                    <span>→ {step.approverRole}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Name</Label>
              <Input placeholder="e.g. Leave Request" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Input placeholder="Short description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label>Steps</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStep}><Plus className="size-3 mr-1" />Add Step</Button>
              </div>
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
                    {steps.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="size-6 hover:bg-destructive/10" onClick={() => removeStep(i)}>
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <Input placeholder="Step name e.g. Manager Approval" value={step.stepName} onChange={e => updateStep(i, 'stepName', e.target.value)} />
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background bg-white dark:bg-zinc-800 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={step.approverRole}
                    onChange={e => updateStep(i, 'approverRole', e.target.value)}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !name || steps.some(s => !s.stepName)}>
              {createMutation.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
