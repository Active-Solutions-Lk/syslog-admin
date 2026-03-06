"use client"

import * as React from "react"
import { ChevronRight, Package, FolderOpen, Building, Settings2, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Map of string identifiers to actual components
const iconMap = {
  Package: Package,
  FolderOpen: FolderOpen,
  Building: Building,
  Settings2: Settings2,
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: string | LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  // Process items to convert string identifiers to actual components
  const processedItems = items.map(item => ({
    ...item,
    icon: typeof item.icon === 'string' 
      ? iconMap[item.icon as keyof typeof iconMap]
      : item.icon
  }))

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Pages</SidebarGroupLabel>
      <SidebarMenu>
        {processedItems.map((item) => {
          // Check if this is the active main item or if any of its sub-items is active
          const isMainItemActive = pathname === item.url
          const isSubItemActive = item.items?.some(subItem => pathname === subItem.url)
          const isItemActive = isMainItemActive || isSubItemActive

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isItemActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={isItemActive}>
                    {item.icon && React.createElement(item.icon)}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubItemActive = pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}