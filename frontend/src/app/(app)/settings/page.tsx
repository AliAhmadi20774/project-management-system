"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconUser,
  IconBell,
  IconShieldLock,
  IconPalette,
  IconCreditCard,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconCheck,
  IconArrowUpRight,
  IconUpload,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { currentUser } from "@/data";

const notificationPrefs = [
  {
    id: "email-activity",
    title: "Account activity",
    desc: "Get emails about your account sign-ins and security.",
    channel: "Email",
    on: true,
  },
  {
    id: "email-product",
    title: "Product updates",
    desc: "News about features and improvements.",
    channel: "Email",
    on: true,
  },
  {
    id: "push-mentions",
    title: "Mentions & comments",
    desc: "Push notifications when someone mentions you.",
    channel: "Push",
    on: true,
  },
  {
    id: "push-orders",
    title: "New orders",
    desc: "Get notified the moment a new order comes in.",
    channel: "Push",
    on: false,
  },
  {
    id: "marketing",
    title: "Marketing emails",
    desc: "Tips, offers and occasional surveys.",
    channel: "Email",
    on: false,
  },
];

const sessions = [
  {
    id: "s1",
    device: "MacBook Pro · Chrome",
    location: "San Francisco, US",
    last: "Active now",
    current: true,
    icon: IconDeviceLaptop,
  },
  {
    id: "s2",
    device: "iPhone 15 · Safari",
    location: "San Francisco, US",
    last: "2 hours ago",
    current: false,
    icon: IconDeviceMobile,
  },
  {
    id: "s3",
    device: "Windows PC · Edge",
    location: "London, UK",
    last: "Yesterday",
    current: false,
    icon: IconDeviceLaptop,
  },
];

const invoices = [
  { id: "INV-2041", date: "Jul 1, 2026", amount: "$49.00" },
  { id: "INV-2019", date: "Jun 1, 2026", amount: "$49.00" },
  { id: "INV-1998", date: "May 1, 2026", amount: "$49.00" },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(notificationPrefs.map((n) => [n.id, n.on]))
  );
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionList, setSessionList] = useState(sessions);

  const saved = (message: string, description?: string) => () =>
    toast.success(message, description ? { description } : undefined);

  const revokeSession = (id: string, device: string) => {
    setSessionList((prev) => prev.filter((s) => s.id !== id));
    toast.success("Session revoked", { description: device });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, preferences and billing."
      />

      <Tabs defaultValue="general" className="gap-6">
        <div className="overflow-x-auto">
          <TabsList>
          <TabsTrigger value="general">
            <IconUser className="size-4" /> General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <IconBell className="size-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <IconShieldLock className="size-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <IconPalette className="size-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="billing">
            <IconCreditCard className="size-4" /> Billing
          </TabsTrigger>
          </TabsList>
        </div>

        {/* GENERAL */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This information will be displayed on your public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="size-16">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saved("Avatar updated", "Your new photo has been saved.")}
                  >
                    <IconUpload className="size-4" /> Upload
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={saved("Avatar removed")}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" defaultValue={currentUser.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="alexmorgan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={currentUser.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="admin">
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  defaultValue="Product leader focused on building delightful, data-driven experiences."
                />
                <p className="text-xs text-muted-foreground">
                  Brief description for your profile. Max 200 characters.
                </p>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t">
              <Button variant="ghost" onClick={saved("Changes discarded")}>
                Cancel
              </Button>
              <Button
                onClick={saved("Profile saved", "Your changes have been saved.")}
              >
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {notificationPrefs.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={n.id}>{n.title}</Label>
                      <Badge variant="outline" className="text-xs">
                        {n.channel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch
                    id={n.id}
                    checked={prefs[n.id]}
                    onCheckedChange={(v) =>
                      setPrefs((p) => ({ ...p, [n.id]: v }))
                    }
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button
                onClick={saved(
                  "Preferences saved",
                  "Your notification preferences have been updated."
                )}
              >
                Save preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>
                Use a strong password you don&apos;t reuse elsewhere.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button
                onClick={saved(
                  "Password updated",
                  "Use your new password next time you sign in."
                )}
              >
                Update password
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa">Authenticator app</Label>
                <p className="text-sm text-muted-foreground">
                  Require a verification code at sign-in.
                </p>
              </div>
              <Switch
                id="2fa"
                checked={twoFactor}
                onCheckedChange={setTwoFactor}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active sessions</CardTitle>
              <CardDescription>
                Devices currently signed in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {sessionList.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <s.icon className="size-5 text-muted-foreground" />
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {s.device}
                      {s.current && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        >
                          This device
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.location} · {s.last}
                    </p>
                  </div>
                  {!s.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => revokeSession(s.id, s.device)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPEARANCE */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the dashboard looks for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle light or dark mode from the header. Your choice is
                    remembered on this device.
                  </p>
                </div>
                <Badge variant="outline">System</Badge>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lang">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="lang" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tz">Timezone</Label>
                  <Select defaultValue="pt">
                    <SelectTrigger id="tz" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Pacific Time (PT)</SelectItem>
                      <SelectItem value="et">Eastern Time (ET)</SelectItem>
                      <SelectItem value="gmt">London (GMT)</SelectItem>
                      <SelectItem value="cet">Central Europe (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button
                onClick={saved(
                  "Preferences saved",
                  "Your appearance settings have been updated."
                )}
              >
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* BILLING */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current plan</CardTitle>
              <CardDescription>
                You are currently on the Pro plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 rounded-xl border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Pro</span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    >
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Renews on Aug 1, 2026
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold tabular-nums">
                    $49
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={saved(
                      "Plan options",
                      "Compare plans and upgrade anytime."
                    )}
                  >
                    Change plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment method</CardTitle>
              <CardDescription>
                Your default card for subscriptions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <IconCreditCard className="size-5 text-muted-foreground" />
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 08/2028</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={saved(
                  "Update payment method",
                  "Add or change your default card."
                )}
              >
                Update
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Download past invoices.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-4 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <IconCheck className="size-4 text-emerald-500" />
                  <span className="font-medium">{inv.id}</span>
                  <span className="text-muted-foreground">{inv.date}</span>
                  <span className="ml-auto tabular-nums font-medium">
                    {inv.amount}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={saved("Downloading invoice", `${inv.id} · ${inv.amount}`)}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/invoices">
                  View all invoices <IconArrowUpRight className="size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
