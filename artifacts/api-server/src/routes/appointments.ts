import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, appointmentsTable, servicesTable } from "@workspace/db";
import {
  ListAppointmentsQueryParams,
  CreateAppointmentBody,
  GetAppointmentParams,
  UpdateAppointmentParams,
  UpdateAppointmentBody,
  DeleteAppointmentParams,
} from "@workspace/api-zod";
import { sendBookingConfirmation } from "../lib/email.js";

const router: IRouter = Router();

router.get("/appointments/summary", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      status: appointmentsTable.status,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(appointmentsTable)
    .groupBy(appointmentsTable.status);

  const today = new Date().toISOString().split("T")[0];
  const todayRows = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.appointmentDate, today));

  const counts: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    counts[row.status] = row.count;
    total += row.count;
  }

  res.json({
    total,
    pending: counts["pending"] ?? 0,
    confirmed: counts["confirmed"] ?? 0,
    completed: counts["completed"] ?? 0,
    cancelled: counts["cancelled"] ?? 0,
    todayCount: todayRows[0]?.count ?? 0,
  });
});

router.get("/appointments/today", async (req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const appointments = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.appointmentDate, today))
    .orderBy(appointmentsTable.appointmentTime);
  res.json(appointments);
});

router.get("/appointments", async (req, res): Promise<void> => {
  const parsed = ListAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, date } = parsed.data;
  const conditions = [];
  if (status) conditions.push(eq(appointmentsTable.status, status));
  if (date) conditions.push(eq(appointmentsTable.appointmentDate, date));

  const appointments = await db
    .select()
    .from(appointmentsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(appointmentsTable.appointmentDate, appointmentsTable.appointmentTime);

  res.json(appointments);
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  // Look up service name
  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, data.serviceId));

  if (!service) {
    res.status(400).json({ error: "Service not found" });
    return;
  }

  const [appointment] = await db
    .insert(appointmentsTable)
    .values({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      serviceId: data.serviceId,
      serviceName: service.name,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      notes: data.notes ?? null,
      status: "pending",
    })
    .returning();

  // Send confirmation email (non-blocking — failure does not affect the response)
  sendBookingConfirmation({
    appointmentId: appointment.id,
    customerName: appointment.customerName,
    customerEmail: appointment.customerEmail,
    serviceName: appointment.serviceName,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    vehicleMake: appointment.vehicleMake,
    vehicleModel: appointment.vehicleModel,
    vehicleYear: appointment.vehicleYear,
  }).catch((err) => {
    console.error("[email] Unexpected error sending confirmation:", err);
  });

  res.status(201).json(appointment);
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [appointment] = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id));

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.json(appointment);
});

router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Partial<typeof appointmentsTable.$inferInsert> = {};
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.appointmentDate !== undefined) updates.appointmentDate = parsed.data.appointmentDate;
  if (parsed.data.appointmentTime !== undefined) updates.appointmentTime = parsed.data.appointmentTime;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

  const [appointment] = await db
    .update(appointmentsTable)
    .set(updates)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.json(appointment);
});

router.delete("/appointments/:id", async (req, res): Promise<void> => {
  const params = DeleteAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
