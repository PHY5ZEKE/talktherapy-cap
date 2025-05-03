const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

export const emailRequestAccess = async (clinicianData, patientData, reason, accessToken) => {
  const response = await fetch(`${appURL}/${route.system.getEmailAdmins}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();

  const admins = data.admins
  const activeAdmins = admins.filter(admin => admin.active === true);

  const emails = activeAdmins.map(admin => admin.email);

  const payload = {
    email: emails,
    header: 'Clinician Request Access | TalkTherapy',
    type: "request-records-access",
    details: [
      clinicianData.firstName,
      clinicianData.lastName,
      patientData.firstName,
      patientData.lastName,
      reason
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
