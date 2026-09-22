'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { login } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Eye, EyeOff, ShieldCheck, UserCheck, Briefcase, User } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { role: 'ADMIN', email: 'admin@workflow.com', label: 'Admin', icon: ShieldCheck },
  { role: 'MANAGER', email: 'manager@workflow.com', label: 'Manager', icon: Briefcase },
  { role: 'HR', email: 'hr@workflow.com', label: 'HR', icon: UserCheck },
  { role: 'EMPLOYEE', email: 'john@workflow.com', label: 'Employee', icon: User },
]

export default function LoginPage() {
  const [email, setEmail] = useState('admin@workflow.com')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      toast.error('Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      const user = await login(cleanEmail, cleanPassword)
      setUser(user)
      toast.success(`Welcome back, ${user.name || user.role}!`)
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      const message = err.response?.data?.message || err.message || 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
    toast.info(`Filled credentials for ${demoEmail}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-2 shadow-sm">
            AW
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Approval Workflow</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@workflow.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="size-3" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="size-3" /> Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="password123"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quick-fill Demo Accounts
              </p>
              <span className="text-[11px] text-muted-foreground">password: password123</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(account => {
                const Icon = account.icon
                const isSelected = email === account.email
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => fillDemo(account.email)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all text-xs ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-[11px]">{account.label}</div>
                      <div className="text-[10px] opacity-75 truncate">{account.email}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
