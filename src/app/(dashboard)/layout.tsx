'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { hydrate } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    hydrate()
    if (!localStorage.getItem('token')) {
      router.replace('/login')
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
