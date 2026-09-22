"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, defaultOpen = true, open: openProp, onOpenChange, children, ...props }, ref) => {
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp !== undefined ? openProp : _open
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value)
      } else {
        _setOpen(value)
      }
    },
    [onOpenChange]
  )

  const toggleSidebar = React.useCallback(() => {
    setOpen(!open)
  }, [open, setOpen])

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <div
        ref={ref}
        className={cn("flex min-h-screen w-full bg-background", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { open } = useSidebar()

  return (
    <aside
      ref={ref}
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        open ? "w-64" : "w-0 overflow-hidden border-r-0",
        className
      )}
      {...props}
    >
      <div className="flex h-full w-64 flex-col">{children}</div>
    </aside>
  )
})
Sidebar.displayName = "Sidebar"

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-b p-4", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-2", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-t p-2", className)} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1 py-2", className)} {...props} />
))
SidebarGroup.displayName = "SidebarGroup"

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}
    {...props}
  />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("relative list-none", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, asChild = false, isActive, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
        isActive ? "bg-muted text-foreground font-semibold" : "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 flex-col overflow-y-auto", className)}
    {...props}
  />
))
SidebarInset.displayName = "SidebarInset"

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={(e) => {
        onClick?.(e)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"
