export type Role = 'ADMIN' | 'MANAGER' | 'HR' | 'DIRECTOR' | 'EMPLOYEE'

export interface User {
  token: string
  email: string
  role: Role
  name: string
}

export interface WorkflowRequest {
  id: number
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  requesterName: string
  requesterEmail: string
  templateName: string
  currentStep: number
  totalSteps: number
  createdAt: string
  updatedAt: string
}

export interface ApprovalStep {
  id: number
  stepOrder: number
  stepName: string
  approverRole: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED'
  approverName?: string
  comments?: string
  actionedAt?: string
}

export interface WorkflowTemplate {
  id: number
  name: string
  description: string
  isActive: boolean
  steps: TemplateStep[]
}

export interface TemplateStep {
  stepOrder: number
  stepName: string
  approverRole: string
  description?: string
}

export interface AnalyticsData {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  averageApprovalTime: number
}
