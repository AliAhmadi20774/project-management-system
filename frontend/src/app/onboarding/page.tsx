"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  IconSparkles,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconUser,
  IconBuildingStore,
  IconUsers,
  IconConfetti,
  IconMail,
  IconPlus,
  IconX,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

const steps = [
  { title: "Account", subtitle: "Tell us about you", icon: IconUser },
  { title: "Workspace", subtitle: "Set up your team", icon: IconBuildingStore },
  { title: "Invite", subtitle: "Bring your team", icon: IconUsers },
  { title: "Finish", subtitle: "You're all set", icon: IconConfetti },
];

const teamSizes = ["Just me", "2–10", "11–50", "51–200", "200+"];

type Invite = { id: number; email: string; role: string };

export default function OnboardingPage() {
  const [step, setStep] = useState(0);

  const [fullName, setFullName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex.morgan@orbynadmin.com");
  const [password, setPassword] = useState("");

  const [workspace, setWorkspace] = useState("OrbynAdmin");
  const [slug, setSlug] = useState("orbynadmin");
  const [teamSize, setTeamSize] = useState("11–50");
  const [industry, setIndustry] = useState("saas");

  const [invites, setInvites] = useState<Invite[]>([
    { id: 1, email: "sofia.rossi@orbynadmin.com", role: "admin" },
    { id: 2, email: "marcus.chen@orbynadmin.com", role: "member" },
    { id: 3, email: "", role: "member" },
  ]);

  const isLast = step === steps.length - 1;
  const progress = (step / (steps.length - 1)) * 100;

  function next() {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function updateInvite(id: number, patch: Partial<Invite>) {
    setInvites((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  }
  function addInvite() {
    setInvites((prev) => [
      ...prev,
      { id: (prev.at(-1)?.id ?? 0) + 1, email: "", role: "member" },
    ]);
  }
  function removeInvite(id: number) {
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconSparkles className="size-5" />
          </span>
          <span className="tracking-tight">OrbynAdmin</span>
        </Link>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">Skip for now</Link>
        </Button>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {/* Progress rail + stepper */}
          <div className="mb-8">
            <div className="mb-5 flex items-start">
              {steps.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <Fragment key={s.title}>
                    <div className="flex w-16 shrink-0 flex-col items-center gap-2">
                      <div
                        className={`flex size-9 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : active
                              ? "border-primary bg-background text-foreground"
                              : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {done ? (
                          <IconCheck className="size-4" />
                        ) : (
                          <s.icon className="size-4" />
                        )}
                      </div>
                      <span
                        className={`hidden text-center text-xs sm:block ${
                          active || done
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="mt-4 h-px flex-1 bg-border">
                        <div
                          className="h-px bg-primary transition-all"
                          style={{ width: done ? "100%" : "0%" }}
                        />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            {step === 0 && (
              <div className="space-y-6">
                <StepHeading
                  eyebrow="Step 1 of 4"
                  title="Welcome to OrbynAdmin"
                  description="Let's set up your account. This only takes a minute."
                />
                <div className="space-y-4">
                  <Field label="Full name" htmlFor="name">
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </Field>
                  <Field label="Work email" htmlFor="email">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                    />
                  </Field>
                  <Field label="Password" htmlFor="password" hint="Minimum 8 characters">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <StepHeading
                  eyebrow="Step 2 of 4"
                  title="Create your workspace"
                  description="This is where you and your team will collaborate."
                />
                <div className="space-y-4">
                  <Field label="Workspace name" htmlFor="workspace">
                    <Input
                      id="workspace"
                      value={workspace}
                      onChange={(e) => setWorkspace(e.target.value)}
                      placeholder="OrbynAdmin"
                    />
                  </Field>
                  <Field label="Workspace URL" htmlFor="slug">
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>orbynadmin.com/</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="slug"
                        value={slug}
                        onChange={(e) =>
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          )
                        }
                        placeholder="your-team"
                      />
                    </InputGroup>
                  </Field>
                  <Field label="Company size">
                    <RadioGroup
                      value={teamSize}
                      onValueChange={setTeamSize}
                      className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                    >
                      {teamSizes.map((size) => (
                        <Label
                          key={size}
                          htmlFor={`size-${size}`}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-normal transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem id={`size-${size}`} value={size} />
                          {size}
                        </Label>
                      ))}
                    </RadioGroup>
                  </Field>
                  <Field label="Industry" htmlFor="industry">
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger id="industry" className="w-full">
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">Software / SaaS</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="fintech">Fintech</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <StepHeading
                  eyebrow="Step 3 of 4"
                  title="Invite your team"
                  description="Collaboration is better together. Add teammates now or later."
                />
                <div className="space-y-3">
                  {invites.map((inv) => (
                    <div key={inv.id} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <IconMail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={inv.email}
                          onChange={(e) =>
                            updateInvite(inv.id, { email: e.target.value })
                          }
                          placeholder="teammate@orbynadmin.com"
                          className="pl-9"
                        />
                      </div>
                      <Select
                        value={inv.role}
                        onValueChange={(v) => updateInvite(inv.id, { role: v })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground"
                        onClick={() => removeInvite(inv.id)}
                        aria-label="Remove invite"
                      >
                        <IconX className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={addInvite}
                >
                  <IconPlus className="size-4" /> Add another
                </Button>
                <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
                  Teammates will receive an email invitation to join{" "}
                  <span className="font-medium text-foreground">{workspace}</span>
                  . You can manage roles anytime from settings.
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 py-4 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <IconConfetti className="size-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    You&apos;re all set!
                  </h2>
                  <p className="mx-auto max-w-sm text-muted-foreground">
                    Your workspace{" "}
                    <span className="font-medium text-foreground">
                      {workspace}
                    </span>{" "}
                    is ready to go. Jump in and start building.
                  </p>
                </div>

                <div className="mx-auto max-w-sm space-y-3 rounded-xl border bg-muted/30 p-4 text-left">
                  <SummaryRow label="Account" value={fullName} />
                  <Separator />
                  <SummaryRow label="Workspace" value={`orbynadmin.com/${slug || "orbynadmin"}`} />
                  <Separator />
                  <SummaryRow
                    label="Invited"
                    value={`${invites.filter((i) => i.email.trim()).length} teammates`}
                  />
                </div>

                <Button size="lg" className="h-11 w-full gap-2 px-6 text-sm" asChild>
                  <Link href="/dashboard">
                    Go to dashboard <IconArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Footer controls */}
            {!isLast && (
              <>
                <Separator className="my-6" />
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={back}
                    disabled={step === 0}
                    className="gap-1.5"
                  >
                    <IconArrowLeft className="size-4" /> Back
                  </Button>
                  <Button onClick={next} className="gap-1.5">
                    {step === steps.length - 2 ? "Finish setup" : "Continue"}
                    <IconArrowRight className="size-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {!isLast && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Need help?{" "}
              <Link
                href="/dashboard"
                className="font-medium text-foreground hover:underline"
              >
                Contact support
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function StepHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
