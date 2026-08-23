import {
  IconLayoutDashboard,
  IconChartBar,
  IconShoppingCart,
  IconUsers,
  IconCreditCard,
  IconBox,
  IconMessageCircle,
  IconLayoutKanban,
  IconCalendarEvent,
  IconChecklist,
  IconMail,
  IconUserCircle,
  IconSettings,
  IconTag,
  IconFileInvoice,
  IconLockAccess,
  IconHelpCircle,
  IconSparkles,
  IconFolders,
  IconUsersGroup,
  IconActivity,
  IconPuzzle,
  IconBell,
  IconNotes,
  IconFolder,
  IconTable,
  IconChartPie,
  IconForms,
  IconComponents,
  IconMoodEmpty,
  IconRocket,
  IconWorld,
  IconAlertTriangle,
  IconReportAnalytics,
  IconCategory,
  IconPackages,
  IconDiscount2,
  IconTruck,
  IconStar,
  IconShoppingBag,
  IconShieldLock,
  IconAddressBook,
  IconLifebuoy,
  IconArticle,
  IconCode,
  IconSearch,
  IconCoin,
  IconStethoscope,
  IconTruckDelivery,
  IconBriefcase,
  IconBuildingSkyscraper,
  type Icon,
} from "@tabler/icons-react";

export type Workspace = {
  name: string;
  plan: string;
  icon: Icon;
};

export const workspaces: Workspace[] = [
  { name: "OrbynAdmin", plan: "Enterprise", icon: IconSparkles },
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
      { title: "E-Commerce", url: "/dashboard/ecommerce", icon: IconShoppingCart },
      { title: "CRM", url: "/dashboard/crm", icon: IconUsers },
      { title: "Crypto", url: "/dashboard/crypto", icon: IconCoin, badge: "New" },
      { title: "Healthcare", url: "/dashboard/healthcare", icon: IconStethoscope },
      { title: "Logistics", url: "/dashboard/logistics", icon: IconTruckDelivery },
      { title: "Human Resources", url: "/dashboard/hr", icon: IconBriefcase },
      { title: "Real Estate", url: "/dashboard/real-estate", icon: IconBuildingSkyscraper },
    ],
  },
  {
    label: "E-Commerce",
    items: [
      {
        title: "Products",
        icon: IconBox,
        items: [
          { title: "All Products", url: "/products" },
          { title: "Storefront", url: "/storefront" },
          { title: "Add Product", url: "/products/new" },
        ],
      },
      {
        title: "Orders",
        icon: IconShoppingCart,
        items: [
          { title: "All Orders", url: "/orders" },
          { title: "Create Order", url: "/orders/new" },
        ],
      },
      {
        title: "Customers",
        icon: IconUsers,
        items: [
          { title: "All Customers", url: "/customers" },
          { title: "Add Customer", url: "/customers/new" },
        ],
      },
      { title: "Categories", url: "/categories", icon: IconCategory },
      { title: "Inventory", url: "/inventory", icon: IconPackages },
      { title: "Discounts", url: "/discounts", icon: IconDiscount2 },
      { title: "Shipping", url: "/shipping", icon: IconTruck },
      { title: "Reviews", url: "/reviews", icon: IconStar },
      {
        title: "Invoices",
        icon: IconFileInvoice,
        items: [
          { title: "All Invoices", url: "/invoices" },
          { title: "New Invoice", url: "/invoices/new" },
        ],
      },
      {
        title: "Checkout",
        icon: IconShoppingBag,
        items: [
          { title: "Cart", url: "/cart" },
          { title: "Checkout", url: "/checkout" },
        ],
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", url: "/projects", icon: IconFolders, badge: "6" },
      { title: "Team", url: "/team", icon: IconUsersGroup },
      { title: "Roles & Permissions", url: "/roles", icon: IconShieldLock },
      { title: "Contacts", url: "/contacts", icon: IconAddressBook },
      { title: "Activity", url: "/activity", icon: IconActivity },
    ],
  },
  {
    label: "Apps",
    items: [
      { title: "AI Assistant", url: "/apps/ai-chat", icon: IconSparkles, badge: "New" },
      { title: "Chat", url: "/apps/chat", icon: IconMessageCircle },
      { title: "Mail", url: "/apps/mail", icon: IconMail, badge: "5" },
      { title: "Calendar", url: "/apps/calendar", icon: IconCalendarEvent },
      { title: "Kanban", url: "/apps/kanban", icon: IconLayoutKanban },
      { title: "Tasks", url: "/apps/tasks", icon: IconChecklist },
      { title: "Notes", url: "/apps/notes", icon: IconNotes },
      { title: "File Manager", url: "/apps/file-manager", icon: IconFolder },
      {
        title: "Blog",
        icon: IconArticle,
        items: [
          { title: "All Posts", url: "/blog" },
          { title: "New Post", url: "/blog/new" },
        ],
      },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Profile", url: "/profile", icon: IconUserCircle },
      { title: "Settings", url: "/settings", icon: IconSettings },
      { title: "Notifications", url: "/notifications", icon: IconBell, badge: "3" },
      { title: "Developers", url: "/developers", icon: IconCode },
      { title: "Integrations", url: "/integrations", icon: IconPuzzle },
    ],
  },
  {
    label: "Pages",
    items: [
      { title: "Pricing", url: "/pricing", icon: IconTag },
      { title: "Search Results", url: "/search", icon: IconSearch },
      { title: "Support", url: "/support", icon: IconLifebuoy },
      { title: "Help Center", url: "/help", icon: IconHelpCircle },
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
  {
    label: "UI & Examples",
    items: [
      { title: "Data Table", url: "/examples/data-table", icon: IconTable },
      { title: "Charts", url: "/examples/charts", icon: IconChartPie },
      { title: "Form Layouts", url: "/examples/forms", icon: IconForms },
      { title: "UI Elements", url: "/examples/components", icon: IconComponents },
      { title: "Empty States", url: "/examples/empty-states", icon: IconMoodEmpty },
      { title: "Landing Page", url: "/landing", icon: IconWorld },
      { title: "Onboarding", url: "/onboarding", icon: IconRocket },
    ],
  },
];
