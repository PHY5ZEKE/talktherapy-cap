import type { Route } from "./+types";
import SuperDashboard from "modules/super";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "Dashboard", content: "Welcome to the Super Admin Dashboard" },
  ];
}

export default function index() {
  return <SuperDashboard />;
}
