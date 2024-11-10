const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

export const emailAccountArchive = async (email) => {
  const payload = {
    email: email,
    header: "Account Archived | TalkTherapy",
    content:
    `Your account ${email} has been automatically archived by the system. This is due to inactivity for a period of time.
    \nIf you wish to reactivate your account, please contact us at talktherapycapstone@gmail.com.`,
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
