"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconUpload,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCustomerById } from "@/data";

const LOCATIONS = [
  "San Francisco, US",
  "London, UK",
  "Berlin, DE",
  "Toronto, CA",
  "Sydney, AU",
  "Tokyo, JP",
  "Paris, FR",
  "Austin, US",
  "Amsterdam, NL",
  "Singapore, SG",
];

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const customer = getCustomerById(id);
  const [saving, setSaving] = useState(false);

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" /> Back to customers
        </Link>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-lg font-medium">Customer not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We couldn&apos;t find a customer with ID{" "}
              <span className="font-medium">{id}</span>.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/customers">Back to customers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [first, ...rest] = customer.name.split(" ");
  const last = rest.join(" ");
  const num = parseInt(customer.id.replace(/\D/g, ""), 10);
  const role = ["Billing Owner", "Account Admin", "Procurement Lead", "Founder"][
    num % 4
  ];
  const phone = `+1 (415) 555-0${(100 + (num % 800)).toString()}`;
  const initials = customer.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  const locationValue = LOCATIONS.includes(customer.location)
    ? customer.location
    : LOCATIONS[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    toast.success("Changes saved", {
      description: `${customer!.name}'s details have been updated.`,
    });
    router.push(`/customers/${customer!.id}`);
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/customers/${customer.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft className="size-4" /> Back to {customer.name}
      </Link>

      <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          title="Edit Customer"
          description={`Update the record for ${customer.name} · ${customer.id}`}
        >
          <Button variant="outline" asChild>
            <Link href={`/customers/${customer.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            <IconDeviceFloppy className="size-4" /> Save changes
          </Button>
        </PageHeader>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Personal information and how to reach this customer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="size-16 rounded-xl">
                <AvatarImage src={customer.avatar} alt={customer.name} />
                <AvatarFallback className="rounded-xl text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button type="button" variant="outline" size="sm">
                  <IconUpload className="size-4" /> Change photo
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Recommended 400×400px, max 2MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={first}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={last}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={customer.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={phone}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company */}
        <Card>
          <CardHeader>
            <CardTitle>Company</CardTitle>
            <CardDescription>
              Organization and location this customer belongs to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={customer.company}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" defaultValue={role} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Select name="location" defaultValue={locationValue}>
                  <SelectTrigger id="location" className="w-full">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Plan, status and preferences for this account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select name="plan" defaultValue={customer.plan}>
                  <SelectTrigger id="plan" className="w-full">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={customer.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="welcome">Send welcome email</Label>
                  <p className="text-sm text-muted-foreground">
                    Re-send login details and a getting-started guide to this customer.
                  </p>
                </div>
                <Switch id="welcome" name="welcome" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="newsletter">Subscribe to newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Include this customer in product updates and monthly announcements.
                  </p>
                </div>
                <Switch id="newsletter" name="newsletter" defaultChecked />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={`${first} is on the ${customer.plan} plan out of ${customer.company}.`}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/customers/${customer.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            <IconDeviceFloppy className="size-4" /> Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
