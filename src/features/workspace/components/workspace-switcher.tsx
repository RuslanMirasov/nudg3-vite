import { ChevronsUpDown, Plus, Loader2 } from 'lucide-react';
import { useWorkspace } from '@/features/workspace/hooks/useWorkspace';

import {
  FaviconImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components';

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const { workspaces, selectedWorkspace, setSelectedWorkspace, isLoading, error } = useWorkspace();

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm border border-sidebar-border">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
              <span className="truncate text-xs">Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (error || !selectedWorkspace) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm border border-sidebar-border bg-red-50">
              <div className="size-4 bg-red-500 rounded-sm" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No Workspace</span>
              <span className="truncate text-xs text-red-500">{error || 'No workspaces found'}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const renderLogo = (domain?: string) => {
    if (domain) {
      return <FaviconImage domain={domain} name={domain} size={16} className="size-4 rounded-sm" />;
    }

    // Default fallback
    return <div className="size-4 bg-liniar-to-br from-blue-400 to-blue-600 rounded-sm" />;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-sidebar-muted/50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-sidebar-border/50"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-sm border border-sidebar-border">
                {renderLogo(selectedWorkspace.brand_domain ?? undefined)}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{selectedWorkspace.name}</span>
                <span className="truncate text-xs">{selectedWorkspace.brand_name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">Workspaces</DropdownMenuLabel>
            {workspaces.map((workspace, index) => (
              <DropdownMenuItem key={workspace.id} onClick={() => setSelectedWorkspace(workspace)} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border border-sidebar-border">
                  {renderLogo(workspace.brand_domain ?? undefined)}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{workspace.name}</span>
                  <span className="text-xs text-muted-foreground">{workspace.brand_name}</span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
