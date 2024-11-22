const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

// For patients with appointment regarding an archived clinician
export const emailAppointmentDelete = async (appointments) => {
  // For each appointment in appointments, get patientId.email and selectedClinician.firstName selectedClinician.middleName and selectedClinician.lastName.
  // There must be no duplicates of patientId.email
  // Get all emails, remove duplicates
  const uniqueEmails = new Set();

  appointments.forEach((appointment) => {
    uniqueEmails.add(appointment.patientId.email);
  });

  // For each appointment create a payload and call sendEmail
  for (const email of uniqueEmails) {
    const payload = {
      email: email,
      header: "Appointment Changes | TalkTherapy",
      type: "appointment-delete",
      details: [
        appointments[0].selectedClinician.firstName,
        appointments[0].selectedClinician.middleName,
        appointments[0].selectedClinician.lastName,
      ],
    };

    try {
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
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
};
