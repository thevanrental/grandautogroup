import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, Car, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { appointmentSchema, AppointmentFormData } from "@/lib/validations";
import { useListServices, useCreateAppointment, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Generate available time slots (8 AM to 5 PM)
const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  const displayHour = hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute}:00`,
    label: `${displayHour}:${minute} ${ampm}`
  };
});

// Calculate min date (tomorrow)
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const minDateStr = tomorrow.toISOString().split("T")[0];

export default function Home() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  const { data: services, isLoading: servicesLoading } = useListServices();
  const createAppointment = useCreateAppointment();

  const { register, handleSubmit, formState: { errors, isSubmitting }, control, watch } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      vehicleYear: new Date().getFullYear(),
      appointmentDate: minDateStr,
    }
  });

  // Watch service selection to update UI context
  const watchServiceId = watch("serviceId");
  const selectedService = services?.find(s => s.id === Number(watchServiceId));

  const onSubmit = (data: AppointmentFormData) => {
    createAppointment.mutate({ data }, {
      onSuccess: (appointment) => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        setLocation(`/confirmation/${appointment.id}`);
      },
      onError: () => {
        toast({
          title: "Booking Failed",
          description: "There was an error booking your appointment. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative bg-sidebar text-sidebar-foreground pt-24 pb-32 overflow-hidden">
        {/* Abstract background elements instead of generic stock image */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Expert Auto Service. <br/>
              <span className="text-primary">Without the Hassle.</span>
            </h1>
            <p className="text-xl text-sidebar-foreground/80 mb-8 max-w-lg leading-relaxed">
              Book your service online in minutes. Certified technicians, transparent pricing, and a commitment to getting you back on the road safely.
            </p>
            <div className="flex gap-4">
              <a href="#booking-form" className="bg-primary text-primary-foreground px-8 py-4 rounded-md font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg">
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="booking-form" className="flex-1 container mx-auto px-4 py-16 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Column */}
          <div className="lg:col-span-8">
            <Card className="shadow-xl border-0 ring-1 ring-border/50">
              <CardHeader className="bg-muted/30 border-b border-border pb-8">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Schedule Service
                </CardTitle>
                <CardDescription className="text-base">
                  Fill out the form below and we'll have a bay ready for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Service Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">1. Select Service</h3>
                    {servicesLoading ? (
                      <Skeleton className="h-11 w-full" />
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="serviceId">Service Needed</Label>
                        <Select 
                          id="serviceId" 
                          {...register("serviceId")}
                          className={errors.serviceId ? "border-destructive" : ""}
                        >
                          <option value="">-- Choose a service --</option>
                          {services?.map(service => (
                            <option key={service.id} value={service.id}>
                              {service.name} - {formatCurrency(service.price)}
                            </option>
                          ))}
                        </Select>
                        {errors.serviceId && <p className="text-sm text-destructive">{errors.serviceId.message}</p>}
                      </div>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <Car className="w-5 h-5 text-muted-foreground" />
                      2. Vehicle Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleYear">Year</Label>
                        <Input 
                          id="vehicleYear" 
                          type="number" 
                          {...register("vehicleYear")} 
                          className={errors.vehicleYear ? "border-destructive" : ""}
                        />
                        {errors.vehicleYear && <p className="text-sm text-destructive">{errors.vehicleYear.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleMake">Make</Label>
                        <Input 
                          id="vehicleMake" 
                          placeholder="e.g. Toyota" 
                          {...register("vehicleMake")} 
                          className={errors.vehicleMake ? "border-destructive" : ""}
                        />
                        {errors.vehicleMake && <p className="text-sm text-destructive">{errors.vehicleMake.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Model</Label>
                        <Input 
                          id="vehicleModel" 
                          placeholder="e.g. Camry" 
                          {...register("vehicleModel")} 
                          className={errors.vehicleModel ? "border-destructive" : ""}
                        />
                        {errors.vehicleModel && <p className="text-sm text-destructive">{errors.vehicleModel.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      3. Preferred Time
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="appointmentDate">Date</Label>
                        <Input 
                          id="appointmentDate" 
                          type="date" 
                          min={minDateStr}
                          {...register("appointmentDate")} 
                          className={errors.appointmentDate ? "border-destructive" : ""}
                        />
                        {errors.appointmentDate && <p className="text-sm text-destructive">{errors.appointmentDate.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointmentTime">Time</Label>
                        <Select 
                          id="appointmentTime" 
                          {...register("appointmentTime")}
                          className={errors.appointmentTime ? "border-destructive" : ""}
                        >
                          <option value="">-- Select Time --</option>
                          {timeSlots.map(slot => (
                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                          ))}
                        </Select>
                        {errors.appointmentTime && <p className="text-sm text-destructive">{errors.appointmentTime.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <User className="w-5 h-5 text-muted-foreground" />
                      4. Your Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="customerName">Full Name</Label>
                        <Input 
                          id="customerName" 
                          {...register("customerName")} 
                          className={errors.customerName ? "border-destructive" : ""}
                        />
                        {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email Address</Label>
                        <Input 
                          id="customerEmail" 
                          type="email" 
                          {...register("customerEmail")} 
                          className={errors.customerEmail ? "border-destructive" : ""}
                        />
                        {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">Phone Number</Label>
                        <Input 
                          id="customerPhone" 
                          type="tel" 
                          {...register("customerPhone")} 
                          className={errors.customerPhone ? "border-destructive" : ""}
                        />
                        {errors.customerPhone && <p className="text-sm text-destructive">{errors.customerPhone.message}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea 
                          id="notes" 
                          placeholder="Tell us if you're experiencing specific symptoms..."
                          {...register("notes")} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full text-lg h-14"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Confirm Booking"}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      No payment required until service is complete.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Info Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-sidebar text-sidebar-foreground border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Why Choose Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1 bg-primary/20 p-2 rounded-full h-fit text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sidebar-primary">ASE Certified</h4>
                    <p className="text-sm text-sidebar-foreground/70">Our technicians hold the highest industry credentials.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 bg-primary/20 p-2 rounded-full h-fit text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sidebar-primary">24-Month Warranty</h4>
                    <p className="text-sm text-sidebar-foreground/70">Parts and labor backed by our comprehensive guarantee.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 bg-primary/20 p-2 rounded-full h-fit text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sidebar-primary">Transparent Pricing</h4>
                    <p className="text-sm text-sidebar-foreground/70">No hidden fees. You approve every repair before we start.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedService && (
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Selected Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">Service</div>
                    <div className="font-semibold">{selectedService.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">Est. Duration</div>
                    <div className="font-semibold">{selectedService.durationMinutes} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">Starting Price</div>
                    <div className="font-semibold text-xl text-primary">{formatCurrency(selectedService.price)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                    * Final price may vary based on exact vehicle specifications and required parts.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
