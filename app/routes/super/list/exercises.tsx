import type { Route } from "./+types/exercises";
import ExerciseList from "modules/super/list/exercises";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Exercises" },
    { name: "Exercises", content: "View all exercises" },
  ];
}

export default function exercises() {
  return <ExerciseList />;
}
