"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  // Folder,
  // Forward,
  // MoreHorizontal,
  // Trash2,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  // DropdownMenuContent,
  // DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarMenu,
  // SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  // useSidebar,
} from "@/components/ui/sidebar"

// Map of string identifiers to actual components
const iconMap = {
  LayoutDashboard: LayoutDashboard,
}

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: string | LucideIcon
  }[]
}) {
  // const { isMobile } = useSidebar()
  const pathname = usePathname()

  // Process projects to convert string identifiers to actual components
  const processedProjects = projects.map(project => ({
    ...project,
    icon: typeof project.icon === 'string' 
      ? iconMap[project.icon as keyof typeof iconMap] || LayoutDashboard
      : project.icon
  }))

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {/* <SidebarGroupLabel>Projects</SidebarGroupLabel> */}
      <SidebarMenu>
        {processedProjects.map((item) => {
          const isActive = pathname === item.url
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive}>
                <a href={item.url}>
                  {React.createElement(item.icon)}
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction> */}
                </DropdownMenuTrigger>
                
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
        {/* <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  )
}