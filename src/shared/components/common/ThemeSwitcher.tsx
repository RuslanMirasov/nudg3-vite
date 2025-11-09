import { useEffect, useState } from 'react';
//import { IconMoon, IconSun, IconDevices } from '@tabler/icons-react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button, useSidebar } from '@/shared/components';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components';

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const { state } = useSidebar();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-10 w-full justify-start px-2">
        {/* <IconSun className="h-5 w-5" /> */}
        <Sun className="h-5 w-5" />
        {state === 'expanded' && <span className="ml-2 text-sm font-medium">Theme</span>}
      </Button>
    );
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  //   const getThemeIcon = () => {
  //     switch (theme) {
  //       case 'dark':
  //         return <IconMoon className="h-5 w-5" />;
  //       case 'light':
  //         return <IconSun className="h-5 w-5" />;
  //       case 'system':
  //         return <IconDevices className="h-5 w-5" />;
  //       default:
  //         return <IconSun className="h-5 w-5" />;
  //     }
  //   };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-full justify-start px-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          {getThemeIcon()}
          {state === 'expanded' && <span className="ml-2 text-sm font-medium">Theme</span>}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 ml-2">
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
          {/* <IconSun className="mr-3 h-4 w-4" /> */}
          <Sun className="mr-3 h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
          {/* <IconMoon className="mr-3 h-4 w-4" /> */}
          <Moon className="mr-3 h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
          {/* <IconDevices className="mr-3 h-4 w-4" /> */}
          <Monitor className="mr-3 h-4 w-4" />
          <span>System</span>
          {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
