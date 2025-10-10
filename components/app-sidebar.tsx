"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  Package,
  Plug,
  FolderOpen,
  Building,
  Key,
  LayoutDashboard
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Updated data based on Prisma schema models
const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Syslog Admin",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Admin Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Admins",
          url: "/dashboard/admins",
        },
        {
          title: "Sessions",
          url: "/dashboard/sessions",
        },
      ],
    },
    {
      title: "Packages",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Package List",
          url: "/dashboard/packages",
        },
        {
          title: "Ports",
          url: "/dashboard/ports",
        },
      ],
    },
    {
      title: "Projects",
      url: "#",
      icon: FolderOpen,
      items: [
        {
          title: "Project List",
          url: "/dashboard/projects",
        },
        {
          title: "Activation Keys",
          url: "/dashboard/activation-keys",
        },
      ],
    },
    {
      title: "Resellers",
      url: "#",
      icon: Building,
      items: [
        {
          title: "Reseller List",
          url: "/dashboard/resellers",
        },
        {
          title: "Companies",
          url: "/dashboard/companies",
        },
      ],
    },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "API Reference",
    //       url: "#",
    //     },
    //     {
    //       title: "User Guides",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/settings",
        },
        {
          title: "Database",
          url: "/dashboard/database",
        },
        {
          title: "Security",
          url: "/dashboard/security",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    }
    // {
    //   name: "Network Monitoring",
    //   url: "#",
    //   icon: PieChart,
    // },
    // {
    //   name: "Device Management",
    //   url: "#",
    //   icon: Map,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}