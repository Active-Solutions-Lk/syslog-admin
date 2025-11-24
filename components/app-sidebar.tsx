import * as React from "react";
import { getCurrentUserData } from "@/components/auth/user-data";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Updated data using string identifiers for icons
const data = {
  teams: [
    {
      name: "Syslog Admin",
      logo: "GalleryVerticalEnd",
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Projects",
      url: "#",
      icon: "FolderOpen",
      items: [
        {
          title: "Project List",
          url: "/dashboard/projects",
        },
        {
          title: "Ports",
          url: "/dashboard/ports",
        },
        {
          title: "Collectors",
          url: "/dashboard/collectors",
        },
      ],
    },
    {
      title: "Packages",
      url: "#",
      icon: "Package",
      items: [
        {
          title: "Package List",
          url: "/dashboard/packages",
        },
        
      ],
    },
    
    {
      title: "Customers",
      url: "#",
      icon: "Building",
      items: [
        {
          title: "Reseller List",
          url: "/dashboard/resellers",
        },
         {
          title: "End Customer List",
          url: "/dashboard/end-customer",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: "Settings2",
      items: [
        {
          title: "General",
          url: "/dashboard/settings",
        },
        {
          title: "Admins",
          url: "/dashboard/admins",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: "LayoutDashboard",
    },
  ],
};

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // Fetch user data on the server side
  const user = await getCurrentUserData();

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
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
