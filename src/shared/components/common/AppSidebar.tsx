import { BarChart3, MessageSquare, Globe2, Zap, Swords, Settings, CreditCard, Briefcase } from 'lucide-react';
// import { WorkspaceSwitcher } from '@/components/common/workspace-switcher';
import { ThemeSwitcher } from '@/shared/components';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, NavMain, NavUser } from '@/shared/components';

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
      <SidebarHeader>{/* <WorkspaceSwitcher /> */}sss</SidebarHeader>
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
