const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

export const emailSoap = async (email, soapData, clinicianData) => {
  const payload = {
    email: email,
    header: 'New Diagnosis Added | TalkTherapy',
    content: `
    =====================
    DIAGNOSIS DETAILS
    =====================
    Clinician: ${clinicianData.firstName} ${clinicianData.middleName} ${clinicianData.lastName}
    Diagnosis: ${soapData}
    `,
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
