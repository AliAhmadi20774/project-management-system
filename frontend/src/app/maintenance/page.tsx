import Link from "next/link";
import type { Metadata } from "next";
import {
  IconSparkles,
  IconTool,
  IconClock,
  IconArrowRight,
  IconPointFilled,
  IconBrandGithub,
  IconBrandX,
  IconBrandDiscord,
  IconMail,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "We'll be right back",
  description:
    "OrbynAdmin is undergoing scheduled maintenance and will be back shortly.",
};

const social = [
  { icon: IconBrandGithub, label: "GitHub", href: "#" },
  { icon: IconBrandX, label: "X", href: "#" },
  { icon: IconBrandDiscord, label: "Discord", href: "#" },
  { icon: IconMail, label: "Email", href: "#" },
];

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
        <div
          className="absolute left-1/2 top-1/3 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--chart-1), transparent), radial-gradient(closest-side at 65% 55%, var(--chart-5), transparent)",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconSparkles className="size-5" />
          </span>
          <span className="tracking-tight">OrbynAdmin</span>
        </Link>
        <Badge
          variant="secondary"
          className="gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          <IconPointFilled className="size-3 animate-pulse" />
          Maintenance in progress
        </Badge>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <IconTool className="size-8 text-primary" />
          </div>

          <Badge
            variant="secondary"
            className="mt-8 gap-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400"
          >
            <IconClock className="size-3.5" />
            Estimated downtime — about 45 minutes
          </Badge>

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            We&apos;ll be right back
          </h1>
          <p className="mx-auto mt-4 max-w-md text-balance text-lg text-muted-foreground">
            OrbynAdmin is getting a quick tune-up. We&apos;re rolling out improvements
            and will be back online shortly. Thanks for your patience.
          </p>

          {/* Subscribe */}
          <form className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder="you@company.com"
              aria-label="Email address"
              defaultValue=""
              className="h-11 flex-1"
            />
            <Button type="submit" size="lg" className="h-11 gap-2 px-5 text-sm">
              Notify me <IconArrowRight className="size-4" />
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            We&apos;ll email you the moment we&apos;re back. No spam, ever.
          </p>

          {/* Status + social */}
          <div className="mx-auto mt-10 flex flex-col items-center gap-5">
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-sm transition-colors hover:bg-muted"
            >
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              All systems on status page
              <IconArrowRight className="size-3.5 text-muted-foreground" />
            </Link>

            <div className="flex items-center gap-2">
              {social.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex size-10 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
                >
                  <s.icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} OrbynAdmin. All rights reserved.
      </footer>
    </div>
  );
}
