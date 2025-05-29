import type { Route } from "./+types/admins";
import AdminList from "modules/super/list/admins";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admins" },
    { name: "Admins", content: "List of all admins" },
  ];
}

export default function admins() {
  return <AdminList />;
}
