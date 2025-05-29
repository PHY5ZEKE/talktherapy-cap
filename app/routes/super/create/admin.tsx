import type { Route } from "./+types/admin";
import CreateAdmin from "modules/super/create/CreateAdmin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Admin" },
    { name: "Create Admin", content: "Create a new admin account" },
  ];
}

export default function index() {
  return <CreateAdmin />;
}
