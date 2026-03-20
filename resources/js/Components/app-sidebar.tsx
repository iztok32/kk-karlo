import * as React from "react"
import * as Icons from "lucide-react"
import { NavMain } from "@/Components/nav-main"
import { NavProjects } from "@/Components/nav-projects"
import { NavUser } from "@/Components/nav-user"
import { TeamSwitcher } from "@/Components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/Components/ui/sidebar"
import { NavigationItem, User } from "@/types"
import { useTranslation } from "@/lib/i18n"

const IconMapper = (iconName?: string) => {
  if (!iconName) return Icons.HelpCircle;
  const IconComponent = (Icons as any)[iconName];
  return IconComponent || Icons.HelpCircle;
}

export function AppSidebar({ 
    user, 
    navigation, 
    ...props 
}: React.ComponentProps<typeof Sidebar> & { 
    user: User, 
    navigation: { 
        main: NavigationItem[], 
        teams: NavigationItem[], 
        projects: NavigationItem[],
        configs?: Record<string, string>
    } 
}) {
  const { t } = useTranslation();

  const teams = navigation.teams.map(team => ({
    name: t(team.title_key || ''),
    logo: IconMapper(team.icon || undefined),
    plan: team.metadata?.plan || '',
  }));

  const navMain = navigation.main.map(item => ({
    title: t(item.title_key || ''),
    url: item.url || '#',
    icon: IconMapper(item.icon || undefined),
    isActive: false, 
    items: item.children?.map(sub => ({
      title: t(sub.title_key || ''),
      url: sub.url || '#',
    })) || [],
  }));

  const projects = navigation.projects.map(project => ({
    name: t(project.title_key || ''),
    url: project.url || '#',
    icon: IconMapper(project.icon || undefined),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} label={navigation.configs?.main || t("Platform")} />
        <NavProjects projects={projects} label={navigation.configs?.project || t("Projects")} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user.name,
          email: user.email,
          avatar: undefined 
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
