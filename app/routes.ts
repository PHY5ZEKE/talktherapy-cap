import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  // landing
  // index("routes/landing.tsx"),

  // public
  layout("components/layouts/PublicLayout.tsx", [
    route("/", "routes/landing.tsx"),
  ]),

  ...prefix("signup", [
    index("routes/signup/index.tsx"),
    layout("components/layouts/SignupLayout.tsx", [
      route("/patient", "routes/signup/patient.tsx"),
      route("/admin", "routes/signup/admin.tsx"),
      route("/clinician", "routes/signup/clinician.tsx"),
    ]),
  ]),

  route("/login", "routes/login.tsx"),

  // patient
  ...prefix("patient", [
    layout("components/layouts/PrivateLayout.tsx", [
      route("/", "routes/patient/index.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
