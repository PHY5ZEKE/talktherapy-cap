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

  layout("components/layouts/PrivateLayout.tsx", [
    // SUPER ADMIN ROUTES
    ...prefix("superadmin", [
      route("/", "routes/super/index.tsx"),
      // list routes
      ...prefix("list", [
        route("admins", "routes/super/list/admins.tsx"),
        route("patients", "routes/super/list/patients.tsx"),
        // route("clinicians", "routes/super/list/clinicians.tsx"),
      ]),
      // create routes
      ...prefix("create", [route("/admin", "routes/super/create/admin.tsx")]),
    ]),

    // ADMIN ROUTES
    ...prefix("admin", [
      route("/", "routes/admin/index.tsx"),
      // list routes
      ...prefix("list", [
        route("clinicians", "routes/admin/list/clinicians.tsx"),
        route("patients", "routes/admin/list/patients.tsx"),
      ]),

      // create routes
      ...prefix("create", [
        route("/clinician", "routes/admin/create/clinician.tsx"),
      ]),
    ]),

    // PATIENT ROUTES
    ...prefix("patient", [route("/", "routes/patient/index.tsx")]),
  ]),
] satisfies RouteConfig;
