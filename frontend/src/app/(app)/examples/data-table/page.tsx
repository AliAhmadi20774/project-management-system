"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconCopy,
  IconTrash,
  IconTable,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DataTable, SortableHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { customers, type Customer } from "@/data";

const statusStyles: Record<Customer["status"], string> = {
  Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Inactive: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const planStyles: Record<Customer["plan"], string> = {
  Free: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Pro: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Enterprise: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function makeColumns(
  onDelete: (customer: Customer) => void
): ColumnDef<Customer>[] {
  return [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select ${row.original.name}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={c.avatar} alt={c.name} />
            <AvatarFallback>{initials(c.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              href={`/customers/${c.id}`}
              className="font-medium hover:underline"
            >
              {c.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{c.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.company}</span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <Badge variant="secondary" className={planStyles[row.original.plan]}>
        {row.original.plan}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className={statusStyles[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "spent",
    header: ({ column }) => (
      <div className="flex justify-end">
        <SortableHeader column={column} title="Spent" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        ${row.original.spent.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.location}</span>
    ),
  },
  {
    accessorKey: "joined",
    header: ({ column }) => <SortableHeader column={column} title="Joined" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {row.original.joined}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <IconDotsVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/customers/${c.id}`}>
                  <IconEye className="size-4" /> View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/customers/${c.id}/edit`}>
                  <IconPencil className="size-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  navigator.clipboard?.writeText(c.id);
                  toast.success("Customer ID copied", { description: c.id });
                }}
              >
                <IconCopy className="size-4" /> Copy id
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  onDelete(c);
                  toast.success("Customer deleted", {
                    description: `${c.name} was removed.`,
                  });
                }}
              >
                <IconTrash className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  ];
}

export default function DataTableExamplePage() {
  const [data, setData] = useState<Customer[]>(customers);
  const columns = useMemo(
    () =>
      makeColumns((customer) =>
        setData((prev) => prev.filter((c) => c.id !== customer.id))
      ),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Table"
        description="A reusable table with sorting, column visibility, row selection, search and pagination — built on TanStack Table."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconTable className="size-4" /> Customers
          </CardTitle>
          <CardDescription>
            Click a column header to sort, use the View menu to toggle columns,
            select rows with the checkboxes, and search by name. The same
            <span className="font-medium text-foreground"> DataTable </span>
            component powers every list in this template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder="Search customers…"
          />
        </CardContent>
      </Card>
    </div>
  );
}
