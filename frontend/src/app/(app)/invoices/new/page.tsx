"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customers } from "@/data";

const clientOptions = customers.slice(0, 8).map((c) => ({
  name: c.name,
  email: c.email,
  company: c.company,
}));

type DraftItem = {
  id: number;
  description: string;
  qty: number;
  unitPrice: number;
};

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

let nextId = 1;
const newItem = (): DraftItem => ({
  id: nextId++,
  description: "",
  qty: 1,
  unitPrice: 0,
});

export default function NewInvoicePage() {
  const router = useRouter();

  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [issued, setIssued] = useState("");
  const [due, setDue] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([newItem()]);

  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = items.reduce(
      (s, it) => s + (it.qty || 0) * (it.unitPrice || 0),
      0
    );
    const tax = Math.round(subtotal * 0.08);
    return { subtotal, tax, total: subtotal + tax };
  }, [items]);

  function updateItem(id: number, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }

  function removeItem(id: number) {
    setItems((prev) =>
      prev.length > 1 ? prev.filter((it) => it.id !== id) : prev
    );
  }

  function handleClientChange(name: string) {
    setClient(name);
    const match = clientOptions.find((c) => c.name === name);
    if (match) setEmail(match.email);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Invoice created", {
      description: client
        ? `Draft saved for ${client} · ${usd(total)}`
        : `Draft saved · ${usd(total)}`,
    });
    router.push("/invoices");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        title="New invoice"
        description="Build a new invoice, add line items and send it to your client."
      >
        <Button type="button" variant="outline" asChild>
          <Link href="/invoices">Cancel</Link>
        </Button>
        <Button type="submit">
          Save invoice
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client + dates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bill to</CardTitle>
            <CardDescription>
              Choose the client and set the invoice dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={client} onValueChange={handleClientChange}>
                <SelectTrigger id="client" className="w-full">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Client email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issued">Issue date</Label>
              <Input
                id="issued"
                type="date"
                value={issued}
                onChange={(e) => setIssued(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Totals update as you edit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{usd(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span className="font-medium tabular-nums">{usd(tax)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-semibold tracking-tight tabular-nums">
                {usd(total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line items */}
      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <CardDescription>
            Add the products or services you are billing for.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Column labels (desktop) */}
          <div className="hidden gap-3 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[1fr_5rem_8rem_7rem_2.5rem]">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Amount</span>
            <span />
          </div>

          {items.map((it) => (
            <div
              key={it.id}
              className="grid gap-3 sm:grid-cols-[1fr_5rem_8rem_7rem_2.5rem] sm:items-center"
            >
              <Input
                value={it.description}
                onChange={(e) =>
                  updateItem(it.id, { description: e.target.value })
                }
                placeholder="e.g. Pro plan — annual license"
              />
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={it.qty}
                onChange={(e) =>
                  updateItem(it.id, { qty: Number(e.target.value) })
                }
                className="tabular-nums sm:text-right"
                aria-label="Quantity"
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={it.unitPrice}
                onChange={(e) =>
                  updateItem(it.id, { unitPrice: Number(e.target.value) })
                }
                className="tabular-nums sm:text-right"
                aria-label="Unit price"
              />
              <div className="flex h-9 items-center justify-end px-1 font-medium tabular-nums sm:h-auto">
                {usd((it.qty || 0) * (it.unitPrice || 0))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="justify-self-end text-muted-foreground"
                onClick={() => removeItem(it.id)}
                disabled={items.length === 1}
                aria-label="Remove line item"
              >
                <IconTrash className="size-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setItems((prev) => [...prev, newItem()])}
          >
            <IconPlus className="size-4" /> Add line item
          </Button>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            Optional message or payment terms shown on the invoice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment is due within 30 days. Thank you for your business!"
            className="min-h-24"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" asChild>
          <Link href="/invoices">Cancel</Link>
        </Button>
        <Button type="submit">Save invoice</Button>
      </div>
    </form>
  );
}
