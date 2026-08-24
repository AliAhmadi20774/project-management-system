import {
  IconLayoutDashboard,
  IconChartBar,
  IconLayoutKanban,
  IconCalendarEvent,
  IconChecklist,
  IconUserCircle,
  IconSettings,
  IconLockAccess,
  IconSparkles,
  IconFolders,
  IconUsersGroup,
  IconActivity,
  IconBell,
  IconNotes,
  IconRocket,
  IconWorld,
  IconAlertTriangle,
  IconReportAnalytics,
  IconShieldLock,
  IconAddressBook,
  IconSearch,
  type Icon,
} from "@tabler/icons-react";

export type Workspace = {
  name: string;
  plan: string;
  icon: Icon;
};

export const workspaces: Workspace[] = [
  { name: "ProjectHub", plan: "Enterprise", icon: IconSparkles },
  { name: "Vertex Labs", plan: "Startup", icon: IconRocket },
  { name: "Northwind", plan: "Free", icon: IconWorld },
];

export type NavChild = { title: string; url: string };

export type NavItem = {
  title: string;
  url?: string;
  icon?: Icon;
  badge?: string;
  items?: NavChild[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Dashboards",
    items: [
      { title: "Overview", url: "/dashboard", icon: IconLayoutDashboard },
      { title: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
      { title: "Reports", url: "/reports", icon: IconReportAnalytics },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", url: "/projects", icon: IconFolders, badge: "6" },
      { title: "Users", url: "/team", icon: IconUsersGroup },
      { title: "Roles & Permissions", url: "/roles", icon: IconShieldLock },
      { title: "Contacts", url: "/contacts", icon: IconAddressBook },
      { title: "Activity", url: "/activity", icon: IconActivity },
    ],
  },
  {
    label: "Apps",
    items: [
      { title: "Calendar", url: "/apps/calendar", icon: IconCalendarEvent },
      { title: "Kanban", url: "/apps/kanban", icon: IconLayoutKanban },
      { title: "Tasks", url: "/apps/tasks", icon: IconChecklist },
      { title: "Notes", url: "/apps/notes", icon: IconNotes },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Profile", url: "/profile", icon: IconUserCircle },
      { title: "Settings", url: "/settings", icon: IconSettings },
      { title: "Notifications", url: "/notifications", icon: IconBell, badge: "3" },
    ],
  },
  {
    label: "Pages",
    items: [
      { title: "Search Results", url: "/search", icon: IconSearch },
      {
        title: "Authentication",
        icon: IconLockAccess,
        items: [
          { title: "Sign In", url: "/login" },
          { title: "Sign Up", url: "/register" },
          { title: "Forgot Password", url: "/forgot-password" },
          { title: "Reset Password", url: "/reset-password" },
          { title: "Verify OTP", url: "/verify-otp" },
          { title: "Lock Screen", url: "/lock" },
        ],
      },
      {
        title: "Error Pages",
        icon: IconAlertTriangle,
        items: [
          { title: "404 · Not Found", url: "/errors/404" },
          { title: "403 · Forbidden", url: "/errors/403" },
          { title: "500 · Server Error", url: "/errors/500" },
          { title: "503 · Unavailable", url: "/errors/503" },
          { title: "Maintenance", url: "/maintenance" },
          { title: "Coming Soon", url: "/coming-soon" },
        ],
      },
    ],
  },
];
