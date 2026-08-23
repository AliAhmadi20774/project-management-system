"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  IconDotsVertical,
  IconUserCircle,
  IconBell,
  IconSettings,
  IconLogout,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";

import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

function initials(firstName: string, lastName: string, username: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || username.slice(0, 2);
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  if (!user) return null;

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
  const userInitials = initials(user.first_name, user.last_name, user.username);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback></Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <IconDotsVertical className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback></Avatar>
                <div className="grid flex-1 leading-tight">
                  <span className="truncate text-sm font-medium">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild><Link href="/profile"><IconUserCircle className="size-4" /> Account</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/notifications"><IconBell className="size-4" /> Notifications</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/settings"><IconSettings className="size-4" /> Settings</Link></DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
              {resolvedTheme === "dark" ? <IconSun className="size-4" /> : <IconMoon className="size-4" />} Toggle theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}><IconLogout className="size-4" /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
