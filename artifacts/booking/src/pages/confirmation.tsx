import { useLocation, useParams } from "wouter";
import { useGetAppointment } from "@workspace/api-client-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Calendar, Clock, Car, MapPin, ArrowLeft } from "lucide-react";
import { formatDate, formatTime } from "@/lib/formatters";

export default function Confirmation() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const appointmentId = Number(id);

  const { data: appointment, isLoading, isError } = useGetAppointment(appointmentId, {
    query: {
      enabled: !isNaN(appointmentId),
    }
  });

  if (isError || (!isLoading && !appointment)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">Appointment Not Found</h1>
            <p className="text-muted-foreground mb-6">We couldn't locate the appointment details.</p>
            <Button onClick={() => setLocation("/")}>Return Home</Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you, {appointment?.customerName.split(' ')[0] || 'Customer'}. Your appointment is set.
            </p>
          </div>

          <Card className="shadow-lg border-0 ring-1 ring-border">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex justify-between items-center text-xl">
                <span>Appointment Details</span>
                {isLoading ? (
                  <Skeleton className="w-24 h-6" />
                ) : (
                  <span className="font-mono text-sm font-normal bg-muted px-3 py-1 rounded-md text-muted-foreground">
                    #{appointment.id.toString().padStart(5, '0')}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-6">
                  <Skeleton className="w-full h-12" />
                  <Skeleton className="w-full h-12" />
                  <Skeleton className="w-full h-12" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* When & Where */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                      <div className="mt-1 p-2 bg-primary/10 text-primary rounded-md h-fit">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Date & Time</div>
                        <div className="font-semibold text-lg">{formatDate(appointment.appointmentDate)}</div>
                        <div className="text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(appointment.appointmentTime)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="mt-1 p-2 bg-primary/10 text-primary rounded-md h-fit">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Location</div>
                        <div className="font-semibold">Grand Auto Service Center</div>
                        <div className="text-muted-foreground mt-1">
                          123 Mechanic Ave.<br />Detroit, MI 48201
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & Service */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/10">
                    <div className="flex gap-4">
                      <div className="mt-1 p-2 bg-primary/10 text-primary rounded-md h-fit">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Vehicle Details</div>
                        <div className="font-semibold">
                          {appointment.vehicleYear} {appointment.vehicleMake} {appointment.vehicleModel}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Service Requested</div>
                      <div className="font-semibold">{appointment.serviceName}</div>
                      {appointment.notes && (
                        <div className="mt-3 text-sm bg-background border p-3 rounded-md italic">
                          "{appointment.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-card border-t border-border p-6 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                A confirmation email has been sent to {appointment?.customerEmail}
              </div>
              <Button variant="outline" onClick={() => setLocation("/")} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Return to Site
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
