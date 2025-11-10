import { BarChart3, MessageSquare, Globe2, Zap, Swords, Settings, CreditCard, Briefcase } from 'lucide-react';
import { WorkspaceSwitcher } from '@/features/workspace/components/workspace-switcher';
import { ThemeSwitcher, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, NavMain } from '@/shared/components';
import { NavUser } from '@/features/auth/components';

const data = {
  // Main navigation group (merged with preferences)
  mainNav: [
    {
      title: 'Dashboard',
      url: '/',
      icon: BarChart3,
    },
    {
      title: 'Chat Responses',
      url: '/chat-responses',
      icon: MessageSquare,
    },
    {
      title: 'Sources',
      url: '/sources',
      icon: Globe2,
    },
    {
      title: 'Prompts',
      url: '/prompts',
      icon: Zap,
    },
    {
      title: 'Competitors',
      url: '/competitors',
      icon: Swords,
    },
  ],
  // Settings group
  settings: [
    {
      title: 'Workspaces',
      url: '/workspaces',
      icon: Briefcase,
    },
    {
      title: 'Workspace Settings',
      url: '/workspace',
      icon: Settings,
    },
    {
      title: 'Billing & Usage',
      url: '/billing',
      icon: CreditCard,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain mainNav={data.mainNav} settings={data.settings} />
      </SidebarContent>
      <SidebarFooter>
        <div className="mt-auto space-y-2">
          <ThemeSwitcher />
          <NavUser />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
