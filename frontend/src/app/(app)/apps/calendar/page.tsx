"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { IconChevronLeft, IconChevronRight, IconClock, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type EventColor = "blue" | "emerald" | "amber" | "rose" | "violet";
type CalendarEvent = { id: number; title: string; event_date: string; event_time: string | null; color: EventColor };
type EventForm = { title: string; event_date: string; event_time: string; color: EventColor };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS: EventColor[] = ["blue", "emerald", "amber", "rose", "violet"];
const DOT: Record<EventColor, string> = { blue: "bg-blue-500", emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500", violet: "bg-violet-500" };

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function monthDate(view: Date, day: number) { return dateKey(new Date(view.getFullYear(), view.getMonth(), day)); }
function timeLabel(value: string | null) {
  if (!value) return "All day";
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
}
function blankForm(date: string, event?: CalendarEvent | null): EventForm {
  return event ? { title: event.title, event_date: event.event_date, event_time: event.event_time?.slice(0, 5) ?? "", color: event.color } : { title: "", event_date: date, event_time: "", color: "blue" };
}

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<EventForm>(() => blankForm(dateKey(today)));
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CalendarEvent | null>(null);
  const start = dateKey(view);
  const end = dateKey(new Date(view.getFullYear(), view.getMonth() + 1, 0));

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/calendar-events?start=${start}&end=${end}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load events.");
      setEvents(await response.json());
    } catch (error) {
      setEvents([]);
      toast.error("Could not load calendar", { description: error instanceof Error ? error.message : undefined });
    } finally { setLoading(false); }
  }, [end, start]);
  useEffect(() => {
    const requestId = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(requestId);
  }, [load]);

  const grouped = useMemo(() => events.reduce<Record<string, CalendarEvent[]>>((result, event) => { (result[event.event_date] ??= []).push(event); return result; }, {}), [events]);
  const upcoming = useMemo(() => [...events].filter((event) => event.event_date >= dateKey(today)).sort((a, b) => `${a.event_date}${a.event_time ?? ""}`.localeCompare(`${b.event_date}${b.event_time ?? ""}`)), [events, today]);
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [...Array.from({ length: view.getDay() }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7) cells.push(null);

  function create(date = selectedDate) { setEditing(null); setForm(blankForm(date)); setOpen(true); }
  function edit(event: CalendarEvent) { setEditing(event); setForm(blankForm(event.event_date, event)); setOpen(true); }
  async function save() {
    const title = form.title.trim(); if (!title || !form.event_date) return;
    setSaving(true);
    try {
      const response = await fetch(editing ? `/api/calendar-events/${editing.id}` : "/api/calendar-events", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, title, event_time: form.event_time || null }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.detail || "Could not save event.");
      setOpen(false); setSelectedDate(payload.event_date); toast.success(editing ? "Event updated" : "Event added"); await load();
    } catch (error) { toast.error("Event was not saved", { description: error instanceof Error ? error.message : undefined }); }
    finally { setSaving(false); }
  }
  async function remove(event: CalendarEvent) {
    try { const response = await fetch(`/api/calendar-events/${event.id}`, { method: "DELETE" }); if (!response.ok) throw new Error("Could not delete event."); toast.success("Event deleted"); await load(); }
    catch (error) { toast.error("Event was not deleted", { description: error instanceof Error ? error.message : undefined }); }
  }
  function goToday() { setView(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(dateKey(today)); }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">Calendar</h1><p className="text-sm text-muted-foreground">Plan your month at a glance.</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex items-center rounded-md border"><Button variant="ghost" size="icon" className="rounded-r-none" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} aria-label="Previous month"><IconChevronLeft className="size-4" /></Button><span className="min-w-32 px-2 text-center text-sm font-medium">{view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span><Button variant="ghost" size="icon" className="rounded-l-none" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} aria-label="Next month"><IconChevronRight className="size-4" /></Button></div><Button variant="outline" onClick={goToday}>Today</Button><Button onClick={() => create()}><IconPlus className="size-4" /> New event</Button></div></div>
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]"><Card className="overflow-hidden p-0"><div className="overflow-x-auto"><div className="min-w-[560px] sm:min-w-0"><div className="grid grid-cols-7 border-b bg-muted/30">{DAYS.map((day) => <div key={day} className="py-2.5 text-center text-xs font-medium text-muted-foreground">{day}</div>)}</div><div className="grid grid-cols-7">{cells.map((day, index) => { const date = day ? monthDate(view, day) : ""; const dayEvents = grouped[date] ?? []; return <button key={index} disabled={!day} onClick={() => day && setSelectedDate(date)} className={cn("min-h-24 border-b border-r p-1.5 text-left align-top transition-colors [&:nth-child(7n)]:border-r-0", day ? "hover:bg-muted/40" : "bg-muted/20", date === selectedDate && "bg-primary/5 ring-1 ring-inset ring-primary/30")}>
      {day && <><span className={cn("flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums", date === dateKey(today) ? "bg-primary text-primary-foreground" : "text-foreground")}>{day}</span><div className="mt-1 space-y-1">{dayEvents.slice(0, 2).map((event) => <div key={event.id} onClick={(click) => { click.stopPropagation(); edit(event); }} className="flex cursor-pointer items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] hover:bg-muted"><span className={cn("size-1.5 shrink-0 rounded-full", DOT[event.color])} /><span className="truncate text-muted-foreground">{event.title}</span></div>)}{dayEvents.length > 2 && <span className="px-1 text-[11px] text-muted-foreground">+{dayEvents.length - 2} more</span>}</div></>}
    </button>; })}</div></div></div></Card>
    <Card><CardHeader><CardTitle className="text-base">Upcoming events</CardTitle></CardHeader><CardContent className="p-0"><ScrollArea className="h-[440px]"><div className="space-y-1 px-4 pb-4">{!loading && upcoming.length === 0 && <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">No upcoming events.</p>}{upcoming.map((event) => <div key={event.id} className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"><div className="flex flex-col items-center rounded-md bg-muted px-2 py-1"><span className="text-[10px] uppercase text-muted-foreground">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-US", { month: "short" })}</span><span className="text-sm font-semibold tabular-nums">{event.event_date.slice(-2)}</span></div><button onClick={() => edit(event)} className="min-w-0 flex-1 text-left"><p className="truncate text-sm font-medium">{event.title}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><IconClock className="size-3" />{timeLabel(event.event_time)}</p></button><div className="flex items-center gap-1"><span className={cn("size-2 rounded-full", DOT[event.color])} /><Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100" onClick={() => setPendingDelete(event)} aria-label={`Delete ${event.title}`}><IconTrash className="size-3.5" /></Button></div></div>)}</div></ScrollArea></CardContent></Card></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit event" : "New event"}</DialogTitle><DialogDescription>{editing ? "Update the event details." : "Add an event to your calendar."}</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="event-title">Title</Label><Input id="event-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What's the occasion?" autoFocus /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="space-y-2"><Label htmlFor="event-date">Date</Label><Input id="event-date" type="date" value={form.event_date} onChange={(event) => setForm({ ...form, event_date: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="event-time">Time <span className="text-muted-foreground">(optional)</span></Label><Input id="event-time" type="time" value={form.event_time} onChange={(event) => setForm({ ...form, event_time: event.target.value })} /></div><div className="space-y-2"><Label>Color</Label><Select value={form.color} onValueChange={(color) => setForm({ ...form, color: color as EventColor })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{COLORS.map((color) => <SelectItem key={color} value={color}><span className="flex items-center gap-2"><span className={cn("size-2.5 rounded-full", DOT[color])} /><span className="capitalize">{color}</span></span></SelectItem>)}</SelectContent></Select></div></div></div><DialogFooter>{editing && <Button variant="destructive" className="mr-auto" onClick={() => { setOpen(false); setPendingDelete(editing); }}><IconTrash className="size-4" /> Delete</Button>}<Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void save()} disabled={saving || !form.title.trim() || !form.event_date}>{editing ? "Save changes" : "Add event"}</Button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(isOpen) => !isOpen && setPendingDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete event?</AlertDialogTitle><AlertDialogDescription>{pendingDelete ? `“${pendingDelete.title}” will be permanently removed from your calendar.` : ""}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { if (pendingDelete) void remove(pendingDelete); }}>Delete event</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
