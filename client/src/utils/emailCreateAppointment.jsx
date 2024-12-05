const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

export const emailCreateAppointment = async (
  clinicianEmail,
  patientEmail,
  status,
  data
) => {
  console.log(data);
  const content = `A new appointment request has been booked with status of ${status}`;

  const payload = {
    email: [clinicianEmail, patientEmail],
    header: `Appointment ${status} | TalkTherapy `,
    type: "appointment-book",
    details: [
      data.clinicianName,
      data.day,
      data.startTime,
      data.endTime,
      content,
    ],
  };

  const sendEmail = await fetch(`${appURL}/${route.system.email}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const emailData = await sendEmail.json();

  if (sendEmail.ok) {
    console.log("Notification sent successfully:", emailData.message);
  } else {
    console.error("Error sending notification:", emailData.message);
  }
};
