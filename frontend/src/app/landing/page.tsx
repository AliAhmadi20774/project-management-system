import Link from "next/link";
import type { Metadata } from "next";
import {
  IconSparkles,
  IconBrandGithub,
  IconStarFilled,
  IconArrowRight,
  IconCheck,
  IconLayoutDashboard,
  IconBolt,
  IconPalette,
  IconChartBar,
  IconShieldLock,
  IconAccessible,
  IconPointFilled,
  IconHeartFilled,
  IconBrandX,
  IconBrandLinkedin,
  IconBrandDiscord,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: { absolute: "OrbynAdmin — The free & open-source admin template" },
  description:
    "A premium, MIT-licensed admin & SaaS dashboard template built with Next.js 16, Tailwind and shadcn/ui. Free forever.",
};

const STARS = "12,480";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Preview", href: "#preview" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Open source", href: "#open-source" },
  { label: "FAQ", href: "#faq" },
];

const logos = [
  "Vertex Labs",
  "Northwind",
  "Lumen",
  "Aperture",
  "Blue Harbor",
  "Foundry",
  "Meridian",
];

const features = [
  {
    icon: IconLayoutDashboard,
    title: "40+ pages & views",
    body: "Dashboards, tables, detail pages, CRUD forms, kanban, settings and auth — all wired up and ready to ship.",
    tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: IconBolt,
    title: "Blazing fast",
    body: "Built on Next.js 16 with the App Router and Turbopack. Server components by default for instant page loads.",
    tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: IconPalette,
    title: "Light & dark, done right",
    body: "Every screen is designed for both themes using semantic tokens. No half-baked dark mode as an afterthought.",
    tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    icon: IconChartBar,
    title: "Beautiful charts",
    body: "Area, bar and donut charts powered by Recharts and the shadcn chart primitives — responsive and theme-aware.",
    tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: IconShieldLock,
    title: "Fully type-safe",
    body: "Written in strict TypeScript end to end. Autocomplete everywhere, fewer runtime surprises in production.",
    tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    icon: IconAccessible,
    title: "Accessible by default",
    body: "Radix primitives under every component mean keyboard navigation and screen-reader support out of the box.",
    tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
];

const stats = [
  { value: `${STARS}`, label: "GitHub stars" },
  { value: "40+", label: "Pages & views" },
  { value: "48", label: "UI components" },
  { value: "100%", label: "Free & open" },
];

const testimonials = [
  {
    quote:
      "We replaced our entire internal admin with OrbynAdmin in a weekend. The code is clean enough that our whole team was productive on day one.",
    name: "Sofia Rossi",
    role: "Head of Growth, Northwind",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=32",
  },
  {
    quote:
      "Genuinely the best free template I've come across. The dark mode is flawless and the components are a joy to extend.",
    name: "Alex Morgan",
    role: "Staff Engineer, Vertex Labs",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8",
  },
  {
    quote:
      "MIT licensed and this polished? I kept waiting for the catch. There isn't one. We shipped our dashboard two sprints early.",
    name: "Hannah Kim",
    role: "Product Lead, Lumen",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=47",
  },
];

const included = [
  "Unlimited projects, forever",
  "Full source code, no obfuscation",
  "Light & dark themes",
  "Commercial use allowed",
  "No attribution required",
  "Community support on Discord",
];

const faqs = [
  {
    q: "Is it really free?",
    a: "Yes — completely free and open source under the MIT license. Use it for personal projects, client work or commercial products at no cost, with no attribution required.",
  },
  {
    q: "What's the tech stack?",
    a: "Next.js 16 with the App Router, React 19, Tailwind CSS v4, shadcn/ui on top of Radix primitives, Recharts for data visualisation and Tabler icons.",
  },
  {
    q: "Can I use it for commercial projects?",
    a: "Absolutely. The MIT license permits commercial use, modification and redistribution. Build and sell products on top of it freely.",
  },
  {
    q: "Do you offer support?",
    a: "Community support is available through our GitHub issues and Discord server. Contributions and pull requests are always welcome.",
  },
];

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "Components", "Templates", "Changelog", "Roadmap"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Guides", "Examples", "Figma kit", "Support"],
  },
  {
    title: "Community",
    links: ["GitHub", "Discord", "X / Twitter", "Contributors", "Showcase"],
  },
  {
    title: "Legal",
    links: ["MIT License", "Privacy", "Terms", "Security", "Brand"],
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/landing" className="flex items-center gap-2 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <IconSparkles className="size-5" />
              </span>
              <span className="tracking-tight">OrbynAdmin</span>
              <Badge
                variant="secondary"
                className="hidden bg-emerald-500/10 text-emerald-600 sm:inline-flex dark:text-emerald-400"
              >
                OSS
              </Badge>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 px-3"
              asChild
            >
              <Link href="#">
                <IconBrandGithub className="size-4" />
                <span className="hidden sm:inline">Star</span>
                <span className="ml-0.5 flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs tabular-nums">
                  <IconStarFilled className="size-3 text-amber-500" />
                  {STARS}
                </span>
              </Link>
            </Button>
            <Button size="sm" className="h-9 px-3.5" asChild>
              <Link href="/dashboard">
                Open dashboard <IconArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <HeroBackground />
          <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-28">
            <div className="mx-auto flex max-w-3xl flex-col items-center">
              <Link
                href="#open-source"
                className="group mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 py-1 pl-1 pr-3 text-sm shadow-sm backdrop-blur transition-colors hover:bg-muted"
              >
                <Badge className="gap-1 rounded-full bg-primary px-2 text-primary-foreground">
                  <IconSparkles className="size-3" /> New
                </Badge>
                <span className="text-muted-foreground">
                  v2.0 — MIT licensed, now on Next.js 16
                </span>
                <IconArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>

              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                The open-source admin template you&apos;ll actually enjoy
                building on
              </h1>
              <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
                A premium, production-ready dashboard built with Next.js 16,
                Tailwind and shadcn/ui. Free forever, MIT licensed, and crafted
                down to the last pixel — in light and dark.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-11 gap-2 px-6 text-sm"
                  asChild
                >
                  <Link href="/dashboard">
                    Open the dashboard <IconArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 gap-2 px-6 text-sm"
                  asChild
                >
                  <Link href="#">
                    <IconBrandGithub className="size-4" /> Star on GitHub
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <div className="flex -space-x-2">
                  {[8, 32, 47, 33, 45].map((n) => (
                    <Avatar
                      key={n}
                      className="size-8 ring-2 ring-background"
                    >
                      <AvatarImage src={`https://i.pravatar.cc/80?img=${n}`} />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStarFilled
                        key={i}
                        className="size-4 text-amber-500"
                      />
                    ))}
                  </span>
                  <span>
                    Loved by <span className="font-medium text-foreground">12,000+</span>{" "}
                    developers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo cloud */}
        <section className="border-t border-dashed">
          <div className="mx-auto w-full max-w-6xl px-6 py-12">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Trusted by teams at
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {logos.map((name) => (
                <span
                  key={name}
                  className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
                >
                  <IconPointFilled className="size-4 opacity-40" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Badge
                variant="secondary"
                className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              >
                Everything included
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Batteries included, opinions optional
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start from a foundation that already handles the hard parts, so
                you can focus on what makes your product different.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="group transition-colors hover:border-foreground/20"
                >
                  <CardContent className="space-y-3">
                    <span
                      className={`flex size-11 items-center justify-center rounded-xl ${f.tint}`}
                    >
                      <f.icon className="size-5" />
                    </span>
                    <h3 className="text-base font-semibold tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats band */}
        <section className="border-t bg-muted/40">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-16 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {s.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Product preview */}
        <section id="preview" className="border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Badge
                variant="secondary"
                className="bg-violet-500/10 text-violet-600 dark:text-violet-400"
              >
                See it in action
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                A dashboard that looks like you hired a designer
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Real layouts, real components, real polish. Here&apos;s a peek at
                what ships in the box.
              </p>
            </div>

            <div className="relative mt-14">
              <div
                className="absolute -inset-x-8 -top-8 -z-10 h-72 opacity-40 blur-3xl"
                style={{
                  background:
                    "radial-gradient(50% 60% at 50% 0%, var(--chart-1) 0%, transparent 70%)",
                }}
              />
              <BrowserMock />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="border-t bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                Loved by developers
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Don&apos;t just take our word for it
              </h2>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name} className="bg-card">
                  <CardContent className="flex h-full flex-col gap-6">
                    <span className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IconStarFilled key={i} className="size-4" />
                      ))}
                    </span>
                    <p className="flex-1 text-[15px] leading-relaxed text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={t.avatar} alt={t.name} />
                        <AvatarFallback>{t.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Free / open-source band */}
        <section id="open-source" className="border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
            <Card className="relative overflow-hidden border-0 bg-primary text-primary-foreground">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                  background:
                    "radial-gradient(120% 120% at 0% 0%, var(--chart-1) 0%, transparent 45%), radial-gradient(120% 120% at 100% 100%, var(--chart-5) 0%, transparent 45%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:40px_40px]" />
              <CardContent className="relative grid gap-10 py-4 lg:grid-cols-2 lg:items-center">
                <div>
                  <Badge className="gap-1 border-0 bg-white/15 text-primary-foreground">
                    <IconHeartFilled className="size-3" /> MIT Licensed
                  </Badge>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    100% free. Forever.
                  </h2>
                  <p className="mt-4 max-w-md text-primary-foreground/70">
                    No paywalls, no &ldquo;pro&rdquo; tier, no locked components.
                    Every page you see is open source and yours to build on.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-11 gap-2 px-6 text-sm"
                      asChild
                    >
                      <Link href="#">
                        <IconBrandGithub className="size-4" /> View on GitHub
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      className="h-11 gap-2 border border-white/25 bg-white/10 px-6 text-sm text-primary-foreground hover:bg-white/20"
                      asChild
                    >
                      <Link href="/dashboard">
                        Live demo <IconArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                        <IconCheck className="size-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t bg-muted/40">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Badge
                variant="secondary"
                className="bg-sky-500/10 text-sky-600 dark:text-sky-400"
              >
                FAQ
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Questions, answered
              </h2>
              <p className="mt-4 text-muted-foreground">
                Everything you need to know before you clone the repo. Still
                curious? Ask in our Discord.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-24 text-center">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              Ready to build something great?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Clone the repo, run one command and you&apos;re staring at a
              production-grade dashboard. It really is that fast.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-11 gap-2 px-6 text-sm" asChild>
                <Link href="/dashboard">
                  Open dashboard <IconArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 gap-2 px-6 text-sm"
                asChild
              >
                <Link href="#">
                  <IconBrandGithub className="size-4" /> Star on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div className="space-y-4">
              <Link href="/landing" className="flex items-center gap-2 font-semibold">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconSparkles className="size-5" />
                </span>
                <span className="tracking-tight">OrbynAdmin</span>
              </Link>
              <p className="max-w-xs text-sm text-muted-foreground">
                The free & open-source admin template for building beautiful
                dashboards, faster.
              </p>
              <div className="flex items-center gap-2">
                <SocialLink icon={IconBrandGithub} label="GitHub" />
                <SocialLink icon={IconBrandX} label="X" />
                <SocialLink icon={IconBrandDiscord} label="Discord" />
                <SocialLink icon={IconBrandLinkedin} label="LinkedIn" />
              </div>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-medium">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} OrbynAdmin. Released under the MIT License.</p>
            <p className="flex items-center gap-1.5">
              Built with <IconHeartFilled className="size-3.5 text-rose-500" /> by
              the open-source community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black,transparent_75%)]" />
      <div
        className="absolute left-1/2 top-[-10%] h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--chart-1), transparent), radial-gradient(closest-side at 70% 60%, var(--chart-5), transparent)",
        }}
      />
    </div>
  );
}

function SocialLink({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href="#"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="size-4" />
    </Link>
  );
}

function BrowserMock() {
  const navItems = [
    { label: "Dashboard", active: true },
    { label: "Customers", active: false },
    { label: "Orders", active: false },
    { label: "Products", active: false },
    { label: "Analytics", active: false },
    { label: "Settings", active: false },
  ];
  const tiles = [
    { label: "Revenue", value: "$284,392", delta: "+12.5%", tint: "text-emerald-500" },
    { label: "Customers", value: "2,318", delta: "+8.2%", tint: "text-emerald-500" },
    { label: "Active", value: "18,472", delta: "+3.1%", tint: "text-emerald-500" },
    { label: "Churn", value: "1.8%", delta: "-0.4%", tint: "text-rose-500" },
  ];
  const bars = [42, 58, 51, 70, 64, 82, 76, 94, 88, 100, 91, 78];
  const rows = [
    { name: "Emma Carter", plan: "Enterprise", amount: "$4,920" },
    { name: "Liam Nguyen", plan: "Pro", amount: "$1,280" },
    { name: "Olivia Patel", plan: "Pro", amount: "$980" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-black/5">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-rose-400/80" />
          <span className="size-3 rounded-full bg-amber-400/80" />
          <span className="size-3 rounded-full bg-emerald-400/80" />
        </div>
        <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-md border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
          <IconSparkles className="size-3" /> orbynadmin.com/dashboard
        </div>
      </div>

      {/* App body */}
      <div className="flex min-h-[420px]">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r bg-muted/30 p-3 sm:flex">
          <div className="mb-3 flex items-center gap-2 px-2 py-1.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <IconSparkles className="size-3.5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">OrbynAdmin</span>
          </div>
          {navItems.map((n) => (
            <div
              key={n.label}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm ${
                n.active
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  n.active ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              />
              {n.label}
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold tracking-tight">
                Welcome back, Alex
              </div>
              <div className="text-xs text-muted-foreground">
                Here&apos;s what&apos;s happening today
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden h-7 items-center rounded-md border px-2.5 text-xs text-muted-foreground sm:flex">
                Last 30 days
              </span>
              <span className="flex h-7 items-center rounded-md bg-primary px-2.5 text-xs text-primary-foreground">
                Export
              </span>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-lg border bg-background p-3">
                <div className="text-[11px] text-muted-foreground">
                  {t.label}
                </div>
                <div className="mt-1 text-lg font-semibold tracking-tight tabular-nums">
                  {t.value}
                </div>
                <div className={`text-[11px] font-medium tabular-nums ${t.tint}`}>
                  {t.delta}
                </div>
              </div>
            ))}
          </div>

          {/* Chart + list */}
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-lg border bg-background p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs font-medium">Revenue overview</div>
                <div className="text-[11px] text-muted-foreground">2026</div>
              </div>
              <div className="flex h-32 items-end gap-1.5">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${h}%`,
                      background:
                        "linear-gradient(to top, var(--chart-1), color-mix(in oklch, var(--chart-1) 40%, transparent))",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="mb-3 text-xs font-medium">Top customers</div>
              <div className="space-y-3">
                {rows.map((r) => (
                  <div key={r.name} className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                      {r.name.slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">
                        {r.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {r.plan}
                      </div>
                    </div>
                    <div className="text-xs font-medium tabular-nums">
                      {r.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
