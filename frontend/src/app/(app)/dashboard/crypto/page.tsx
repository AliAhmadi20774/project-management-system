"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  IconPlus,
  IconWallet,
  IconArrowsExchange2,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconArrowDownRight,
  IconSend,
  IconDotsVertical,
  IconCopy,
  IconShare,
  IconQrcode,
  IconRefresh,
  IconStar,
  IconStarFilled,
  IconLock,
  IconShieldCheck,
  type Icon,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { CryptoPortfolioChart } from "@/components/charts/crypto-portfolio-chart";
import { CryptoAllocationChart } from "@/components/charts/crypto-allocation-chart";
import { CoinIcon } from "@/components/crypto-icon";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  cryptoAssets,
  cryptoPortfolioRanges,
  cryptoTransactions,
  type CryptoTx,
} from "@/data";

// --- helpers ---------------------------------------------------------------

const RANGES = ["24H", "7D", "30D", "1Y"] as const;
type Range = (typeof RANGES)[number];
type Side = "Buy" | "Sell";

const RECEIVE_ADDRESS = "0x7A9f3C21bD4e8F0a12C6b5D93aE47cF1029bD3e8";

const fmtPrice = (n: number) =>
  n >= 1
    ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${n.toFixed(2)}`;

const fmtUSD = (n: number) => `$${Math.round(n).toLocaleString()}`;

const txMeta: Record<
  CryptoTx["type"],
  { icon: Icon; cls: string; sign: "+" | "-" | "" }
> = {
  Buy: { icon: IconArrowDownLeft, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", sign: "+" },
  Receive: { icon: IconArrowDownLeft, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", sign: "+" },
  Sell: { icon: IconArrowUpRight, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400", sign: "-" },
  Send: { icon: IconArrowUpRight, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400", sign: "-" },
  Swap: { icon: IconArrowsExchange2, cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400", sign: "" },
  Stake: { icon: IconLock, cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400", sign: "" },
};

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const w = 80;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={up ? "text-emerald-500" : "text-rose-500"}
      aria-hidden
    >
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChangePill({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-sm font-medium tabular-nums ${
        up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
      }`}
    >
      {up ? (
        <IconArrowUpRight className="size-3.5" />
      ) : (
        <IconArrowDownRight className="size-3.5" />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function CryptoPage() {
  const [range, setRange] = useState<Range>("7D");
  const [txs, setTxs] = useState<CryptoTx[]>(cryptoTransactions);
  const [starred, setStarred] = useState<Set<string>>(new Set(["BTC", "ETH", "SOL"]));

  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeSide, setTradeSide] = useState<Side>("Buy");
  const [tradeSymbol, setTradeSymbol] = useState("BTC");
  const [tradeAmount, setTradeAmount] = useState("500");
  const [receiveOpen, setReceiveOpen] = useState(false);

  const [sendOpen, setSendOpen] = useState(false);
  const [sendSymbol, setSendSymbol] = useState("BTC");
  const [sendAmount, setSendAmount] = useState("");
  const [sendTo, setSendTo] = useState("");

  const [swapOpen, setSwapOpen] = useState(false);
  const [swapFrom, setSwapFrom] = useState("USDC");
  const [swapTo, setSwapTo] = useState("ETH");
  const [swapAmount, setSwapAmount] = useState("");

  const nextId = useRef(1);

  // Derived portfolio figures, all computed from holdings so the hero, donut
  // and watchlist stay perfectly in sync.
  const assets = useMemo(
    () => cryptoAssets.map((a) => ({ ...a, value: a.price * a.holdings })),
    []
  );
  const totalValue = useMemo(
    () => assets.reduce((s, a) => s + a.value, 0),
    [assets]
  );
  const weightedChange = useMemo(
    () => assets.reduce((s, a) => s + a.value * a.change24h, 0) / totalValue,
    [assets, totalValue]
  );
  const pnl24h = (totalValue * weightedChange) / 100;
  const best = useMemo(
    () => [...assets].sort((a, b) => b.change24h - a.change24h)[0],
    [assets]
  );

  const allocation = useMemo(
    () =>
      [...assets]
        .sort((a, b) => b.value - a.value)
        .map((a) => ({ name: a.symbol, value: Math.round(a.value), fill: a.color })),
    [assets]
  );

  const movers = useMemo(
    () => [...assets].sort((a, b) => b.change24h - a.change24h),
    [assets]
  );

  const assetBySymbol = useMemo(
    () => Object.fromEntries(assets.map((a) => [a.symbol, a])),
    [assets]
  );

  const stats = [
    {
      label: "Portfolio Value",
      value: fmtUSD(totalValue),
      change: Number(weightedChange.toFixed(1)),
      trend: weightedChange >= 0 ? ("up" as const) : ("down" as const),
      hint: "across 3 chains",
    },
    {
      label: "24h Profit / Loss",
      value: `${pnl24h >= 0 ? "+" : "-"}${fmtUSD(Math.abs(pnl24h))}`,
      change: Number(Math.abs(weightedChange).toFixed(1)),
      trend: pnl24h >= 0 ? ("up" as const) : ("down" as const),
      hint: "unrealized",
    },
    {
      label: "Best Performer",
      value: best.symbol,
      change: best.change24h,
      trend: "up" as const,
      hint: `${best.name} · 24h`,
    },
    {
      label: "Staking Rewards",
      value: "$1,942",
      change: 5.1,
      trend: "up" as const,
      hint: "6.8% avg APY",
    },
  ];

  function openTrade(side: Side, symbol = "BTC") {
    setTradeSide(side);
    setTradeSymbol(symbol);
    setTradeAmount("500");
    setTradeOpen(true);
  }

  function toggleStar(symbol: string) {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
        toast("Removed from watchlist", { description: symbol });
      } else {
        next.add(symbol);
        toast.success("Added to watchlist", { description: symbol });
      }
      return next;
    });
  }

  function handleTrade(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const asset = assetBySymbol[tradeSymbol];
    const usd = Math.max(0, Number(tradeAmount) || 0);
    if (!asset || usd <= 0) {
      toast.error("Enter an amount to continue");
      return;
    }
    const units = usd / asset.price;
    const tx: CryptoTx = {
      id: `TX-N${nextId.current++}`,
      type: tradeSide,
      asset: asset.symbol,
      amount: Number(units.toFixed(asset.price >= 100 ? 4 : 2)),
      value: usd,
      time: "Just now",
      status: "Completed",
    };
    setTxs((prev) => [tx, ...prev]);
    setTradeOpen(false);
    toast.success(`${tradeSide} order filled`, {
      description: `${tradeSide === "Buy" ? "Bought" : "Sold"} ${tx.amount} ${
        asset.symbol
      } for ${fmtUSD(usd)}.`,
    });
  }

  function copyAddress() {
    navigator.clipboard.writeText(RECEIVE_ADDRESS).then(
      () => toast.success("Address copied", { description: "Your wallet address is on the clipboard." }),
      () => toast.error("Could not copy address")
    );
  }

  function shareAddress() {
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };
    if (nav.share) {
      nav
        .share({ title: "My wallet address", text: RECEIVE_ADDRESS })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(RECEIVE_ADDRESS).then(
        () =>
          toast.success("Ready to share", {
            description: "Address copied to your clipboard.",
          }),
        () => toast.error("Could not share")
      );
    }
  }

  function openSend(symbol = "BTC") {
    setSendSymbol(symbol);
    setSendAmount("");
    setSendTo("");
    setSendOpen(true);
  }

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const asset = assetBySymbol[sendSymbol];
    const units = Math.max(0, Number(sendAmount) || 0);
    const to = sendTo.trim();
    if (!asset || units <= 0) return toast.error("Enter an amount to send");
    if (!to) return toast.error("Enter a destination address");
    if (units > asset.holdings) return toast.error("Amount exceeds your balance");
    const short = to.length > 12 ? `${to.slice(0, 6)}…${to.slice(-4)}` : to;
    const tx: CryptoTx = {
      id: `TX-N${nextId.current++}`,
      type: "Send",
      asset: asset.symbol,
      detail: `to ${short}`,
      amount: units,
      value: units * asset.price,
      time: "Just now",
      status: "Completed",
    };
    setTxs((prev) => [tx, ...prev]);
    setSendOpen(false);
    toast.success("Transfer sent", {
      description: `Sent ${units} ${asset.symbol} (${fmtUSD(units * asset.price)}).`,
    });
  }

  function openSwap() {
    setSwapFrom("USDC");
    setSwapTo("ETH");
    setSwapAmount("");
    setSwapOpen(true);
  }

  function handleSwap(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const from = assetBySymbol[swapFrom];
    const to = assetBySymbol[swapTo];
    const units = Math.max(0, Number(swapAmount) || 0);
    if (!from || !to || swapFrom === swapTo || units <= 0)
      return toast.error("Choose two assets and an amount");
    if (units > from.holdings) return toast.error("Amount exceeds your balance");
    const usd = units * from.price;
    const out = usd / to.price;
    const tx: CryptoTx = {
      id: `TX-N${nextId.current++}`,
      type: "Swap",
      asset: to.symbol,
      detail: `${from.symbol} → ${to.symbol}`,
      amount: Number(out.toFixed(to.price >= 100 ? 4 : 2)),
      value: usd,
      time: "Just now",
      status: "Completed",
    };
    setTxs((prev) => [tx, ...prev]);
    setSwapOpen(false);
    toast.success("Swap complete", {
      description: `Swapped ${units} ${from.symbol} for ${tx.amount} ${to.symbol}.`,
    });
  }

  const tradeAsset = assetBySymbol[tradeSymbol];
  const tradeUnits =
    tradeAsset && Number(tradeAmount) > 0 ? Number(tradeAmount) / tradeAsset.price : 0;
  const sendAsset = assetBySymbol[sendSymbol];
  const swapFromAsset = assetBySymbol[swapFrom];
  const swapToAsset = assetBySymbol[swapTo];
  const swapOut =
    swapFromAsset && swapToAsset && Number(swapAmount) > 0
      ? (Number(swapAmount) * swapFromAsset.price) / swapToAsset.price
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crypto"
        description="Track your Web3 portfolio, markets and on-chain activity."
      >
        <Button variant="outline" size="sm" onClick={() => setReceiveOpen(true)}>
          <IconQrcode className="size-4" /> Receive
        </Button>
        <Button size="sm" onClick={() => openTrade("Buy")}>
          <IconPlus className="size-4" /> Buy crypto
        </Button>
      </PageHeader>

      {/* Connected wallet strip */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border bg-card p-3 text-sm">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconWallet className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-medium">Main Wallet</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            0x7A9f…D3e8
          </p>
        </div>
        <Badge
          variant="secondary"
          className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" /> Connected
        </Badge>
        <div className="ms-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openTrade("Sell")}>
            <IconArrowUpRight className="size-4" /> Sell
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openSend()}>
            <IconSend className="size-4" /> Send
          </Button>
          <Button variant="ghost" size="sm" onClick={openSwap}>
            <IconArrowsExchange2 className="size-4" /> Swap
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Value</CardTitle>
            <CardDescription>
              <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {fmtUSD(totalValue)}
              </span>{" "}
              <ChangePill value={weightedChange} />
            </CardDescription>
            <CardAction>
              <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
                <TabsList>
                  {RANGES.map((r) => (
                    <TabsTrigger key={r} value={r} className="px-2.5 text-xs">
                      {r}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardAction>
          </CardHeader>
          <CardContent>
            <CryptoPortfolioChart data={cryptoPortfolioRanges[range]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
            <CardDescription>Holdings by market value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CryptoAllocationChart data={allocation} total={totalValue} />
            <div className="space-y-2.5">
              {allocation.slice(0, 5).map((a) => (
                <div key={a.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: a.fill }}
                  />
                  <span className="font-medium">{a.name}</span>
                  <span className="ms-auto text-muted-foreground tabular-nums">
                    {((a.value / totalValue) * 100).toFixed(1)}%
                  </span>
                  <span className="w-20 text-right font-medium tabular-nums">
                    {fmtUSD(a.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Markets / watchlist */}
      <Card>
        <CardHeader>
          <CardTitle>Markets</CardTitle>
          <CardDescription>Live prices and your holdings</CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toast.success("Prices refreshed", {
                  description: "Showing the latest market data.",
                })
              }
            >
              <IconRefresh className="size-4" /> Refresh
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Asset</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h</TableHead>
                <TableHead>Last 7 days</TableHead>
                <TableHead className="text-right">Holdings</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((a) => {
                const up = a.change24h >= 0;
                return (
                  <TableRow key={a.symbol}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleStar(a.symbol)}
                          className="text-muted-foreground transition-colors hover:text-amber-500"
                          aria-label={
                            starred.has(a.symbol)
                              ? `Unwatch ${a.symbol}`
                              : `Watch ${a.symbol}`
                          }
                        >
                          {starred.has(a.symbol) ? (
                            <IconStarFilled className="size-4 text-amber-500" />
                          ) : (
                            <IconStar className="size-4" />
                          )}
                        </button>
                        <CoinIcon symbol={a.symbol} size={32} className="shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium whitespace-nowrap">{a.name}</p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {a.symbol} · {a.chain}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {fmtPrice(a.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`tabular-nums ${
                          up
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {up ? "+" : ""}
                        {a.change24h.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Sparkline data={a.spark} up={up} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums whitespace-nowrap">
                      {a.holdings.toLocaleString()} {a.symbol}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {fmtUSD(a.value)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTrade("Buy", a.symbol)}
                        >
                          Trade
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <IconDotsVertical className="size-4" />
                              <span className="sr-only">{a.symbol} actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openTrade("Buy", a.symbol)}>
                              <IconArrowDownLeft className="size-4" /> Buy
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openTrade("Sell", a.symbol)}>
                              <IconArrowUpRight className="size-4" /> Sell
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openSend(a.symbol)}>
                              <IconSend className="size-4" /> Send
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() =>
                                toast("Opening explorer", {
                                  description: `Viewing ${a.name} on-chain.`,
                                })
                              }
                            >
                              <IconShieldCheck className="size-4" /> View on explorer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest on-chain activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {txs.slice(0, 8).map((t) => {
              const meta = txMeta[t.type];
              const MetaIcon = meta.icon;
              const coin = assetBySymbol[t.asset];
              return (
                <div
                  key={t.id}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${meta.cls}`}
                  >
                    <MetaIcon className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {t.type} {t.asset}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.detail ?? `${t.time}`}
                      {t.detail ? ` · ${t.time}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium tabular-nums">
                      {meta.sign}
                      {t.amount.toLocaleString()} {coin?.symbol ?? t.asset}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {fmtUSD(t.value)}
                    </p>
                  </div>
                  <TxStatusBadge status={t.status} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Movers</CardTitle>
            <CardDescription>Biggest 24h moves</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0.5">
            {movers.slice(0, 6).map((a) => {
              const up = a.change24h >= 0;
              return (
                <button
                  key={a.symbol}
                  type="button"
                  onClick={() => openTrade("Buy", a.symbol)}
                  className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  <CoinIcon symbol={a.symbol} size={32} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.symbol}</p>
                    <p className="truncate text-xs text-muted-foreground tabular-nums">
                      {fmtPrice(a.price)}
                    </p>
                  </div>
                  <ChangePill value={a.change24h} />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Trade dialog */}
      <Dialog open={tradeOpen} onOpenChange={setTradeOpen}>
        <DialogContent>
          <form onSubmit={handleTrade}>
            <DialogHeader>
              <DialogTitle>
                {tradeSide} {tradeAsset?.name ?? "crypto"}
              </DialogTitle>
              <DialogDescription>
                Orders are simulated. No real assets change hands.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Tabs value={tradeSide} onValueChange={(v) => setTradeSide(v as Side)}>
                <TabsList className="w-full">
                  <TabsTrigger value="Buy" className="flex-1">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="Sell" className="flex-1">
                    Sell
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="space-y-2">
                <Label htmlFor="trade-asset">Asset</Label>
                <Select value={tradeSymbol} onValueChange={setTradeSymbol}>
                  <SelectTrigger id="trade-asset" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((a) => (
                      <SelectItem key={a.symbol} value={a.symbol}>
                        <CoinIcon symbol={a.symbol} size={18} className="shrink-0" />
                        {a.name}
                        <span className="text-muted-foreground">{a.symbol}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trade-amount">Amount (USD)</Label>
                <Input
                  id="trade-amount"
                  type="number"
                  min={0}
                  step={10}
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="500"
                />
                <p className="text-xs text-muted-foreground">
                  ≈ {tradeUnits.toFixed(tradeAsset && tradeAsset.price >= 100 ? 6 : 2)}{" "}
                  {tradeSymbol} at {tradeAsset ? fmtPrice(tradeAsset.price) : "—"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                {tradeSide === "Buy" ? (
                  <IconArrowDownLeft className="size-4" />
                ) : (
                  <IconArrowUpRight className="size-4" />
                )}
                {tradeSide} {tradeSymbol}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receive dialog */}
      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive crypto</DialogTitle>
            <DialogDescription>
              Send only compatible assets to this address.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex size-40 items-center justify-center rounded-xl border bg-muted/40">
              <IconQrcode className="size-24 text-muted-foreground" />
            </div>
            <div className="w-full space-y-2">
              <Label>Wallet address</Label>
              <div className="relative w-full rounded-md border bg-muted/40">
                <code className="block break-all py-2.5 pr-11 pl-3 font-mono text-xs leading-relaxed">
                  {RECEIVE_ADDRESS}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 size-8 text-muted-foreground hover:text-foreground"
                  onClick={copyAddress}
                >
                  <IconCopy className="size-4" />
                  <span className="sr-only">Copy address</span>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={shareAddress}>
              <IconShare className="size-4" /> Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent>
          <form onSubmit={handleSend}>
            <DialogHeader>
              <DialogTitle>Send {sendAsset?.symbol ?? "crypto"}</DialogTitle>
              <DialogDescription>
                Transfers are simulated. Always double-check the address.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="send-asset">Asset</Label>
                <Select value={sendSymbol} onValueChange={setSendSymbol}>
                  <SelectTrigger id="send-asset" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((a) => (
                      <SelectItem key={a.symbol} value={a.symbol}>
                        <CoinIcon symbol={a.symbol} size={18} className="shrink-0" />
                        {a.name}
                        <span className="text-muted-foreground">{a.symbol}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="send-amount">Amount</Label>
                  <button
                    type="button"
                    onClick={() => setSendAmount(String(sendAsset?.holdings ?? 0))}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Max: {sendAsset?.holdings.toLocaleString()} {sendSymbol}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="send-amount"
                    type="number"
                    min={0}
                    step="any"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    className="pr-14"
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                    {sendSymbol}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ≈ {fmtUSD((Number(sendAmount) || 0) * (sendAsset?.price ?? 0))}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="send-to">Recipient address</Label>
                <Input
                  id="send-to"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="0x…"
                  className="font-mono"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                <span className="text-muted-foreground">Est. network fee</span>
                <span className="font-medium tabular-nums">~$1.20</span>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                <IconSend className="size-4" /> Send {sendSymbol}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Swap dialog */}
      <Dialog open={swapOpen} onOpenChange={setSwapOpen}>
        <DialogContent>
          <form onSubmit={handleSwap}>
            <DialogHeader>
              <DialogTitle>Swap tokens</DialogTitle>
              <DialogDescription>
                Simulated swap at current market rates.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-1 py-4">
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">You pay</Label>
                  <button
                    type="button"
                    onClick={() => setSwapAmount(String(swapFromAsset?.holdings ?? 0))}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Balance: {swapFromAsset?.holdings.toLocaleString()} {swapFrom}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-auto border-0 bg-transparent px-0 text-lg! font-semibold shadow-none focus-visible:ring-0"
                  />
                  <Select value={swapFrom} onValueChange={setSwapFrom}>
                    <SelectTrigger className="shrink-0 gap-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((a) => (
                        <SelectItem key={a.symbol} value={a.symbol}>
                          <CoinIcon symbol={a.symbol} size={18} className="shrink-0" />
                          {a.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="z-10 -my-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSwapFrom(swapTo);
                    setSwapTo(swapFrom);
                  }}
                  className="flex size-8 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted"
                  aria-label="Switch direction"
                >
                  <IconArrowsExchange2 className="size-4 rotate-90" />
                </button>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <Label className="text-xs text-muted-foreground">You receive</Label>
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-lg font-semibold tabular-nums">
                    {swapOut
                      ? swapOut.toFixed(
                          swapToAsset && swapToAsset.price >= 100 ? 6 : 4
                        )
                      : "0.00"}
                  </span>
                  <Select value={swapTo} onValueChange={setSwapTo}>
                    <SelectTrigger className="shrink-0 gap-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((a) => (
                        <SelectItem key={a.symbol} value={a.symbol}>
                          <CoinIcon symbol={a.symbol} size={18} className="shrink-0" />
                          {a.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {swapFromAsset && swapToAsset && swapFrom !== swapTo && (
                <p className="px-1 pt-2 text-xs text-muted-foreground">
                  1 {swapFrom} ≈{" "}
                  {(swapFromAsset.price / swapToAsset.price).toLocaleString(
                    undefined,
                    { maximumFractionDigits: 6 }
                  )}{" "}
                  {swapTo}
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                <IconArrowsExchange2 className="size-4" /> Swap
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TxStatusBadge({ status }: { status: CryptoTx["status"] }) {
  const map: Record<CryptoTx["status"], string> = {
    Completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };
  return (
    <Badge
      variant="secondary"
      className={`hidden shrink-0 sm:inline-flex ${map[status]}`}
    >
      {status}
    </Badge>
  );
}
