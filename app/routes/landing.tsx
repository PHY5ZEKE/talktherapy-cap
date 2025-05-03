import type { Route } from "./+types/landing";
import Landing from "pages/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TalkTherapy" },
    { name: "TalkTherapy Landing", content: "Welcome to TalkTherapy" },
  ];
}

export default function RootRoute() {
  return <Landing />;
}
