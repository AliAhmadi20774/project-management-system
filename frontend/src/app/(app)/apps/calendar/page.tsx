"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconClock,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type EventColor = "blue" | "emerald" | "amber" | "rose" | "violet";

type CalEvent = {
  day: number;
  title: string;
  time: string;
  color: EventColor;
};

const colorDot: Record<EventColor, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
};

const colorPill: Record<EventColor, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const eventColors: EventColor[] = ["blue", "emerald", "amber", "rose", "violet"];

const initialEvents: CalEvent[] = [
  { day: 3, title: "Design review", time: "10:00 AM", color: "violet" },
  { day: 7, title: "Sprint planning", time: "9:30 AM", color: "blue" },
  { day: 9, title: "1:1 with Emma", time: "2:00 PM", color: "emerald" },
  { day: 14, title: "Product demo", time: "11:00 AM", color: "amber" },
  { day: 17, title: "Board meeting", time: "3:00 PM", color: "rose" },
  { day: 17, title: "Team lunch", time: "12:30 PM", color: "emerald" },
  { day: 22, title: "Release v2.4", time: "All day", color: "blue" },
  { day: 28, title: "Quarterly review", time: "1:00 PM", color: "violet" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BASE_YEAR = 2026;
const BASE_MONTH = 6; // July (0-indexed)
const TODAY = 17;

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<number>(TODAY);

  // New-event dialog state.
  const [addOpen, setAddOpen] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evDay, setEvDay] = useState<number>(TODAY);
  const [evTime, setEvTime] = useState("");
  const [evColor, setEvColor] = useState<EventColor>("blue");

  const view = new Date(BASE_YEAR, BASE_MONTH + monthOffset, 1);
  const monthLabel = view.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(
    view.getFullYear(),
    view.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekday = view.getDay();
  const isBaseMonth = monthOffset === 0;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = (day: number) =>
    isBaseMonth ? events.filter((e) => e.day === day) : [];
  const upcoming = [...events]
    .sort((a, b) => a.day - b.day)
    .filter((e) => e.day >= TODAY);

  function goToday() {
    setMonthOffset(0);
    setSelected(TODAY);
  }

  function openAdd() {
    setEvTitle("");
    setEvDay(isBaseMonth ? selected : TODAY);
    setEvTime("");
    setEvColor("blue");
    setAddOpen(true);
  }

  function addEvent() {
    const t = evTitle.trim();
    if (!t) return;
    const day = Math.min(Math.max(Math.round(evDay) || TODAY, 1), 31);
    setEvents((prev) => [
      ...prev,
      { day, title: t, time: evTime.trim() || "All day", color: evColor },
    ]);
    setMonthOffset(0); // events live in the base month — jump there so it shows
    setSelected(day);
    setAddOpen(false);
    toast.success("Event added", { description: `${t} · Jul ${day}` });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Plan your month at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-r-none"
              onClick={() => setMonthOffset((o) => o - 1)}
              aria-label="Previous month"
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <span className="min-w-32 px-2 text-center text-sm font-medium">
              {monthLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-l-none"
              onClick={() => setMonthOffset((o) => o + 1)}
              aria-label="Next month"
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={goToday}>
            Today
          </Button>
          <Button onClick={openAdd}>
            <IconPlus className="size-4" /> New event
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[560px] sm:min-w-0">
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-2.5 text-center text-xs font-medium text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dayEvents = day ? eventsByDay(day) : [];
              const isToday = isBaseMonth && day === TODAY;
              return (
                <button
                  key={i}
                  disabled={!day}
                  onClick={() => day && setSelected(day)}
                  className={cn(
                    "min-h-24 border-b border-r p-1.5 text-left align-top transition-colors last:border-r-0",
                    "[&:nth-child(7n)]:border-r-0",
                    day ? "hover:bg-muted/40" : "bg-muted/20",
                    day === selected && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                  )}
                >
                  {day && (
                    <>
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((e, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px]"
                          >
                            <span className={cn("size-1.5 shrink-0 rounded-full", colorDot[e.color])} />
                            <span className="truncate text-muted-foreground">{e.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="px-1 text-[11px] text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[440px]">
              <div className="space-y-1 px-4 pb-4">
                {upcoming.length === 0 && (
                  <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
                    No upcoming events.
                  </p>
                )}
                {upcoming.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex flex-col items-center rounded-md bg-muted px-2 py-1">
                      <span className="text-[10px] uppercase text-muted-foreground">Jul</span>
                      <span className="text-sm font-semibold tabular-nums">{e.day}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <IconClock className="size-3" />
                        {e.time}
                      </p>
                    </div>
                    <Badge variant="secondary" className={colorPill[e.color]}>
                      <span className={cn("size-1.5 rounded-full", colorDot[e.color])} />
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New event</DialogTitle>
            <DialogDescription>
              Add an event to July {BASE_YEAR}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ev-title">Title</Label>
              <Input
                id="ev-title"
                value={evTitle}
                onChange={(e) => setEvTitle(e.target.value)}
                placeholder="What's the occasion?"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) addEvent();
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ev-day">Day</Label>
                <Input
                  id="ev-day"
                  type="number"
                  min={1}
                  max={31}
                  value={evDay}
                  onChange={(e) => setEvDay(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-time">Time</Label>
                <Input
                  id="ev-time"
                  value={evTime}
                  onChange={(e) => setEvTime(e.target.value)}
                  placeholder="10:00 AM"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={evColor} onValueChange={(v) => setEvColor(v as EventColor)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventColors.map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-2">
                          <span className={cn("size-2.5 rounded-full", colorDot[c])} />
                          <span className="capitalize">{c}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addEvent} disabled={!evTitle.trim()}>
              Add event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
