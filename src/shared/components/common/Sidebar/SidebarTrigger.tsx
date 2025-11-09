import { PanelLeft } from 'lucide-react';
import { Button, useSidebar } from '@/shared/components';

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button data-sidebar="trigger" variant="ghost" size="icon" onClick={toggleSidebar}>
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
