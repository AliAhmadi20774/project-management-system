// ---------------------------------------------------------------------------
// Fake data for the OrbynAdmin admin template. All figures are illustrative.
// ---------------------------------------------------------------------------

export const revenueByMonth = [
  { month: "Jan", revenue: 18600, orders: 240, profit: 6200 },
  { month: "Feb", revenue: 22050, orders: 298, profit: 7400 },
  { month: "Mar", revenue: 19700, orders: 271, profit: 6800 },
  { month: "Apr", revenue: 27340, orders: 342, profit: 9100 },
  { month: "May", revenue: 31200, orders: 389, profit: 10800 },
  { month: "Jun", revenue: 28900, orders: 361, profit: 9600 },
  { month: "Jul", revenue: 34800, orders: 421, profit: 12200 },
  { month: "Aug", revenue: 38100, orders: 458, profit: 13400 },
  { month: "Sep", revenue: 35600, orders: 432, profit: 12600 },
  { month: "Oct", revenue: 42300, orders: 501, profit: 15100 },
  { month: "Nov", revenue: 46800, orders: 548, profit: 16800 },
  { month: "Dec", revenue: 52400, orders: 612, profit: 19200 },
];

export const visitorsByDay = [
  { date: "Mon", desktop: 1240, mobile: 980 },
  { date: "Tue", desktop: 1480, mobile: 1120 },
  { date: "Wed", desktop: 1360, mobile: 1240 },
  { date: "Thu", desktop: 1720, mobile: 1380 },
  { date: "Fri", desktop: 1920, mobile: 1560 },
  { date: "Sat", desktop: 1120, mobile: 1720 },
  { date: "Sun", desktop: 980, mobile: 1480 },
];

export const trafficSources = [
  { source: "Organic", value: 4820, fill: "var(--chart-1)" },
  { source: "Direct", value: 3210, fill: "var(--chart-2)" },
  { source: "Referral", value: 2140, fill: "var(--chart-3)" },
  { source: "Social", value: 1680, fill: "var(--chart-4)" },
  { source: "Email", value: 940, fill: "var(--chart-5)" },
];

export const salesByCategory = [
  { category: "Electronics", value: 38 },
  { category: "Apparel", value: 24 },
  { category: "Home", value: 18 },
  { category: "Beauty", value: 12 },
  { category: "Other", value: 8 },
];

export type StatCard = {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  hint: string;
};

export const overviewStats: StatCard[] = [
  { label: "Total Revenue", value: "$284,392", change: 12.5, trend: "up", hint: "vs. last month" },
  { label: "New Customers", value: "2,318", change: 8.2, trend: "up", hint: "vs. last month" },
  { label: "Active Accounts", value: "18,472", change: 3.1, trend: "up", hint: "vs. last month" },
  { label: "Churn Rate", value: "1.8%", change: 0.4, trend: "down", hint: "vs. last month" },
];

export const ecommerceStats: StatCard[] = [
  { label: "Gross Sales", value: "$52,420", change: 14.2, trend: "up", hint: "this month" },
  { label: "Orders", value: "612", change: 9.7, trend: "up", hint: "this month" },
  { label: "Avg. Order Value", value: "$85.65", change: 2.3, trend: "up", hint: "this month" },
  { label: "Refunds", value: "$1,240", change: 1.1, trend: "down", hint: "this month" },
];

const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "Lucas", "Mia", "Aiden", "Harper", "James", "Ella", "Benjamin", "Amelia", "Elijah", "Chloe", "Daniel"];
const lastNames = ["Carter", "Reyes", "Nguyen", "Patel", "Kim", "Brooks", "Silva", "Novak", "Haddad", "Rossi", "Weber", "Costa", "Fischer", "Muller", "Ivanov", "Sato", "Cohen", "Bauer", "Lopez", "Dubois"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export type Customer = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  company: string;
  status: "Active" | "Inactive" | "Pending";
  plan: "Free" | "Pro" | "Enterprise";
  spent: number;
  location: string;
  joined: string;
};

const companies = ["Vertex Labs", "Northwind", "Lumen Co", "Aperture", "Blue Harbor", "Sunroot", "Kite Digital", "Foundry", "Meridian", "Ironclad", "Wavelength", "Silverpeak"];
const locations = ["San Francisco, US", "London, UK", "Berlin, DE", "Toronto, CA", "Sydney, AU", "Tokyo, JP", "Paris, FR", "Austin, US", "Amsterdam, NL", "Singapore, SG"];
const plans: Customer["plan"][] = ["Free", "Pro", "Enterprise"];
const statuses: Customer["status"][] = ["Active", "Inactive", "Pending"];

export const customers: Customer[] = Array.from({ length: 48 }, (_, i) => {
  const first = pick(firstNames, i * 3);
  const last = pick(lastNames, i * 5 + 2);
  const name = `${first} ${last}`;
  return {
    id: `CUS-${(1042 + i).toString()}`,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${pick(companies, i).toLowerCase().replace(/\s/g, "")}.com`,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${(i % 70) + 1}`,
    company: pick(companies, i),
    status: pick(statuses, i + (i % 4)),
    plan: pick(plans, i + (i % 3)),
    spent: 480 + ((i * 137) % 9200),
    location: pick(locations, i * 2),
    joined: new Date(2024, i % 12, ((i * 7) % 27) + 1).toISOString().slice(0, 10),
  };
});

export type Order = {
  id: string;
  customer: string;
  avatar: string;
  product: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Refunded" | "Failed";
  method: string;
};

const products = ["Aurora Headphones", "Nimbus Keyboard", "Pulse Watch", "Vega Monitor", "Orbit Mouse", "Lumina Lamp", "Echo Speaker", "Zephyr Drone", "Cobalt Charger", "Terra Backpack"];
const methods = ["Visa", "Mastercard", "PayPal", "Apple Pay", "Amex"];
const orderStatuses: Order["status"][] = ["Paid", "Pending", "Refunded", "Failed"];

export const orders: Order[] = Array.from({ length: 40 }, (_, i) => {
  const first = pick(firstNames, i * 2 + 1);
  const last = pick(lastNames, i * 3);
  return {
    id: `#ORD-${7100 + i}`,
    customer: `${first} ${last}`,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${((i + 12) % 70) + 1}`,
    product: pick(products, i),
    date: new Date(2026, 6, ((i * 3) % 27) + 1).toISOString().slice(0, 10),
    amount: 29 + ((i * 53) % 940),
    status: pick(orderStatuses, i + (i % 5)),
    method: pick(methods, i),
  };
});

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  image: string;
};

// Each product name maps to a sensible category so labels read realistically
// (a keyboard is Electronics, not Apparel). Category filters/charts stay varied.
const categoryByProduct: Record<string, string> = {
  "Aurora Headphones": "Electronics",
  "Nimbus Keyboard": "Electronics",
  "Pulse Watch": "Sports",
  "Vega Monitor": "Electronics",
  "Orbit Mouse": "Electronics",
  "Lumina Lamp": "Home",
  "Echo Speaker": "Home",
  "Zephyr Drone": "Sports",
  "Cobalt Charger": "Electronics",
  "Terra Backpack": "Sports",
};

export const productList: Product[] = Array.from({ length: 24 }, (_, i) => {
  const stock = (i * 17) % 140;
  const name = pick(products, i);
  return {
    id: `PRD-${200 + i}`,
    name,
    category: categoryByProduct[name] ?? "Electronics",
    price: 19 + ((i * 41) % 480),
    stock,
    sold: 40 + ((i * 89) % 1200),
    status: stock === 0 ? "Out of Stock" : stock < 20 ? "Low Stock" : "In Stock",
    image: `https://api.dicebear.com/9.x/shapes/svg?seed=prd${i}`,
  };
});

// Top sellers: dedupe by name (keep the best-selling variant) so the showcase
// list never repeats a product.
export const topProducts = (() => {
  const seen = new Set<string>();
  return productList
    .slice()
    .sort((a, b) => b.sold - a.sold)
    .filter((p) => (seen.has(p.name) ? false : seen.add(p.name)))
    .slice(0, 5);
})();

export type Activity = {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
};

export const recentActivity: Activity[] = [
  { id: "a1", user: "Emma Carter", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", action: "created a new order", target: "#ORD-7241", time: "2 min ago" },
  { id: "a2", user: "Liam Nguyen", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=12", action: "upgraded to", target: "Enterprise plan", time: "18 min ago" },
  { id: "a3", user: "Olivia Patel", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", action: "left a review on", target: "Pulse Watch", time: "1 hour ago" },
  { id: "a4", user: "Noah Kim", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=13", action: "requested a refund for", target: "#ORD-7188", time: "3 hours ago" },
  { id: "a5", user: "Ava Brooks", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9", action: "invited a teammate to", target: "Vertex Labs", time: "5 hours ago" },
  { id: "a6", user: "Ethan Silva", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=15", action: "completed onboarding", target: "", time: "Yesterday" },
];

export const currentUser = {
  name: "Alex Morgan",
  email: "alex.morgan@orbynadmin.com",
  role: "Administrator",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8",
};

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export type InvoiceItem = {
  description: string;
  qty: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  number: string;
  client: string;
  clientEmail: string;
  company: string;
  avatar: string;
  issued: string;
  due: string;
  status: "Paid" | "Pending" | "Overdue" | "Draft";
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  amount: number;
};

const lineItemCatalog = [
  { description: "Enterprise plan — annual license", unitPrice: 1200 },
  { description: "Pro plan — monthly subscription", unitPrice: 49 },
  { description: "Additional team seats", unitPrice: 15 },
  { description: "Onboarding & implementation", unitPrice: 750 },
  { description: "Priority support (SLA)", unitPrice: 300 },
  { description: "Custom integration development", unitPrice: 480 },
  { description: "Analytics add-on", unitPrice: 120 },
  { description: "Extra storage (100 GB)", unitPrice: 25 },
];

const invoiceStatuses: Invoice["status"][] = ["Paid", "Pending", "Overdue", "Draft"];

export const invoices: Invoice[] = Array.from({ length: 14 }, (_, i) => {
  const cust = customers[(i * 3 + 1) % customers.length];
  const itemCount = (i % 3) + 1;
  const items: InvoiceItem[] = Array.from({ length: itemCount }, (_, j) => {
    const cat = lineItemCatalog[(i * 2 + j) % lineItemCatalog.length];
    return { description: cat.description, qty: ((i + j) % 4) + 1, unitPrice: cat.unitPrice };
  });
  const subtotal = items.reduce((a, b) => a + b.qty * b.unitPrice, 0);
  const tax = Math.round(subtotal * 0.08);
  return {
    id: `INV-${2043 + i}`,
    number: `INV-${2043 + i}`,
    client: cust.name,
    clientEmail: cust.email,
    company: cust.company,
    avatar: cust.avatar,
    issued: new Date(2026, 5 + (i % 2), ((i * 5) % 27) + 1).toISOString().slice(0, 10),
    due: new Date(2026, 6 + (i % 2), ((i * 5) % 27) + 1).toISOString().slice(0, 10),
    status: invoiceStatuses[i % invoiceStatuses.length],
    items,
    subtotal,
    tax,
    amount: subtotal + tax,
  };
});

// ---------------------------------------------------------------------------
// Lookup helpers (used by detail pages)
// ---------------------------------------------------------------------------

export const getCustomerById = (id: string) =>
  customers.find((c) => c.id === id);

export const getOrderById = (id: string) =>
  orders.find((o) => o.id === id || o.id === `#${id}` || o.id.replace("#", "") === id);

export const getProductById = (id: string) =>
  productList.find((p) => p.id === id);

export const getInvoiceById = (id: string) =>
  invoices.find((inv) => inv.id === id);

export const company = {
  name: "OrbynAdmin",
  email: "billing@orbynadmin.com",
  address: "2100 Market Street, Suite 400",
  city: "San Francisco, CA 94114",
  country: "United States",
  phone: "+1 (415) 555-0142",
  taxId: "US-482910573",
};

// ---------------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------------

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar: string;
  status: "Active" | "Away" | "Offline";
  location: string;
};

export const team: TeamMember[] = [
  { id: "TM-01", name: "Alex Morgan", role: "Head of Product", department: "Product", email: "alex.morgan@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8", status: "Active", location: "San Francisco, US" },
  { id: "TM-02", name: "Sofia Rossi", role: "Head of Growth", department: "Marketing", email: "sofia.rossi@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=32", status: "Active", location: "Milan, IT" },
  { id: "TM-03", name: "Marcus Chen", role: "Staff Engineer", department: "Engineering", email: "marcus.chen@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=33", status: "Away", location: "Singapore, SG" },
  { id: "TM-04", name: "Priya Nair", role: "Product Designer", department: "Design", email: "priya.nair@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=45", status: "Active", location: "Bangalore, IN" },
  { id: "TM-05", name: "Daniel Weber", role: "Backend Engineer", department: "Engineering", email: "daniel.weber@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=52", status: "Offline", location: "Berlin, DE" },
  { id: "TM-06", name: "Hannah Kim", role: "Customer Success Lead", department: "Success", email: "hannah.kim@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=47", status: "Active", location: "Seoul, KR" },
  { id: "TM-07", name: "Lucas Silva", role: "Data Analyst", department: "Data", email: "lucas.silva@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=59", status: "Active", location: "São Paulo, BR" },
  { id: "TM-08", name: "Emma Novak", role: "Frontend Engineer", department: "Engineering", email: "emma.novak@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=41", status: "Away", location: "Toronto, CA" },
  { id: "TM-09", name: "Omar Haddad", role: "DevOps Engineer", department: "Engineering", email: "omar.haddad@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=60", status: "Active", location: "Dubai, AE" },
  { id: "TM-10", name: "Chloe Dubois", role: "Content Strategist", department: "Marketing", email: "chloe.dubois@orbynadmin.com", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=44", status: "Offline", location: "Paris, FR" },
];

export const getTeamMember = (i: number) => team[i % team.length];

// ---------------------------------------------------------------------------
// Projects & tasks (project-management module)
// ---------------------------------------------------------------------------

export type ProjectStatus = "On Track" | "At Risk" | "Delayed" | "Completed";
export type TaskStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: TeamMember;
  labels: string[];
  projectId: string;
  start: string;
  due: string;
  points: number;
  comments: number;
  subtasks: { total: number; done: number };
};

export type Milestone = { title: string; date: string; done: boolean };

export type Project = {
  id: string;
  name: string;
  key: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  color: string;
  category: string;
  lead: TeamMember;
  members: TeamMember[];
  start: string;
  due: string;
  budget: number;
  spent: number;
  taskCounts: { total: number; done: number };
  milestones: Milestone[];
};

const projectSeeds = [
  { name: "Mobile App Revamp", key: "MOB", category: "Product", color: "var(--chart-1)", status: "On Track" as ProjectStatus, progress: 68, desc: "Rebuild the iOS & Android apps on a shared design system with offline support." },
  { name: "Billing Platform v2", key: "BILL", category: "Engineering", color: "var(--chart-2)", status: "At Risk" as ProjectStatus, progress: 42, desc: "Migrate invoicing and subscriptions to the new metered billing engine." },
  { name: "Website Redesign", key: "WEB", category: "Marketing", color: "var(--chart-3)", status: "On Track" as ProjectStatus, progress: 81, desc: "Refresh orbynadmin.com with a new brand, CMS and localized landing pages." },
  { name: "Data Warehouse", key: "DATA", category: "Data", color: "var(--chart-4)", status: "Delayed" as ProjectStatus, progress: 34, desc: "Consolidate product analytics into a governed warehouse with dbt models." },
  { name: "Onboarding Overhaul", key: "ONB", category: "Product", color: "var(--chart-5)", status: "On Track" as ProjectStatus, progress: 55, desc: "Redesign activation flow to lift week-1 retention with checklists & tours." },
  { name: "SOC 2 Compliance", key: "SEC", category: "Security", color: "var(--chart-1)", status: "Completed" as ProjectStatus, progress: 100, desc: "Achieve SOC 2 Type II with audited controls, policies and monitoring." },
];

export const projects: Project[] = projectSeeds.map((p, i) => {
  const memberCount = 3 + (i % 4);
  const members = Array.from({ length: memberCount }, (_, j) => getTeamMember(i + j));
  const total = 18 + ((i * 7) % 22);
  const done = Math.round((total * p.progress) / 100);
  return {
    id: `PRJ-${101 + i}`,
    name: p.name,
    key: p.key,
    description: p.desc,
    status: p.status,
    progress: p.progress,
    color: p.color,
    category: p.category,
    lead: getTeamMember(i),
    members,
    start: new Date(2026, 3 + (i % 3), ((i * 4) % 20) + 1).toISOString().slice(0, 10),
    due: new Date(2026, 8 + (i % 3), ((i * 6) % 25) + 1).toISOString().slice(0, 10),
    budget: 40000 + i * 15000,
    spent: Math.round((40000 + i * 15000) * (p.progress / 100) * 0.9),
    taskCounts: { total, done },
    milestones: [
      { title: "Kickoff & discovery", date: "2026-04-12", done: true },
      { title: "Design sign-off", date: "2026-05-28", done: p.progress > 40 },
      { title: "Beta release", date: "2026-07-15", done: p.progress > 70 },
      { title: "General availability", date: "2026-09-30", done: p.progress === 100 },
    ],
  };
});

export const getProjectById = (id: string) => projects.find((p) => p.id === id);

const taskTitles = [
  "Design new onboarding checklist", "Fix flaky auth integration tests", "Implement metered usage events",
  "Migrate legacy invoice PDFs", "Add dark mode to marketing site", "Set up dbt staging models",
  "Write API rate-limit middleware", "Ship push notifications", "Redesign settings page",
  "Add SSO / SAML provisioning", "Instrument activation funnel", "Localize pricing page (DE/FR)",
  "Build billing webhooks retry", "Create component storybook", "Audit accessibility (WCAG AA)",
  "Optimize dashboard query latency", "Add CSV import for contacts", "Set up incident runbooks",
  "Refactor navigation sidebar", "Draft SOC 2 access policy", "Add empty states across app",
  "Wire up Slack notifications", "Improve search relevance", "Reduce cold-start bundle size",
];
const allTaskStatuses: TaskStatus[] = ["Backlog", "Todo", "In Progress", "In Review", "Done"];
const allPriorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
const labelPool = ["frontend", "backend", "design", "bug", "feature", "infra", "docs", "research"];

export const projectTasks: Task[] = taskTitles.map((title, i) => {
  const project = projects[i % projects.length];
  const total = (i % 4) + 1;
  const statusIdx = i % allTaskStatuses.length;
  return {
    id: `TASK-${1200 + i}`,
    title,
    status: allTaskStatuses[statusIdx],
    priority: allPriorities[(i * 3) % allPriorities.length],
    assignee: getTeamMember(i + 2),
    labels: [labelPool[i % labelPool.length], labelPool[(i * 5 + 2) % labelPool.length]].filter((v, idx, a) => a.indexOf(v) === idx),
    projectId: project.id,
    start: new Date(2026, 6, ((i * 2) % 20) + 1).toISOString().slice(0, 10),
    due: new Date(2026, 6, ((i * 3) % 24) + 4).toISOString().slice(0, 10),
    points: [1, 2, 3, 5, 8][i % 5],
    comments: (i * 3) % 9,
    subtasks: { total, done: statusIdx === 4 ? total : i % (total + 1) },
  };
});

export const tasksForProject = (projectId: string) =>
  projectTasks.filter((t) => t.projectId === projectId);

// ---------------------------------------------------------------------------
// File manager
// ---------------------------------------------------------------------------

export type FileNode = {
  id: string;
  name: string;
  kind: "folder" | "image" | "document" | "video" | "audio" | "archive" | "code";
  size: string;
  modified: string;
  owner: TeamMember;
  items?: number;
  starred?: boolean;
};

export const files: FileNode[] = [
  { id: "F-01", name: "Brand Assets", kind: "folder", size: "—", items: 128, modified: "2026-07-10", owner: getTeamMember(3), starred: true },
  { id: "F-02", name: "Product Specs", kind: "folder", size: "—", items: 64, modified: "2026-07-12", owner: getTeamMember(0) },
  { id: "F-03", name: "Marketing", kind: "folder", size: "—", items: 42, modified: "2026-07-08", owner: getTeamMember(1) },
  { id: "F-04", name: "Engineering", kind: "folder", size: "—", items: 210, modified: "2026-07-14", owner: getTeamMember(2), starred: true },
  { id: "F-05", name: "Q3-roadmap.pdf", kind: "document", size: "2.4 MB", modified: "2026-07-15", owner: getTeamMember(0) },
  { id: "F-06", name: "hero-shot-final.png", kind: "image", size: "5.1 MB", modified: "2026-07-13", owner: getTeamMember(3) },
  { id: "F-07", name: "demo-walkthrough.mp4", kind: "video", size: "84 MB", modified: "2026-07-11", owner: getTeamMember(1) },
  { id: "F-08", name: "pricing-tiers.xlsx", kind: "document", size: "412 KB", modified: "2026-07-09", owner: getTeamMember(6) },
  { id: "F-09", name: "logo-pack.zip", kind: "archive", size: "18 MB", modified: "2026-07-07", owner: getTeamMember(3) },
  { id: "F-10", name: "api-reference.md", kind: "code", size: "96 KB", modified: "2026-07-14", owner: getTeamMember(2) },
  { id: "F-11", name: "onboarding-voiceover.mp3", kind: "audio", size: "12 MB", modified: "2026-07-06", owner: getTeamMember(9) },
  { id: "F-12", name: "customer-interviews.pdf", kind: "document", size: "3.8 MB", modified: "2026-07-05", owner: getTeamMember(5) },
];

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export type Integration = {
  id: string;
  name: string;
  category: string;
  description: string;
  connected: boolean;
  initial: string;
  color: string;
};

export const integrations: Integration[] = [
  { id: "IN-01", name: "Slack", category: "Communication", description: "Get alerts and updates in your channels.", connected: true, initial: "S", color: "oklch(0.62 0.19 25)" },
  { id: "IN-02", name: "GitHub", category: "Developer", description: "Link pull requests and deployments.", connected: true, initial: "G", color: "oklch(0.4 0 0)" },
  { id: "IN-03", name: "Stripe", category: "Payments", description: "Sync invoices, subscriptions and payouts.", connected: true, initial: "S", color: "oklch(0.55 0.2 285)" },
  { id: "IN-04", name: "Figma", category: "Design", description: "Embed designs and prototypes.", connected: false, initial: "F", color: "oklch(0.62 0.21 25)" },
  { id: "IN-05", name: "Notion", category: "Productivity", description: "Link docs and knowledge base.", connected: false, initial: "N", color: "oklch(0.3 0 0)" },
  { id: "IN-06", name: "Linear", category: "Developer", description: "Two-way sync issues and cycles.", connected: true, initial: "L", color: "oklch(0.55 0.22 275)" },
  { id: "IN-07", name: "Google Drive", category: "Storage", description: "Attach files from Drive.", connected: false, initial: "D", color: "oklch(0.7 0.17 145)" },
  { id: "IN-08", name: "Zoom", category: "Communication", description: "Start meetings from any record.", connected: false, initial: "Z", color: "oklch(0.6 0.2 255)" },
  { id: "IN-09", name: "HubSpot", category: "Marketing", description: "Sync contacts and campaigns.", connected: false, initial: "H", color: "oklch(0.65 0.2 35)" },
  { id: "IN-10", name: "Jira", category: "Developer", description: "Import epics and sprints.", connected: false, initial: "J", color: "oklch(0.58 0.2 260)" },
  { id: "IN-11", name: "Intercom", category: "Support", description: "See conversations inline.", connected: true, initial: "I", color: "oklch(0.6 0.18 245)" },
  { id: "IN-12", name: "Segment", category: "Data", description: "Stream events to your warehouse.", connected: false, initial: "S", color: "oklch(0.7 0.18 155)" },
];

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotificationKind = "mention" | "comment" | "assign" | "system" | "billing" | "deploy";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  actor?: TeamMember;
  time: string;
  read: boolean;
};

export const notifications: Notification[] = [
  { id: "N-01", kind: "mention", title: "Priya Nair mentioned you", description: "“@alex can you review the new onboarding checklist?” in Mobile App Revamp", actor: getTeamMember(3), time: "2 min ago", read: false },
  { id: "N-02", kind: "assign", title: "New task assigned", description: "You were assigned “Implement metered usage events” in Billing Platform v2", actor: getTeamMember(2), time: "25 min ago", read: false },
  { id: "N-03", kind: "comment", title: "Marcus Chen commented", description: "Left a comment on “Add SSO / SAML provisioning”", actor: getTeamMember(2), time: "1 hour ago", read: false },
  { id: "N-04", kind: "deploy", title: "Deployment succeeded", description: "web-app v2.14.0 deployed to production in 3m 12s", time: "2 hours ago", read: true },
  { id: "N-05", kind: "billing", title: "Payment received", description: "Invoice INV-2043 was paid by Northwind — $1,296.00", time: "4 hours ago", read: true },
  { id: "N-06", kind: "system", title: "New sign-in detected", description: "A new sign-in from Chrome on macOS in San Francisco", time: "6 hours ago", read: true },
  { id: "N-07", kind: "comment", title: "Sofia Rossi commented", description: "“Looks great — shipping the localized pages next week.”", actor: getTeamMember(1), time: "Yesterday", read: true },
  { id: "N-08", kind: "mention", title: "Hannah Kim mentioned you", description: "“@alex a customer asked about the Q3 roadmap.”", actor: getTeamMember(5), time: "Yesterday", read: true },
  { id: "N-09", kind: "assign", title: "Milestone due soon", description: "“Beta release” for Mobile App Revamp is due in 3 days", time: "2 days ago", read: true },
  { id: "N-10", kind: "system", title: "Storage at 82%", description: "Your workspace is approaching its storage limit", time: "3 days ago", read: true },
];

// ---------------------------------------------------------------------------
// Crypto / Web3 dashboard. Token names and tickers are real; figures, balances
// and on-chain activity are illustrative. Coin icons are inline brand marks
// (see components/crypto-icon.tsx).
// ---------------------------------------------------------------------------

export type CryptoAsset = {
  symbol: string;
  name: string;
  chain: string;
  price: number;
  change24h: number; // percent, +/-
  holdings: number; // units held
  color: string; // brand-ish color for the monogram badge
  spark: number[]; // 7-day price trend for the sparkline
};

export const cryptoAssets: CryptoAsset[] = [
  { symbol: "BTC", name: "Bitcoin", chain: "Bitcoin", price: 68214.32, change24h: 2.4, holdings: 0.684, color: "#F7931A", spark: [64100, 63800, 65200, 66100, 65700, 67300, 68214] },
  { symbol: "ETH", name: "Ethereum", chain: "Ethereum", price: 3541.08, change24h: 3.8, holdings: 9.2, color: "#627EEA", spark: [3280, 3325, 3298, 3410, 3388, 3472, 3541] },
  { symbol: "SOL", name: "Solana", chain: "Solana", price: 168.24, change24h: 7.1, holdings: 120, color: "#14B8A6", spark: [141, 148, 152, 149, 158, 163, 168] },
  { symbol: "BNB", name: "BNB", chain: "BNB Chain", price: 592.4, change24h: -1.2, holdings: 14, color: "#D9A400", spark: [612, 604, 598, 601, 595, 599, 592] },
  { symbol: "USDC", name: "USD Coin", chain: "Ethereum", price: 1.0, change24h: 0.0, holdings: 12000, color: "#2775CA", spark: [1, 1, 1, 1, 1, 1, 1] },
  { symbol: "XRP", name: "XRP", chain: "XRP Ledger", price: 0.62, change24h: -2.8, holdings: 9000, color: "#475569", spark: [0.66, 0.65, 0.64, 0.63, 0.64, 0.63, 0.62] },
  { symbol: "ADA", name: "Cardano", chain: "Cardano", price: 0.46, change24h: 4.2, holdings: 6500, color: "#2B6BE4", spark: [0.42, 0.43, 0.44, 0.43, 0.45, 0.45, 0.46] },
  { symbol: "POL", name: "Polygon", chain: "Polygon", price: 0.72, change24h: -3.4, holdings: 700, color: "#7C3AED", spark: [0.78, 0.76, 0.75, 0.74, 0.73, 0.74, 0.72] },
];

// Portfolio value over several time ranges, generated deterministically at
// module load (never during render). Ends near the current portfolio total.
function genSeries(
  labels: string[],
  start: number,
  end: number,
  volatility: number,
  seed: number
): { t: string; value: number }[] {
  const n = labels.length;
  return labels.map((t, i) => {
    const p = n === 1 ? 1 : i / (n - 1);
    const trend = start + (end - start) * p;
    const wobble =
      Math.sin(i * 1.7 + seed) * volatility +
      Math.sin(i * 0.6 + seed * 2) * volatility * 0.5;
    return { t, value: Math.max(0, Math.round(trend + wobble)) };
  });
}

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const days30 = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthsYear = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

export const cryptoPortfolioRanges: Record<
  string,
  { t: string; value: number }[]
> = {
  "24H": genSeries(hours, 124600, 128420, 900, 1),
  "7D": genSeries(weekdays, 118200, 128420, 2200, 3),
  "30D": genSeries(days30, 96400, 128420, 3600, 5),
  "1Y": genSeries(monthsYear, 52800, 128420, 6400, 7),
};

export type CryptoTx = {
  id: string;
  type: "Buy" | "Sell" | "Swap" | "Send" | "Receive" | "Stake";
  asset: string; // symbol
  detail?: string; // e.g. swap pair or address
  amount: number; // units
  value: number; // usd
  time: string;
  status: "Completed" | "Pending" | "Failed";
};

export const cryptoTransactions: CryptoTx[] = [
  { id: "TX-9F2A", type: "Buy", asset: "ETH", amount: 1.5, value: 5311.62, time: "2 min ago", status: "Completed" },
  { id: "TX-7C4B", type: "Receive", asset: "USDC", detail: "from 0x8f…3a91", amount: 2500, value: 2500, time: "18 min ago", status: "Completed" },
  { id: "TX-5A18", type: "Swap", asset: "SOL", detail: "USDC → SOL", amount: 12.4, value: 2086.18, time: "1 hour ago", status: "Completed" },
  { id: "TX-2E90", type: "Stake", asset: "ETH", detail: "Lido", amount: 3.0, value: 10623.24, time: "3 hours ago", status: "Completed" },
  { id: "TX-1D77", type: "Sell", asset: "POL", amount: 1800, value: 1296, time: "5 hours ago", status: "Completed" },
  { id: "TX-8B03", type: "Send", asset: "BTC", detail: "to 0x1c…9d2f", amount: 0.05, value: 3410.72, time: "Yesterday", status: "Completed" },
  { id: "TX-6F55", type: "Buy", asset: "BTC", amount: 0.12, value: 8185.72, time: "Yesterday", status: "Completed" },
  { id: "TX-4A2C", type: "Swap", asset: "ADA", detail: "XRP → ADA", amount: 4200, value: 1932, time: "2 days ago", status: "Pending" },
  { id: "TX-3E81", type: "Receive", asset: "SOL", detail: "from 0x4b…7e10", amount: 40, value: 6729.6, time: "2 days ago", status: "Completed" },
  { id: "TX-0C6D", type: "Sell", asset: "BNB", amount: 6, value: 3554.4, time: "3 days ago", status: "Failed" },
];
