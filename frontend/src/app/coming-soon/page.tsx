"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconSparkles,
  IconRocket,
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

const social = [
  { icon: IconBrandGithub, label: "GitHub", href: "#" },
  { icon: IconBrandX, label: "X", href: "#" },
  { icon: IconBrandDiscord, label: "Discord", href: "#" },
  { icon: IconMail, label: "Email", href: "#" },
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function ComingSoonPage() {
  // Starts at zeros so SSR and first client render match — the effect then
  // fills in the real remaining time (avoids any hydration mismatch).
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [email, setEmail] = useState("");

  useEffect(() => {
    const target = new Date("2026-09-01T09:00:00Z").getTime();
    function tick() {
      const diff = Math.max(0, target - Date.now());
      setTime({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    toast.success("You're on the list!", {
      description: `We'll email ${value} the moment we launch.`,
    });
    setEmail("");
  }

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]" />
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
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconSparkles className="size-5" />
          </span>
          <span className="tracking-tight">OrbynAdmin</span>
        </Link>
        <Badge
          variant="secondary"
          className="gap-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400"
        >
          <IconPointFilled className="size-3 animate-pulse" />
          Launching soon
        </Badge>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <IconRocket className="size-8 text-primary" />
          </div>

          <Badge
            variant="secondary"
            className="mt-8 gap-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400"
          >
            <IconSparkles className="size-3.5" />
            OrbynAdmin 2.0 — a whole new workspace
          </Badge>

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Something big is coming
          </h1>
          <p className="mx-auto mt-4 max-w-md text-balance text-lg text-muted-foreground">
            We&apos;re putting the finishing touches on a faster, more beautiful
            way to run your business. Be the first to know when we go live.
          </p>

          {/* Countdown */}
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 gap-3 sm:gap-4">
            {units.map((u) => (
              <div
                key={u.label}
                className="rounded-xl border bg-card p-3 shadow-sm sm:p-4"
              >
                <div className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                  {pad(u.value)}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {u.label}
                </div>
              </div>
            ))}
          </div>

          {/* Subscribe */}
          <form
            onSubmit={handleSubscribe}
            className="mx-auto mt-10 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              aria-label="Email address"
              className="h-11 flex-1"
            />
            <Button type="submit" size="lg" className="h-11 gap-2 px-5 text-sm">
              Notify me <IconArrowRight className="size-4" />
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            No spam, ever. Just one email when we launch.
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
              Follow our build in public
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
        © 2026 OrbynAdmin. All rights reserved.
      </footer>
    </div>
  );
}
