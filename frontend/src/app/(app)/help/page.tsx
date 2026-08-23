import {
  IconRocket,
  IconCreditCard,
  IconUserCircle,
  IconPlug,
  IconCode,
  IconShieldLock,
  IconArrowRight,
  IconMessageCircle,
  IconBook,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpSearch, ClickToast, SupportButtons } from "./help-actions";

export const metadata = { title: "Help Center" };

const categories = [
  {
    title: "Getting Started",
    desc: "Set up your workspace and learn the basics.",
    count: 24,
    icon: IconRocket,
    color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  },
  {
    title: "Billing",
    desc: "Plans, invoices, payments and refunds.",
    count: 18,
    icon: IconCreditCard,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  {
    title: "Account",
    desc: "Profile, security and team management.",
    count: 31,
    icon: IconUserCircle,
    color: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  },
  {
    title: "Integrations",
    desc: "Connect your favorite tools and apps.",
    count: 15,
    icon: IconPlug,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    title: "API",
    desc: "Developer docs, keys and webhooks.",
    count: 42,
    icon: IconCode,
    color: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
  },
  {
    title: "Security",
    desc: "2FA, sessions and data protection.",
    count: 12,
    icon: IconShieldLock,
    color: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  },
];

const popular = [
  {
    title: "How to invite team members to your workspace",
    category: "Account",
    read: "3 min read",
  },
  {
    title: "Setting up two-factor authentication",
    category: "Security",
    read: "4 min read",
  },
  {
    title: "Understanding your billing cycle and invoices",
    category: "Billing",
    read: "5 min read",
  },
  {
    title: "Connecting Slack for real-time notifications",
    category: "Integrations",
    read: "2 min read",
  },
  {
    title: "Generating and rotating your API keys",
    category: "API",
    read: "6 min read",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-[var(--chart-1)]/12 via-[var(--chart-3)]/8 to-[var(--chart-5)]/12">
          <CardContent className="mx-auto max-w-2xl space-y-4 py-12 text-center">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <IconBook className="size-3.5" /> Help Center
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              How can we help?
            </h1>
            <p className="text-muted-foreground">
              Search our knowledge base or browse categories below.
            </p>
            <HelpSearch />
          </CardContent>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <ClickToast
            key={cat.title}
            message={`${cat.title}`}
            description={`${cat.count} articles · ${cat.desc}`}
            className="group text-left"
          >
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/40">
              <CardHeader>
                <span
                  className={`flex size-10 items-center justify-center rounded-lg ${cat.color}`}
                >
                  <cat.icon className="size-5" />
                </span>
                <CardTitle className="mt-3 flex items-center justify-between">
                  {cat.title}
                  <span className="text-sm font-normal text-muted-foreground tabular-nums">
                    {cat.count}
                  </span>
                </CardTitle>
                <CardDescription>{cat.desc}</CardDescription>
              </CardHeader>
            </Card>
          </ClickToast>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Popular articles</CardTitle>
            <CardDescription>Most viewed guides this week</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {popular.map((a) => (
              <ClickToast
                key={a.title}
                message={a.title}
                description={`${a.category} · ${a.read}`}
                className="flex w-full items-center gap-4 py-3.5 text-left first:pt-0 last:pb-0"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <IconBook className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.category} · {a.read}
                  </p>
                </div>
                <IconArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
              </ClickToast>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center bg-muted/40 text-center">
          <CardContent className="space-y-4 py-8">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <IconMessageCircle className="size-6" />
            </span>
            <div className="space-y-1">
              <h3 className="font-semibold tracking-tight">
                Still need help?
              </h3>
              <p className="text-sm text-muted-foreground">
                Our support team is here for you 24/7.
              </p>
            </div>
            <SupportButtons />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
