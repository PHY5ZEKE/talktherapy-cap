import type { Route } from "./+types/index";
import AdminDashboard from "modules/admin/";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "Dashboard", content: "Welcome to the Admin Dashboard" },
  ];
}

export default function index() {
  return <AdminDashboard />;
}
