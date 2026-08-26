"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconMapPin,
  IconMail,
  IconPhone,
  IconWorld,
  IconCalendar,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandDribbble,
  IconArrowUpRight,
  IconRosetteDiscountCheckFilled,
} from "@tabler/icons-react";

import { ProfileActions } from "./profile-actions";
import { useAuth } from "@/components/auth-provider";
import type { AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { recentActivity, productList } from "@/data";

const stats = [
  { label: "Projects", value: 48 },
  { label: "Followers", value: 2384 },
  { label: "Following", value: 312 },
];

const skills = [
  "Product Strategy",
  "UI/UX Design",
  "Figma",
  "TypeScript",
  "React",
  "Analytics",
  "Team Leadership",
  "Roadmapping",
];

const socials = [
  { label: "GitHub", handle: "@alexmorgan", icon: IconBrandGithub, href: "#" },
  { label: "LinkedIn", handle: "in/alexmorgan", icon: IconBrandLinkedin, href: "#" },
  { label: "X", handle: "@alex_morgan", icon: IconBrandX, href: "#" },
  { label: "Dribbble", handle: "alexmorgan", icon: IconBrandDribbble, href: "#" },
];

function ProfilePageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [profileOverride, setProfileOverride] = useState<AuthUser | null>(null);
  const requestedUserId = searchParams.get("user");
  const [viewedProfile, setViewedProfile] = useState<AuthUser | null>(null);
  useEffect(() => {
    if (!requestedUserId || requestedUserId === String(user?.id)) { setViewedProfile(null); return; }
    fetch(`/api/users/${requestedUserId}`).then((response) => response.ok ? response.json() : null).then(setViewedProfile).catch(() => setViewedProfile(null));
  }, [requestedUserId, user?.id]);
  const profile = viewedProfile ?? profileOverride ?? user;
  const profileName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.username || "User";
  const initials = profileName.split(" ").map((part) => part[0]).join("").slice(0, 2);
  const accessLabel = profile?.access_role === "system_admin" ? "System admin" : profile?.access_role === "manager" ? "Manager" : "User";
  const joined = profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—";
  const about = [
    { label: "Email", value: profile?.email || "Not set", icon: IconMail },
    { label: "Phone", value: profile?.mobile || "Not set", icon: IconPhone },
    { label: "Personnel number", value: profile?.username || "—", icon: IconRosetteDiscountCheckFilled },
    { label: "Access", value: accessLabel, icon: IconWorld },
    { label: "Joined", value: joined, icon: IconCalendar },
  ];
  const projects = productList.slice(0, 4);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden pt-0">
        {/* Cover banner — soft aurora mesh */}
        <div className="relative h-36 overflow-hidden bg-zinc-950 sm:h-44">
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.9,
              backgroundImage:
                "radial-gradient(45% 90% at 12% 20%, var(--chart-1), transparent 60%), radial-gradient(42% 85% at 55% 0%, var(--chart-5), transparent 55%), radial-gradient(55% 100% at 90% 75%, var(--chart-3), transparent 60%), radial-gradient(40% 80% at 78% 15%, var(--chart-4), transparent 55%)",
            }}
          />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <CardContent className="pt-0">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <Avatar className="-mt-14 size-28 rounded-full sm:-mt-16 sm:size-32">
                <AvatarImage src={profile?.avatar_url ?? "/avatars/default-young-man.png"} alt={profileName} />
                <AvatarFallback className="rounded-full text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1.5 pb-1 text-center sm:pb-2 sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {profileName}
                  </h1>
                  <IconRosetteDiscountCheckFilled className="size-5 text-sky-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile?.job_title || "No job title"} · {profile?.department_detail?.name || "No department"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                  <span className="flex items-center gap-1">
                    <IconMapPin className="size-4" /> Personnel #{profile?.username || "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconWorld className="size-4" /> {accessLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconCalendar className="size-4" /> Joined {joined}
                  </span>
                </div>
              </div>
            </div>
              {profile && !viewedProfile && <ProfileActions user={profile} onUpdated={setProfileOverride} />}
          </div>

          <Separator className="my-6" />

          <div className="mx-auto grid max-w-md grid-cols-3 divide-x sm:mx-0">
            {stats.map((s) => (
              <div key={s.label} className="px-4 text-center first:pl-0 last:pr-0">
                <div className="text-2xl font-semibold tabular-nums tracking-tight">
                  {s.value.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                Your personal account details and access level.
              </p>
              <Separator />
              <ul className="space-y-3">
                {about.map((a) => (
                  <li key={a.label} className="flex items-center gap-3">
                    <a.icon className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{a.label}</span>
                    <span className="ml-auto font-medium">{a.value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <s.icon className="size-4 text-muted-foreground" />
                  <span className="font-medium">{s.label}</span>
                  <span className="ml-auto text-muted-foreground">
                    {s.handle}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest actions across your workspace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="relative space-y-5 border-l pl-6">
                    {recentActivity.slice(0, 5).map((a) => (
                      <li key={a.id} className="relative">
                        <span className="absolute -left-[31px] top-0.5">
                          <Avatar className="size-6 ring-4 ring-background">
                            <AvatarImage src={a.avatar} alt={a.user} />
                            <AvatarFallback>{a.user.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                        </span>
                        <p className="text-sm">
                          <span className="font-medium">{a.user}</span>{" "}
                          {a.action}{" "}
                          {a.target && (
                            <span className="font-medium">{a.target}</span>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {a.time}
                        </span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {projects.map((p) => (
                  <Card key={p.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <CardDescription>{p.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground tabular-nums">
                        {p.sold} contributions
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        Active
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>
                    Everything you&apos;ve done recently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="relative space-y-5 border-l pl-6">
                    {recentActivity.map((a) => (
                      <li key={a.id} className="relative">
                        <span className="absolute -left-[31px] top-0.5">
                          <Avatar className="size-6 ring-4 ring-background">
                            <AvatarImage src={a.avatar} alt={a.user} />
                            <AvatarFallback>{a.user.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                        </span>
                        <p className="text-sm">
                          <span className="font-medium">{a.user}</span>{" "}
                          {a.action}{" "}
                          {a.target && (
                            <span className="font-medium">{a.target}</span>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {a.time}
                        </span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <div className="grid gap-4 sm:grid-cols-2">
                {productList.slice(0, 6).map((p) => (
                  <Card key={p.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <CardDescription>{p.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground tabular-nums">
                        ${p.price}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/products">
                          View <IconArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading profile…</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
