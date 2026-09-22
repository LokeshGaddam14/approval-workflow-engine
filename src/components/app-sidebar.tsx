'use client'
import { useAuthStore } from '@/store/auth'
import { useRouter, usePathname } from 'next/navigation'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarHeader,
} from '@/components/ui/sidebar'
import { LayoutDashboard, FileText, CheckSquare, BarChart3, Settings, LogOut, Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN','MANAGER','HR','DIRECTOR','EMPLOYEE'] },
  { label: 'My Requests', href: '/requests', icon: FileText, roles: ['EMPLOYEE','ADMIN'] },
  { label: 'New Request', href: '/requests/new', icon: Plus, roles: ['EMPLOYEE'] },
  { label: 'Approvals', href: '/approvals', icon: CheckSquare, roles: ['MANAGER','HR','DIRECTOR','ADMIN'] },
  { label: 'Analytics', href: '/admin', icon: BarChart3, roles: ['ADMIN'] },
  { label: 'Templates', href: '/admin/templates', icon: Settings, roles: ['ADMIN'] },
]

export function AppSidebar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const navItems = NAV.filter(item => item.roles.includes(user?.role || ''))

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">AW</div>
          <div>
            <p className="text-sm font-semibold">Approval Workflow</p>
            <p className="text-xs text-muted-foreground">{user?.name}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => { logout(); router.push('/login') }}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
