import {
  IconMail,
  IconAt,
  IconCreditCard,
  IconSearch,
  IconInfoCircle,
  IconAlertCircle,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SaveFooter, FilterActions } from "./form-actions";

export const metadata = { title: "Form Layouts" };

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Form Layouts"
        description="A reference of form patterns — horizontal, two-column, inline filters and field states."
      />

      {/* (a) Horizontal — Account settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account settings</CardTitle>
          <CardDescription>
            Update your public profile. Labels sit beside each field on wide
            screens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldRow
            htmlFor="acc-name"
            label="Display name"
            description="This is how your name appears across the workspace."
          >
            <Input id="acc-name" defaultValue="Alex Morgan" />
          </FieldRow>
          <Separator />
          <FieldRow
            htmlFor="acc-email"
            label="Email address"
            description="Used for sign-in and account notifications."
          >
            <InputGroup>
              <InputGroupAddon>
                <IconMail />
              </InputGroupAddon>
              <InputGroupInput
                id="acc-email"
                type="email"
                defaultValue="alex.morgan@orbynadmin.com"
              />
            </InputGroup>
          </FieldRow>
          <Separator />
          <FieldRow
            htmlFor="acc-username"
            label="Username"
            description="Your unique handle at orbynadmin.com."
          >
            <InputGroup>
              <InputGroupAddon>
                <IconAt />
              </InputGroupAddon>
              <InputGroupInput id="acc-username" defaultValue="alexmorgan" />
            </InputGroup>
          </FieldRow>
          <Separator />
          <FieldRow
            htmlFor="acc-website"
            label="Website"
            description="Add a link to your portfolio or company."
          >
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>https://</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput id="acc-website" defaultValue="alexmorgan.design" />
            </InputGroup>
          </FieldRow>
          <Separator />
          <FieldRow
            htmlFor="acc-bio"
            label="Bio"
            description="A short description shown on your profile."
          >
            <Textarea
              id="acc-bio"
              rows={3}
              defaultValue="Head of Product at OrbynAdmin. Building calm, focused software for teams that ship."
            />
          </FieldRow>
        </CardContent>
        <SaveFooter />
      </Card>

      {/* (b) Two-column — Billing details */}
      <Card>
        <CardHeader>
          <CardTitle>Billing details</CardTitle>
          <CardDescription>
            The card and address we use for your monthly invoice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cardholder name" htmlFor="bill-name" className="sm:col-span-2">
              <Input id="bill-name" defaultValue="Alexandra Morgan" />
            </Field>
            <Field label="Card number" htmlFor="bill-card" className="sm:col-span-2">
              <InputGroup>
                <InputGroupAddon>
                  <IconCreditCard />
                </InputGroupAddon>
                <InputGroupInput id="bill-card" defaultValue="4242 4242 4242 4242" />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>Visa</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field label="Expiry date" htmlFor="bill-exp">
              <Input id="bill-exp" defaultValue="09 / 27" />
            </Field>
            <Field label="CVC" htmlFor="bill-cvc">
              <Input id="bill-cvc" defaultValue="123" />
            </Field>
            <Field label="Country" htmlFor="bill-country">
              <Select defaultValue="us">
                <SelectTrigger id="bill-country" className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Postal code" htmlFor="bill-zip">
              <Input id="bill-zip" defaultValue="94114" />
            </Field>
            <Field label="Billing address" htmlFor="bill-addr" className="sm:col-span-2">
              <Input id="bill-addr" defaultValue="2100 Market Street, Suite 400" />
            </Field>
            <Field label="City" htmlFor="bill-city">
              <Input id="bill-city" defaultValue="San Francisco" />
            </Field>
            <Field label="State / Region" htmlFor="bill-state">
              <Input id="bill-state" defaultValue="California" />
            </Field>
          </div>
        </CardContent>
        <SaveFooter saveLabel="Save billing details" />
      </Card>

      {/* (c) Inline filter bar */}
      <Card>
        <CardHeader>
          <CardTitle>Filter customers</CardTitle>
          <CardDescription>
            Combine controls in a single inline bar for dense list views.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex-1 space-y-1.5 sm:min-w-[220px]">
              <Label htmlFor="flt-search">Search</Label>
              <InputGroup>
                <InputGroupAddon>
                  <IconSearch />
                </InputGroupAddon>
                <InputGroupInput
                  id="flt-search"
                  placeholder="Search by name or email…"
                />
              </InputGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flt-status">Status</Label>
              <Select defaultValue="all">
                <SelectTrigger id="flt-status" className="w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flt-plan">Plan</Label>
              <Select defaultValue="all">
                <SelectTrigger id="flt-plan" className="w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flt-date">Joined after</Label>
              <Input
                id="flt-date"
                type="date"
                defaultValue="2024-01-01"
                className="sm:w-[170px]"
              />
            </div>
            <FilterActions />
          </div>
        </CardContent>
      </Card>

      {/* (d) Input variants */}
      <Card>
        <CardHeader>
          <CardTitle>Input states</CardTitle>
          <CardDescription>
            Icons, helper text, disabled and validation states.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="With leading icon" htmlFor="var-icon">
              <InputGroup>
                <InputGroupAddon>
                  <IconSearch />
                </InputGroupAddon>
                <InputGroupInput id="var-icon" placeholder="Search projects…" />
              </InputGroup>
            </Field>
            <Field label="Disabled" htmlFor="var-disabled">
              <Input id="var-disabled" defaultValue="Locked value" disabled />
            </Field>
            <Field
              label="With helper text"
              htmlFor="var-help"
              hint="Use 24 characters or fewer, no spaces."
            >
              <Input id="var-help" defaultValue="orbynadmin-production" />
            </Field>
            <Field
              label="Error state"
              htmlFor="var-error"
              error="Enter a valid email address."
            >
              <InputGroup className="border-destructive ring-3 ring-destructive/20">
                <InputGroupAddon>
                  <IconAlertCircle className="text-destructive" />
                </InputGroupAddon>
                <InputGroupInput
                  id="var-error"
                  aria-invalid
                  defaultValue="alex@orbynadmin"
                />
              </InputGroup>
            </Field>
          </div>
        </CardContent>
        <SaveFooter />
      </Card>

      {/* (e) Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>
            Selects, choices, toggles and multi-line text in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Select */}
            <Field label="Role" htmlFor="ctl-role">
              <Select defaultValue="admin">
                <SelectTrigger id="ctl-role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="billing">Billing manager</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Date */}
            <Field
              label="Start date"
              htmlFor="ctl-date"
              hint="When this member gains access."
            >
              <Input id="ctl-date" type="date" defaultValue="2026-08-01" />
            </Field>

            {/* Checkbox group */}
            <div className="space-y-2.5">
              <p className="text-sm font-medium">Email preferences</p>
              <div className="space-y-2.5">
                <CheckRow
                  id="chk-product"
                  label="Product updates"
                  hint="News about features and improvements."
                  defaultChecked
                />
                <CheckRow
                  id="chk-security"
                  label="Security alerts"
                  hint="Sign-ins and unusual activity."
                  defaultChecked
                />
                <CheckRow
                  id="chk-marketing"
                  label="Marketing & offers"
                  hint="Occasional tips and promotions."
                />
              </div>
            </div>

            {/* Radio group */}
            <div className="space-y-2.5">
              <p className="text-sm font-medium">Workspace plan</p>
              <RadioGroup defaultValue="pro" className="gap-2.5">
                <RadioRow
                  id="rad-free"
                  value="free"
                  label="Free"
                  hint="Up to 3 seats and 1 project."
                />
                <RadioRow
                  id="rad-pro"
                  value="pro"
                  label="Pro"
                  hint="Unlimited projects and analytics."
                />
                <RadioRow
                  id="rad-ent"
                  value="enterprise"
                  label="Enterprise"
                  hint="SSO, audit logs and priority support."
                />
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Switch rows */}
          <div className="space-y-4">
            <p className="text-sm font-medium">Notifications</p>
            <SwitchRow
              id="sw-mentions"
              label="Mentions"
              hint="Notify me when someone @mentions me."
              defaultChecked
            />
            <SwitchRow
              id="sw-comments"
              label="Comments"
              hint="Notify me on replies to my threads."
              defaultChecked
            />
            <SwitchRow
              id="sw-digest"
              label="Weekly digest"
              hint="A Monday summary of activity."
            />
          </div>

          <Separator />

          {/* Textarea */}
          <Field
            label="Notes"
            htmlFor="ctl-notes"
            hint="Internal only — visible to your team."
          >
            <Textarea
              id="ctl-notes"
              rows={4}
              placeholder="Add context for this account…"
            />
          </Field>
        </CardContent>
        <SaveFooter saveLabel="Save preferences" />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                             */
/* ------------------------------------------------------------------ */

function FieldRow({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string;
  htmlFor: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[220px_1fr] sm:items-start sm:gap-6">
      <div className="space-y-1">
        <Label htmlFor={htmlFor}>{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="max-w-md">{children}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconInfoCircle className="size-3.5" /> {hint}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <IconAlertCircle className="size-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

function CheckRow({
  id,
  label,
  hint,
  defaultChecked,
}: {
  id: string;
  label: string;
  hint: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox id={id} defaultChecked={defaultChecked} className="mt-0.5" />
      <div className="space-y-0.5">
        <Label htmlFor={id} className="font-normal">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function RadioRow({
  id,
  value,
  label,
  hint,
}: {
  id: string;
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border p-3">
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <div className="space-y-0.5">
        <Label htmlFor={id} className="font-normal">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function SwitchRow({
  id,
  label,
  hint,
  defaultChecked,
}: {
  id: string;
  label: string;
  hint: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="font-normal">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  );
}
