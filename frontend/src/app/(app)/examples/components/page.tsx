import {
  IconPlus,
  IconDownload,
  IconTrash,
  IconArrowRight,
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconSettings,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { team } from "@/data";

export const metadata = { title: "UI Elements" };

const statusBadges = [
  { label: "Active", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { label: "Pending", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { label: "Failed", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { label: "Info", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { label: "Beta", cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { label: "Draft", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
];

const progressRows = [
  { label: "Storage used", value: 72 },
  { label: "Onboarding", value: 45 },
  { label: "API quota", value: 91 },
];

const faqs = [
  {
    q: "How is billing calculated?",
    a: "Plans are billed monthly per active seat. Usage above your plan limits is metered and added to the next invoice.",
  },
  {
    q: "Can I change plans at any time?",
    a: "Yes. Upgrades take effect immediately and downgrades apply at the start of your next billing cycle, with no penalty.",
  },
  {
    q: "Do you offer a free trial?",
    a: "Every workspace starts on a 14-day Pro trial. No credit card is required until you decide to keep the plan.",
  },
];

export default function ComponentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="UI Elements"
        description="A gallery of the building blocks used across this template."
      />

      {/* Buttons — full width */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Variants, sizes, icons and states.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Row label="Variants">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </Row>
          <Separator />
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Settings">
              <IconSettings />
            </Button>
          </Row>
          <Separator />
          <Row label="With icons">
            <Button>
              <IconPlus className="size-4" /> New project
            </Button>
            <Button variant="outline">
              <IconDownload className="size-4" /> Export
            </Button>
            <Button variant="secondary">
              Continue <IconArrowRight className="size-4" />
            </Button>
            <Button variant="destructive">
              <IconTrash className="size-4" /> Delete
            </Button>
          </Row>
          <Separator />
          <Row label="Disabled">
            <Button disabled>Primary</Button>
            <Button variant="outline" disabled>
              Outline
            </Button>
            <Button variant="ghost" disabled>
              Ghost
            </Button>
          </Row>
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Base variants and the status palette.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="ghost">Ghost</Badge>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {statusBadges.map((b) => (
                <Badge key={b.label} variant="secondary" className={b.cls}>
                  {b.label}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <IconCircleCheck /> Verified
              </Badge>
              <Badge
                variant="secondary"
                className="bg-violet-500/10 text-violet-600 dark:text-violet-400"
              >
                <IconStar /> Pro
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Avatars */}
        <Card>
          <CardHeader>
            <CardTitle>Avatars</CardTitle>
            <CardDescription>Sizes, fallbacks and a stacked group.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar size="sm">
                <AvatarImage src={team[0].avatar} alt={team[0].name} />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src={team[1].avatar} alt={team[1].name} />
                <AvatarFallback>SR</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage src={team[2].avatar} alt={team[2].name} />
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>PN</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback className="bg-violet-500/15 text-violet-600 dark:text-violet-400">
                  <IconUsers className="size-5" />
                </AvatarFallback>
              </Avatar>
            </div>
            <Separator />
            <AvatarGroup>
              {team.slice(0, 5).map((m) => (
                <Avatar key={m.id}>
                  <AvatarImage src={m.avatar} alt={m.name} />
                  <AvatarFallback>{m.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+{team.length - 5}</AvatarGroupCount>
            </AvatarGroup>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Informational, success and destructive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <IconInfoCircle />
              <AlertTitle>Scheduled maintenance</AlertTitle>
              <AlertDescription>
                We&apos;ll be performing upgrades on Sunday at 02:00 UTC. Expect
                brief downtime.
              </AlertDescription>
            </Alert>
            <Alert className="border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
              <IconCircleCheck />
              <AlertTitle>Backup completed</AlertTitle>
              <AlertDescription className="text-emerald-700/80 dark:text-emerald-400/80">
                All 2,318 records were synced successfully.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <IconAlertTriangle />
              <AlertTitle>Payment failed</AlertTitle>
              <AlertDescription>
                Your card was declined. Update your billing details to keep your
                subscription active.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Determinate bars with labels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {progressRows.map((p) => (
              <div key={p.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {p.value}%
                  </span>
                </div>
                <Progress value={p.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Switch between related views.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">
                A quick summary of workspace health, active members and recent
                changes across your projects.
              </TabsContent>
              <TabsContent value="analytics" className="pt-4 text-sm text-muted-foreground">
                Traffic, conversion and retention trends with week-over-week
                comparisons.
              </TabsContent>
              <TabsContent value="reports" className="pt-4 text-sm text-muted-foreground">
                Export scheduled reports as CSV or PDF and share them with your
                team.
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Accordion */}
        <Card>
          <CardHeader>
            <CardTitle>Accordion</CardTitle>
            <CardDescription>Progressive disclosure for FAQs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="faq-0">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Form controls */}
        <Card>
          <CardHeader>
            <CardTitle>Selection controls</CardTitle>
            <CardDescription>Switch, checkbox and radio group.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="cmp-switch" className="font-normal">
                Enable two-factor auth
              </Label>
              <Switch id="cmp-switch" defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Checkbox id="cmp-chk-1" defaultChecked />
                <Label htmlFor="cmp-chk-1" className="font-normal">
                  Send me a weekly digest
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox id="cmp-chk-2" />
                <Label htmlFor="cmp-chk-2" className="font-normal">
                  Subscribe to the changelog
                </Label>
              </div>
            </div>
            <Separator />
            <RadioGroup defaultValue="comfortable" className="gap-2.5">
              <div className="flex items-center gap-2.5">
                <RadioGroupItem id="cmp-rad-1" value="compact" />
                <Label htmlFor="cmp-rad-1" className="font-normal">
                  Compact density
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <RadioGroupItem id="cmp-rad-2" value="comfortable" />
                <Label htmlFor="cmp-rad-2" className="font-normal">
                  Comfortable density
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Tooltip */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltips</CardTitle>
            <CardDescription>Contextual hints on hover or focus.</CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="flex flex-wrap gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>Opens in a new tab</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Add">
                      <IconPlus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create a new item</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Delete">
                      <IconTrash />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete permanently</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Skeletons */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Skeletons</CardTitle>
            <CardDescription>Loading placeholders that match content shape.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
