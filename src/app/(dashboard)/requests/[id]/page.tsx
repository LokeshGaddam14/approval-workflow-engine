'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRequestById, approveRequest, rejectRequest } from '@/lib/queries'
import { useAuthStore } from '@/store/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RequestDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [comments, setComments] = useState('')
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: req, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getRequestById(Number(id)),
  })

  const mutation = useMutation({
    mutationFn: () => action === 'approve' ? approveRequest(Number(id), comments) : rejectRequest(Number(id), comments),
    onSuccess: () => {
      toast.success(`Request ${action}d`)
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      setAction(null)
      router.push('/approvals')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const canAct = ['MANAGER','HR','DIRECTOR','ADMIN'].includes(user?.role || '')

  if (isLoading) return <div className="flex flex-col gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
  if (!req) return <p>Request not found.</p>

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={canAct ? '/approvals' : '/requests'} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-bold">{req.title}</h1>
        <Badge>{req.status}</Badge>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col gap-2">
          <p className="text-sm">{req.description}</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>By {req.requesterName}</span>
            <span>{req.templateName}</span>
            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Approval Chain</h2>
        {req.steps?.map((step: any, i: number) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
            {step.status === 'APPROVED' ? <CheckCircle className="size-5 text-green-500 mt-0.5" /> :
             step.status === 'REJECTED' ? <XCircle className="size-5 text-red-500 mt-0.5" /> :
             <Clock className="size-5 text-muted-foreground mt-0.5" />}
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">Step {step.stepOrder}: {step.stepName}</p>
              <p className="text-xs text-muted-foreground">{step.approverRole}</p>
              {step.approverName && <p className="text-xs text-muted-foreground">By {step.approverName}</p>}
              {step.comments && <p className="text-xs italic text-muted-foreground">"{step.comments}"</p>}
            </div>
          </div>
        ))}
      </div>

      {canAct && req.status === 'IN_PROGRESS' && (
        <div className="flex gap-3">
          <Button onClick={() => setAction('approve')} className="flex-1">Approve</Button>
          <Button onClick={() => setAction('reject')} variant="destructive" className="flex-1">Reject</Button>
        </div>
      )}

      <Dialog open={!!action} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="capitalize">{action} Request</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <textarea
              className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Comments (optional)"
              value={comments}
              onChange={e => setComments(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setAction(null)} className="flex-1">Cancel</Button>
              <Button
                onClick={() => mutation.mutate()}
                variant={action === 'reject' ? 'destructive' : 'default'}
                disabled={mutation.isPending}
                className="flex-1"
              >
                {mutation.isPending ? 'Processing...' : `Confirm ${action}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
