'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getTemplates, submitRequest } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function NewRequestPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [templateId, setTemplateId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const { data: templates, isLoading } = useQuery({ queryKey: ['templates'], queryFn: getTemplates })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!templateId) { toast.error('Select a template'); return }
    setLoading(true)
    try {
      await submitRequest({ templateId, title, description })
      toast.success('Request submitted!')
      router.push('/requests')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">New Request</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Title</Label>
          <Input placeholder="e.g. Annual Leave Request" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Description</Label>
          <textarea
            className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Describe your request..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Select Template</Label>
          {isLoading ? <Skeleton className="h-20 w-full" /> : (
            <div className="flex flex-col gap-2">
              {(!templates || templates.length === 0) && (
                <p className="text-sm text-muted-foreground py-2">No active templates found. Ask an Admin to create one.</p>
              )}
              {templates?.filter((t: any) => t.active).map((t: any) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-colors ${templateId === t.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setTemplateId(t.id)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.description} · {t.steps?.length} step{t.steps?.length !== 1 ? 's' : ''}</p>
                    </div>
                    {templateId === t.id && (
                      <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <svg className="size-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" disabled={loading || !templateId}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  )
}
