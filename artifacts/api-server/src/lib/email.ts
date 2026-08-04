import { Resend } from "resend";

let resend: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resend) {
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface BookingConfirmationData {
  appointmentId: number;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
}

function formatDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string): string {
  // timeStr is HH:MM (24h)
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${ampm}`;
}

export async function sendBookingConfirmation(
  data: BookingConfirmationData
): Promise<void> {
  const client = getResendClient();

  if (!client) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping booking confirmation email for appointment #%d",
      data.appointmentId
    );
    return;
  }

  const formattedDate = formatDate(data.appointmentDate);
  const formattedTime = formatTime(data.appointmentTime);
  const vehicle = `${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                Grand Auto Group
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">
                Booking Confirmation
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;font-size:16px;color:#374151;">
                Hi <strong>${data.customerName}</strong>,
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                Your appointment has been booked. We look forward to seeing you!
              </p>

              <!-- Details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                          <span style="font-size:12px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Appointment ID</span><br/>
                          <span style="font-size:15px;color:#111827;font-weight:600;">#${data.appointmentId}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                          <span style="font-size:12px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Service</span><br/>
                          <span style="font-size:15px;color:#111827;font-weight:600;">${data.serviceName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                          <span style="font-size:12px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Date &amp; Time</span><br/>
                          <span style="font-size:15px;color:#111827;font-weight:600;">${formattedDate} at ${formattedTime}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:12px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Vehicle</span><br/>
                          <span style="font-size:15px;color:#111827;font-weight:600;">${vehicle}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                If you need to reschedule or have any questions, please contact us directly.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; Grand Auto Group. This email was sent because you booked an appointment with us.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const { error } = await client.emails.send({
    from: "Grand Auto Group <onboarding@resend.dev>",
    to: data.customerEmail,
    subject: `Booking Confirmed: ${data.serviceName} on ${formattedDate}`,
    html,
  });

  if (error) {
    console.error("[email] Failed to send booking confirmation:", error);
    // Don't throw — email failure should not roll back the appointment
  } else {
    console.info(
      "[email] Booking confirmation sent to %s for appointment #%d",
      data.customerEmail,
      data.appointmentId
    );
  }
}
