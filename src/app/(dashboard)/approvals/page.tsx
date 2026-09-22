'use client'
import { useQuery } from '@tanstack/react-query'
import { getPendingApprovals } from '@/lib/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function ApprovalsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['pending-approvals'], queryFn: getPendingApprovals })
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Pending Approvals</h1>
      {isLoading ? (
        <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : data?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">All caught up ✓</div>
      ) : (
        <div className="flex flex-col gap-3">
          {data?.map((req: any) => (
            <Link key={req.id} href={`/requests/${req.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{req.title}</p>
                    <p className="text-sm text-muted-foreground">By {req.requesterName} · {req.templateName}</p>
                    <p className="text-xs text-muted-foreground">Step {req.currentStep} of {req.totalSteps}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Awaiting</Badge>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
