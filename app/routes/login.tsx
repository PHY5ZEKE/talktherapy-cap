import type { Route } from "./+types/login";
import Login from "modules/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "Login", content: "Welcome to TalkTherapy" },
  ];
}

export default function RootRoute() {
  return <Login />;
}
