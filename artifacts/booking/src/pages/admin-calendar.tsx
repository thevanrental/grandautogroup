import React, { useState, useMemo, useRef } from "react";
import { useListAppointments, getListAppointmentsQueryKey, useUpdateAppointment, getGetAppointmentSummaryQueryKey, getGetTodayAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime, getStatusColor } from "@/lib/formatters";
import { ChevronLeft, ChevronRight, Check, X, CalendarDays, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@workspace/api-client-react";

// Hours displayed on the calendar (8 AM – 6 PM)
const START_HOUR = 8;
const END_HOUR = 18;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  // Start week on Monday
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toYMD(date: Date): string {
  return date.toISOString().split("T")[0];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatHour(h: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12} ${ampm}`;
}

// Map appointment time string to fractional hour (e.g. "09:30" → 9.5)
function timeToHour(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

function hourToTime(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  pending:   { bg: "bg-amber-50",   border: "border-amber-300",  text: "text-amber-900",   dot: "bg-amber-400" },
  confirmed: { bg: "bg-emerald-50", border: "border-emerald-300",text: "text-emerald-900",  dot: "bg-emerald-500" },
  completed: { bg: "bg-blue-50",    border: "border-blue-300",   text: "text-blue-900",    dot: "bg-blue-400" },
  cancelled: { bg: "bg-gray-100",   border: "border-gray-300",   text: "text-gray-500",    dot: "bg-gray-400" },
};

function getStyle(status: string) {
  return STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.cancelled;
}

interface PendingReschedule {
  apt: Appointment;
  newDate: string;
  newHour: number;
}

export default function AdminCalendar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [selected, setSelected] = useState<Appointment | null>(null);

  // Drag state
  const draggedAptRef = useRef<Appointment | null>(null);
  const [dropHighlight, setDropHighlight] = useState<{ ymd: string; hour: number } | null>(null);
  const [pendingReschedule, setPendingReschedule] = useState<PendingReschedule | null>(null);
  const isDraggingRef = useRef(false);

  const weekEnd = addDays(weekStart, 6);

  // Fetch all appointments (no server-side date filter; filter client-side for the week)
  const { data: appointments, isLoading } = useListAppointments(
    {},
    { query: { queryKey: getListAppointmentsQueryKey({}) } }
  );

  const updateMutation = useUpdateAppointment();

  // Group appointments by date string for the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      const ymd = toYMD(day);
      const aptsOnDay = (appointments ?? []).filter(a => a.appointmentDate === ymd);
      return { date: day, ymd, apts: aptsOnDay };
    });
  }, [weekStart, appointments]);

  const goBack = () => setWeekStart(d => addDays(d, -7));
  const goForward = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  const todayYMD = toYMD(new Date());

  const handleStatusChange = (id: number, newStatus: string) => {
    updateMutation.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAppointmentSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTodayAppointmentsQueryKey() });
          setSelected(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
          toast({ title: "Status Updated", description: `Appointment #${id} marked as ${newStatus}.` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        },
      }
    );
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, apt: Appointment) => {
    draggedAptRef.current = apt;
    isDraggingRef.current = true;
    e.dataTransfer.effectAllowed = "move";
    // ghost image opacity via CSS handled below
    e.dataTransfer.setData("text/plain", String(apt.id));
  };

  const handleDragEnd = () => {
    draggedAptRef.current = null;
    isDraggingRef.current = false;
    setDropHighlight(null);
  };

  const handleDragOver = (e: React.DragEvent, ymd: string, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropHighlight({ ymd, hour });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the cell entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropHighlight(null);
    }
  };

  const handleDrop = (e: React.DragEvent, ymd: string, hour: number) => {
    e.preventDefault();
    setDropHighlight(null);
    const apt = draggedAptRef.current;
    if (!apt) return;

    // No-op if dropped on same slot
    if (apt.appointmentDate === ymd && timeToHour(apt.appointmentTime) >= hour && timeToHour(apt.appointmentTime) < hour + 1) {
      return;
    }

    setPendingReschedule({ apt, newDate: ymd, newHour: hour });
  };

  const confirmReschedule = () => {
    if (!pendingReschedule) return;
    const { apt, newDate, newHour } = pendingReschedule;
    const newTime = hourToTime(newHour);

    updateMutation.mutate(
      { id: apt.id, data: { appointmentDate: newDate, appointmentTime: newTime } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAppointmentSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTodayAppointmentsQueryKey() });
          toast({
            title: "Appointment Rescheduled",
            description: `#${apt.id.toString().padStart(4, "0")} moved to ${formatDate(newDate)} at ${formatTime(newTime)}.`,
          });
          setPendingReschedule(null);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to reschedule appointment.", variant: "destructive" });
          setPendingReschedule(null);
        },
      }
    );
  };

  const monthLabel = weekStart.toLocaleString("en-US", { month: "long", year: "numeric" });

  // Legend
  const legendItems = [
    { label: "Pending",   style: STATUS_STYLES.pending },
    { label: "Confirmed", style: STATUS_STYLES.confirmed },
    { label: "Completed", style: STATUS_STYLES.completed },
    { label: "Cancelled", style: STATUS_STYLES.cancelled },
  ];

  return (
    <AdminLayout title="Calendar">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday} className="text-xs uppercase tracking-widest font-semibold">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goForward}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-base font-bold uppercase tracking-widest ml-2">{monthLabel}</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          {legendItems.map(({ label, style }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
        {/* Day headers */}
        <div className="grid border-b border-border" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div className="border-r border-border bg-muted/50" />
          {weekDays.map(({ date, ymd }, i) => {
            const isToday = ymd === todayYMD;
            return (
              <div
                key={i}
                className={`py-3 text-center border-r border-border last:border-r-0 ${isToday ? "bg-primary/5" : "bg-muted/50"}`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {DAY_LABELS[i]}
                </div>
                <div className={`text-xl font-bold mt-0.5 w-9 h-9 flex items-center justify-center mx-auto rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time rows */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {isLoading ? (
            <div className="p-12 flex flex-col items-center gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b border-border last:border-b-0"
                  style={{ gridTemplateColumns: "56px repeat(7, 1fr)", minHeight: "72px" }}
                >
                  {/* Hour label */}
                  <div className="border-r border-border bg-muted/20 flex items-start justify-end pr-2 pt-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                      {formatHour(hour)}
                    </span>
                  </div>

                  {/* Day cells */}
                  {weekDays.map(({ ymd, apts }, dayIdx) => {
                    const isToday = ymd === todayYMD;
                    const hourApts = apts.filter(a => {
                      const h = timeToHour(a.appointmentTime);
                      return h >= hour && h < hour + 1;
                    });
                    const isHighlighted =
                      dropHighlight?.ymd === ymd && dropHighlight?.hour === hour;

                    return (
                      <div
                        key={dayIdx}
                        className={`border-r border-border last:border-r-0 p-1 flex flex-col gap-1 transition-colors
                          ${isToday ? "bg-primary/[0.02]" : ""}
                          ${isHighlighted ? "bg-primary/10 ring-1 ring-inset ring-primary/30" : ""}
                        `}
                        onDragOver={(e) => handleDragOver(e, ymd, hour)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, ymd, hour)}
                      >
                        {hourApts.map(apt => {
                          const s = getStyle(apt.status);
                          return (
                            <div
                              key={apt.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, apt)}
                              onDragEnd={handleDragEnd}
                              onClick={() => !isDraggingRef.current && setSelected(apt)}
                              className={`group w-full text-left rounded px-1.5 py-1 border text-[11px] font-medium leading-tight
                                transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing active:opacity-50
                                select-none ${s.bg} ${s.border} ${s.text}`}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <GripVertical className="w-2.5 h-2.5 shrink-0 opacity-30 group-hover:opacity-60" />
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                                <span className="font-semibold truncate">{formatTime(apt.appointmentTime)}</span>
                              </div>
                              <div className="truncate">{apt.customerName}</div>
                              <div className="truncate opacity-70">{apt.serviceName}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Confirmation Dialog */}
      <Dialog open={!!pendingReschedule} onOpenChange={open => !open && setPendingReschedule(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment?</DialogTitle>
            <DialogDescription>
              {pendingReschedule && (
                <>
                  Move{" "}
                  <span className="font-semibold text-foreground">
                    #{pendingReschedule.apt.id.toString().padStart(4, "0")} — {pendingReschedule.apt.customerName}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-foreground">
                    {formatDate(pendingReschedule.newDate)} at {formatTime(hourToTime(pendingReschedule.newHour))}
                  </span>
                  ?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPendingReschedule(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReschedule}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-sm">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  Appointment #{selected.id.toString().padStart(4, "0")}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={getStatusColor(selected.status) as any} className="capitalize">
                    {selected.status}
                  </Badge>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium">{selected.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{selected.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(selected.appointmentDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{formatTime(selected.appointmentTime)}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vehicle</span>
                    <span className="font-medium">{selected.vehicleYear} {selected.vehicleMake} {selected.vehicleModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{selected.serviceName}</span>
                  </div>
                </div>

                {selected.notes && (
                  <div className="rounded-lg border border-border p-3 text-sm">
                    <div className="text-muted-foreground mb-1">Notes</div>
                    <div>{selected.notes}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {selected.status === "pending" && (
                    <Button
                      size="sm"
                      className="flex-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      variant="outline"
                      onClick={() => handleStatusChange(selected.id, "confirmed")}
                      disabled={updateMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-1" /> Confirm
                    </Button>
                  )}
                  {selected.status === "confirmed" && (
                    <Button
                      size="sm"
                      className="flex-1"
                      variant="outline"
                      onClick={() => handleStatusChange(selected.id, "completed")}
                      disabled={updateMutation.isPending}
                    >
                      Mark Complete
                    </Button>
                  )}
                  {(selected.status === "pending" || selected.status === "confirmed") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleStatusChange(selected.id, "cancelled")}
                      disabled={updateMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
