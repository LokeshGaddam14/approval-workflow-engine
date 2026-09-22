'use client'
import { useQuery } from '@tanstack/react-query'
import { getMyRequests } from '@/lib/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const statusColor: Record<string, string> = {
  PENDING: 'secondary', IN_PROGRESS: 'default',
  APPROVED: 'default', REJECTED: 'destructive', CANCELLED: 'secondary',
}

export default function RequestsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-requests'], queryFn: getMyRequests })
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Requests</h1>
        <Button asChild><Link href="/requests/new"><Plus className="size-4 mr-2" />New Request</Link></Button>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : data?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No requests yet. <Link href="/requests/new" className="text-primary underline">Submit one</Link>.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {data?.map((req: any) => (
            <Link key={req.id} href={`/requests/${req.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{req.title}</p>
                    <p className="text-sm text-muted-foreground">{req.templateName} · Step {req.currentStep}/{req.totalSteps}</p>
                    <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={statusColor[req.status] as any}>{req.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
