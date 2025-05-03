import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    // landing
    // index("routes/landing.tsx"),

    // public
    layout("components/layouts/PublicLayout.tsx", [
        route("/", "routes/landing.tsx")
    ]
    ),


] satisfies RouteConfig;
