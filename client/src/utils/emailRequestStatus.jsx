const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

export const emailRequestStatus = async (email, status, data) => {
  // Add conditional to check status and update email content
  // Check if Accepted, Rejected, Revert, Completed

  let content = "";
  switch (status) {
    case "Accepted":
      content = `Your appointment request has been accepted.
      ========================
      Appointment Details
      ========================
      Patient Name: ${data.patientId.firstName} ${data.patientId.lastName}
      Clinician Name: Dr. ${data.selectedSchedule.clinicianName}
      Date: ${data.selectedSchedule.day} ${data.selectedSchedule.startTime} - ${data.selectedSchedule.endTime}
      `;
      break;
    case "Rejected":
      content = `Your appointment request has been rejected.
      ========================
      Appointment Details
      ========================
      Patient Name: ${data.patientId.firstName} ${data.patientId.lastName}
      Clinician Name: Dr. ${data.selectedSchedule.clinicianName}
      Date: ${data.selectedSchedule.day} ${data.selectedSchedule.startTime} - ${data.selectedSchedule.endTime}`;
      break;
    case "Revert":
      content = `Your appointment request has been reverted back to its original schedule.
      ========================
      Appointment Details
      ========================
      Patient Name: ${data.patientId.firstName} ${data.patientId.lastName}
      Clinician Name: Dr. ${data.selectedSchedule.clinicianName}
      Date: ${data.selectedSchedule.day} ${data.selectedSchedule.startTime} - ${data.selectedSchedule.endTime}
      `;
      break;
    case "Completed":
      content = `Your appointment request has been marked as completed.
      ========================
      Appointment Details
      ========================
      Patient Name: ${data.patientId.firstName} ${data.patientId.lastName}
      Clinician Name: Dr. ${data.selectedSchedule.clinicianName}
      Date: ${data.selectedSchedule.day} ${data.selectedSchedule.startTime} - ${data.selectedSchedule.endTime}
      `;
      break;
    default:
      content = `Your appointment request status has been updated to ${status}.`;
  }

  const payload = {
    email: email,
    header: `Appointment ${status} | TalkTherapy `,
    content: content,
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
