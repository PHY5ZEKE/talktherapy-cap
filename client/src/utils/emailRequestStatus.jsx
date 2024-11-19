const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

export const emailRequestStatus = async (clinicianEmail, patientEmail, status, data) => {
  // Add conditional to check status and update email content
  // Check if Accepted, Rejected, Revert, Completed
  let content = "";
  switch (status) {
    case "Accepted":
      content = `Your appointment request has been accepted.`;
      break;
    case "Rejected":
      content = `Your appointment request has been rejected.`;
      break;
    case "Revert":
      content = `Your appointment request has been reverted back to its original schedule.`;
      break;
    case "Completed":
      content = `Your appointment request has been marked as completed.`;
      break;
    default:
      content = `Your appointment request status has been updated to ${status}.`;
  }

  const payload = {
    email: [clinicianEmail, patientEmail],
    header: `Appointment ${status} | TalkTherapy `,
    type: "appointment-status",
    details: [
      data.patientId.firstName,
      data.patientId.lastName,
      data.selectedSchedule.clinicianName,
      data.selectedSchedule.day,
      data.selectedSchedule.startTime,
      data.selectedSchedule.endTime,
      content,
    ]
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
