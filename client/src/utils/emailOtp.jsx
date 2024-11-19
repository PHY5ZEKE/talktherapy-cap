const appURL = import.meta.env.VITE_APP_URL;

import { route } from "./route";

export default function emailOtp(email) {
  const payload = {
    email: email,
    header: "OTP | TalkTherapy",
  };

  return (
    <div>s</div>
  );
}
