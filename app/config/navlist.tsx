import {
  DashboardRounded,
  AnalyticsRounded,
  AssignmentRounded,
  PeopleRounded,
  AdminPanelSettingsRounded,
  HealthAndSafetyRounded,
  MovieRounded,
} from "@mui/icons-material";

const navlist = {
  patient: [
    { text: "Home", icon: <DashboardRounded />, route: "/patient" },
    { text: "Feedbacks", icon: <AnalyticsRounded /> },
    { text: "Exercises", icon: <PeopleRounded /> },
    { text: "Appointments", icon: <AssignmentRounded /> },
  ],
  clinician: [
    { text: "Home", icon: <DashboardRounded /> },
    { text: "Feedbacks", icon: <AnalyticsRounded /> },
    { text: "Exercises", icon: <PeopleRounded /> },
    { text: "Appointments", icon: <AssignmentRounded /> },
  ],
  admin: [
    { text: "Home", icon: <DashboardRounded />, route: "/admin" },
    {
      text: "Patients",
      icon: <HealthAndSafetyRounded />,
      route: "/admin/list/patients",
    },
    {
      text: "Clinicians",
      icon: <PeopleRounded />,
      route: "/admin/list/clinicians",
    },
    {
      text: "Exercises",
      icon: <MovieRounded />,
      route: "/admin/list/exercises",
    },
    {
      text: "Appointments",
      icon: <AssignmentRounded />,
      route: "/admin/list/appointments",
    },
  ],
  superadmin: [
    { text: "Home", icon: <DashboardRounded />, route: "/superadmin" },
    {
      text: "Admins",
      icon: <AdminPanelSettingsRounded />,
      route: "/superadmin/list/admins",
    },
    {
      text: "Patients",
      icon: <HealthAndSafetyRounded />,
      route: "/superadmin/list/patients",
    },
    {
      text: "Clinicians",
      icon: <PeopleRounded />,
      route: "/superadmin/list/clinicians",
    },
    {
      text: "Exercises",
      icon: <MovieRounded />,
      route: "/superadmin/list/exercises",
    },
    {
      text: "Audits",
      icon: <AssignmentRounded />,
      route: "/superadmin/list/audits",
    },
  ],
  default: [],
};

export default navlist;
