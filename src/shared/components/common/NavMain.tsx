import type { LucideIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/shared/components';

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

export function NavMain({ mainNav, settings, currentPath }: { mainNav: NavItem[]; settings: NavItem[]; currentPath?: string }) {
  const renderNavItems = (items: NavItem[]) => {
    return items.map(item => {
      const isActive = currentPath === item.url;
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
            <Link
              to={item.url}
              className={`text-sm font-normal tracking-wide transition-all duration-200 ease-in-out rounded-md px-3 py-2 group ${
                isActive ? 'bg-accent' : ''
              }`}
            >
              {item.icon && (
                <item.icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    isActive ? 'text-black dark:text-white' : 'text-gray-400 dark:text-[#C4C4C4]'
                  }`}
                />
              )}
              <span className="font-medium text-foreground">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <div className="flex flex-col gap-8 py-2">
      {/* General Navigation Group */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">General</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>{renderNavItems(mainNav)}</SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Settings Group */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>{renderNavItems(settings)}</SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
