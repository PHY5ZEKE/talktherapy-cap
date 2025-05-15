import type { Route } from "./+types";
import AdminForm from "modules/signup/admin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TalkTherapy" },
    { name: "Admin Signup", content: "Welcome to Admin Signup" },
  ];
}

export default function AdminSignup() {
  return <AdminForm />;
}
