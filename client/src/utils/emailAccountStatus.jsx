const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

export const emailAccountStatus = async (email, status) => {
  const payload = {
    email: email,
    header: "Account Status Update | TalkTherapy",
    content: `Your account status has been ${
      status.active ? "deactivated" : "activated"
    }.`,
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
