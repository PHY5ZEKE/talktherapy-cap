const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";
import { emailAppointmentDelete } from "./emailAppointmentDelete";


export const emailAccountArchive = async (email, role, accessToken, id) => {
  let appointments = [];

  // If clinician, get appointment details to get patient ID
  // Get patient email and add to email
  if (role === "clinician") {
    try {
      const response = await fetch(
        `${appURL}/${route.appointment.affectedAppointment}/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
          }
        }
      );

      if (!response.ok) {
        console.error("error");
      }

      const data = await response.json();
      appointments = data;
      
      // Get emails, remove duplicates and then send
      emailAppointmentDelete(appointments)
    } catch (error) {
      console.error(error);
    }
  }

  const payload = {
    email: email,
    header: "Account Archived | TalkTherapy",
    type: "account-archive",
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
