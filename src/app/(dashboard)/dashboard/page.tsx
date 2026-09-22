'use client'
import { useAuthStore } from '@/store/auth'
import { useQuery } from '@tanstack/react-query'
import { getAnalytics, getMyRequests, getPendingApprovals } from '@/lib/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  if (user?.role === 'ADMIN') return <AdminDashboard />
  if (['MANAGER','HR','DIRECTOR'].includes(user?.role || '')) return <ApproverDashboard />
  return <EmployeeDashboard />
}

function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics'], queryFn: getAnalytics })
  const stats = [
    { label: 'Total Requests', value: data?.totalRequests, icon: FileText, color: 'text-blue-500' },
    { label: 'Pending', value: data?.pendingRequests, icon: Clock, color: 'text-yellow-500' },
    { label: 'Approved', value: data?.approvedRequests, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Rejected', value: data?.rejectedRequests, icon: XCircle, color: 'text-red-500' },
  ]
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{stat.value ?? 0}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ApproverDashboard() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({ queryKey: ['pending-approvals'], queryFn: getPendingApprovals })
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Pending Your Approval</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-12 w-full" /> : <p className="text-4xl font-bold">{data?.length ?? 0}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

function EmployeeDashboard() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({ queryKey: ['my-requests'], queryFn: getMyRequests })
  const counts = {
    Active: data?.filter((r: any) => ['PENDING','IN_PROGRESS'].includes(r.status)).length ?? 0,
    Approved: data?.filter((r: any) => r.status === 'APPROVED').length ?? 0,
    Rejected: data?.filter((r: any) => r.status === 'REJECTED').length ?? 0,
  }
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(counts).map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent>{isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-3xl font-bold">{value}</p>}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
