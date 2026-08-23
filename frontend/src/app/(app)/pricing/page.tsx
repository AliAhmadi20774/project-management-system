"use client";

import { useState } from "react";
import { IconCheck, IconSparkles } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    description: "For individuals getting started.",
    monthly: 0,
    yearly: 0,
    highlight: false,
    cta: "Get started",
    features: [
      "Up to 3 projects",
      "1 team member",
      "Basic analytics",
      "Community support",
      "1 GB storage",
    ],
  },
  {
    name: "Pro",
    description: "For growing teams that need more.",
    monthly: 49,
    yearly: 39,
    highlight: true,
    cta: "Start free trial",
    features: [
      "Unlimited projects",
      "Up to 10 team members",
      "Advanced analytics",
      "Priority email support",
      "100 GB storage",
      "Custom integrations",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    description: "For organizations at scale.",
    monthly: 149,
    yearly: 129,
    highlight: false,
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO & SAML",
      "Dedicated support manager",
      "Unlimited storage",
      "Audit logs & SLA",
    ],
  },
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Absolutely. You can upgrade, downgrade or cancel at any time from your billing settings. Changes are prorated automatically.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — the Pro plan comes with a 14-day free trial. No credit card required to get started.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and bank transfers for annual Enterprise plans.",
  },
  {
    q: "Do you offer discounts for nonprofits?",
    a: "We offer a 30% discount for registered nonprofits and educational institutions. Reach out to our sales team to apply.",
  },
  {
    q: "What happens when I hit my limits?",
    a: "We'll notify you before you reach a limit and help you pick the right plan. Your data is never deleted for exceeding limits.",
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="space-y-6">
      <div className="mx-auto w-full max-w-5xl space-y-10 py-4">
        <div className="space-y-4 text-center">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary"
          >
            <IconSparkles className="size-3.5" /> Pricing
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Label
              htmlFor="billing"
              className={cn(
                "text-sm",
                !yearly ? "font-medium" : "text-muted-foreground"
              )}
            >
              Monthly
            </Label>
            <Switch
              id="billing"
              checked={yearly}
              onCheckedChange={setYearly}
            />
            <Label
              htmlFor="billing"
              className={cn(
                "text-sm",
                yearly ? "font-medium" : "text-muted-foreground"
              )}
            >
              Yearly
            </Label>
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              Save 20%
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => {
            const price = yearly ? tier.yearly : tier.monthly;
            return (
              <Card
                key={tier.name}
                className={cn(
                  "relative flex flex-col",
                  tier.highlight &&
                    "overflow-visible shadow-lg ring-2 ring-primary lg:-mt-3"
                )}
              >
                {tier.highlight && (
                  <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 shadow-sm">
                    Most popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight tabular-nums">
                      ${price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>
                  <ul className="space-y-3 text-sm">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.highlight ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
