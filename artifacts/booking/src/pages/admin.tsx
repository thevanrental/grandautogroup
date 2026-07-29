import React, { useState } from "react";
import { 
  useGetAppointmentSummary, 
  useListAppointments, 
  useGetTodayAppointments,
  useUpdateAppointment,
  useDeleteAppointment,
  getListAppointmentsQueryKey,
  getGetAppointmentSummaryQueryKey,
  getGetTodayAppointmentsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime, getStatusColor } from "@/lib/formatters";
import { Clock, CalendarCheck, CheckCircle2, XCircle, Search, Filter, MoreVertical, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Queries
  const { data: summary, isLoading: summaryLoading } = useGetAppointmentSummary();
  const { data: todayAppointments, isLoading: todayLoading } = useGetTodayAppointments();
  
  const { data: appointments, isLoading: appointmentsLoading } = useListAppointments(
    { status: statusFilter || undefined },
    { query: { queryKey: getListAppointmentsQueryKey({ status: statusFilter || undefined }) } }
  );

  // Mutations
  const updateStatus = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          // Optimistic local update would be better, but invalidation is safer for now
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAppointmentSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTodayAppointmentsQueryKey() });
          toast({ title: "Status Updated", description: `Appointment #${id} marked as ${newStatus}.` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Today's Bookings" 
          value={summary?.todayCount ?? 0} 
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          loading={summaryLoading}
        />
        <StatCard 
          title="Pending Action" 
          value={summary?.pending ?? 0} 
          icon={<CalendarCheck className="w-5 h-5 text-amber-500" />}
          loading={summaryLoading}
        />
        <StatCard 
          title="Confirmed" 
          value={summary?.confirmed ?? 0} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          loading={summaryLoading}
        />
        <StatCard 
          title="Total Serviced" 
          value={summary?.completed ?? 0} 
          icon={<CheckCircle2 className="w-5 h-5 text-muted-foreground" />}
          loading={summaryLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Appointments Table */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <CardTitle className="text-lg">All Appointments</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Select 
                    className="pl-9 w-40 h-9 text-sm" 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle & Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointmentsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : appointments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No appointments found matching current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments?.map((apt) => (
                      <TableRow key={apt.id} className="group">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{apt.id.toString().padStart(4, '0')}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{apt.customerName}</div>
                          <div className="text-xs text-muted-foreground">{apt.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}</div>
                          <div className="text-xs text-muted-foreground">{apt.serviceName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm whitespace-nowrap">{formatDate(apt.appointmentDate)}</div>
                          <div className="text-xs text-muted-foreground">{formatTime(apt.appointmentTime)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(apt.status) as any} className="capitalize">
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {apt.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                disabled={updateStatus.isPending}
                              >
                                <Check className="w-4 h-4 mr-1" /> Confirm
                              </Button>
                            )}
                            {apt.status === 'confirmed' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handleStatusChange(apt.id, 'completed')}
                                disabled={updateStatus.isPending}
                              >
                                Complete
                              </Button>
                            )}
                            {(apt.status === 'pending' || apt.status === 'confirmed') && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                disabled={updateStatus.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-border bg-sidebar/5">
            <CardHeader className="border-b bg-background/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {todayLoading ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Loading schedule...</div>
                ) : todayAppointments?.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center">
                    <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">No appointments scheduled for today.</p>
                  </div>
                ) : (
                  todayAppointments?.map((apt) => (
                    <div key={apt.id} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                      <div className="text-right shrink-0 min-w-[70px]">
                        <div className="font-bold text-lg">{formatTime(apt.appointmentTime).split(' ')[0]}</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                          {formatTime(apt.appointmentTime).split(' ')[1]}
                        </div>
                      </div>
                      <div className="w-px bg-border my-1" />
                      <div>
                        <div className="font-semibold text-sm">{apt.customerName}</div>
                        <div className="text-xs text-muted-foreground mb-2">{apt.serviceName}</div>
                        <Badge variant={getStatusColor(apt.status) as any} className="text-[10px] h-5 px-1.5 py-0">
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, loading }: { title: string, value: number, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-border">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-muted rounded-xl">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-3xl font-bold tracking-tight">{value}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
