import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // landing
  // index("routes/landing.tsx"),

  // public
  layout("components/layouts/PublicLayout.tsx", [
    route("/", "routes/landing.tsx"),
  ]),

  // login and regist
  route("/login", "routes/login.tsx"),
  // route("/register", "routes/register.tsx"),
] satisfies RouteConfig;
