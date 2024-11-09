const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

export const emailRequestAccess = async (clinicianData, patientData, reason, accessToken) => {
  const response = await fetch(`${appURL}/${route.system.getEmailAdmins}`);
  const data = await response.json();
  console.log("Response data:", data);

  const admins = data.admins
  const activeAdmins = admins.filter(admin => admin.active === true);

  const emails = activeAdmins.map(admin => admin.email);

  console.log(emails)

  const payload = {
    email: emails,
    header: 'Clinician Request Access | TalkTherapy',
    content: `${clinicianData.firstName} ${clinicianData.middleName} ${clinicianData.lastName} is requesting for record access for the follow patient:
    
    =====================
    PATIENT DETAILS
    =====================
    ${patientData.firstName} ${patientData.middleName} ${patientData.lastName}

    With the reason of: ${reason}
    `,
  };

  console.log(payload)

  const sendEmail = await fetch(`${appURL}/${route.system.email}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
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
