import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconFileInvoice } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoices, getInvoiceById, company, type Invoice } from "@/data";
import { InvoiceActions } from "./invoice-actions";

export function generateStaticParams() {
  return invoices.map((inv) => ({ id: inv.id }));
}

const statusStyles: Record<Invoice["status"], string> = {
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Overdue: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = getInvoiceById(id);
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/invoices" aria-label="Back to invoices">
              <IconArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight tabular-nums">
                {invoice.number}
              </h1>
              <Badge
                variant="secondary"
                className={statusStyles[invoice.status]}
              >
                {invoice.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Issued {longDate(invoice.issued)} · Due {longDate(invoice.due)}
            </p>
          </div>
        </div>
        <InvoiceActions
          number={invoice.number}
          clientEmail={invoice.clientEmail}
        />
      </div>

      {/* Printable paper */}
      <Card className="mx-auto w-full max-w-3xl overflow-hidden shadow-sm">
        <CardContent className="space-y-8 p-8 sm:p-12">
          {/* Header: issuer + invoice title */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <IconFileInvoice className="size-6" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">
                  {company.name}
                </p>
                <div className="mt-1 text-sm text-muted-foreground">
                  <p>{company.address}</p>
                  <p>{company.city}</p>
                  <p>{company.country}</p>
                  <p className="mt-1">{company.email}</p>
                  <p>{company.phone}</p>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-3xl font-semibold uppercase tracking-tight">
                Invoice
              </p>
              <p className="mt-1 font-medium tabular-nums text-muted-foreground">
                {invoice.number}
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between gap-8 sm:justify-end">
                  <span className="text-muted-foreground">Issue date</span>
                  <span className="font-medium tabular-nums">
                    {longDate(invoice.issued)}
                  </span>
                </div>
                <div className="flex justify-between gap-8 sm:justify-end">
                  <span className="text-muted-foreground">Due date</span>
                  <span className="font-medium tabular-nums">
                    {longDate(invoice.due)}
                  </span>
                </div>
                <div className="flex justify-between gap-8 sm:justify-end">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{invoice.status}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bill to + tax id */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bill to
              </p>
              <p className="mt-2 font-semibold">{invoice.client}</p>
              <p className="text-sm text-muted-foreground">{invoice.company}</p>
              <p className="text-sm text-muted-foreground">
                {invoice.clientEmail}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                From
              </p>
              <p className="mt-2 font-semibold">{company.name}</p>
              <p className="text-sm text-muted-foreground">
                Tax ID {company.taxId}
              </p>
              <p className="text-sm text-muted-foreground">{company.email}</p>
            </div>
          </div>

          {/* Line items */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9">Description</TableHead>
                  <TableHead className="h-9 text-right">Qty</TableHead>
                  <TableHead className="h-9 text-right">Unit price</TableHead>
                  <TableHead className="h-9 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {item.qty}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {usd(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {usd(item.qty * item.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">
                  {usd(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="font-medium tabular-nums">
                  {usd(invoice.tax)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total due</span>
                <span className="text-xl font-semibold tracking-tight tabular-nums">
                  {usd(invoice.amount)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Footer notes */}
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Payment terms</p>
            <p>
              Payment is due within 30 days of the issue date. Please reference
              invoice {invoice.number} with your payment. Late payments may be
              subject to a 1.5% monthly service charge.
            </p>
            <p className="pt-2">
              Thank you for your business — we appreciate working with{" "}
              {invoice.company}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
