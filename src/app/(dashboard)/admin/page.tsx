'use client'
import { useQuery } from '@tanstack/react-query'
import { getAnalytics, getAllRequests } from '@/lib/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react'

const statusVariant: Record<string, any> = {
  PENDING: 'secondary', IN_PROGRESS: 'default',
  APPROVED: 'default', REJECTED: 'destructive', CANCELLED: 'secondary',
}

export default function AdminPage() {
  const { data: analytics, isLoading: aLoading } = useQuery({ queryKey: ['analytics'], queryFn: getAnalytics })
  const { data: requests, isLoading: rLoading } = useQuery({ queryKey: ['all-requests'], queryFn: getAllRequests })

  const stats = [
    { label: 'Total', value: analytics?.totalRequests, icon: FileText, color: 'text-blue-500' },
    { label: 'Pending', value: analytics?.pendingRequests, icon: Clock, color: 'text-yellow-500' },
    { label: 'Approved', value: analytics?.approvedRequests, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Rejected', value: analytics?.rejectedRequests, icon: XCircle, color: 'text-red-500' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {aLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{stat.value ?? 0}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">All Requests</CardTitle></CardHeader>
        <CardContent>
          {rLoading ? <div className="flex flex-col gap-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
            <div className="flex flex-col">
              {requests?.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{req.title}</p>
                    <p className="text-xs text-muted-foreground">{req.requesterName} · {req.templateName}</p>
                  </div>
                  <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
