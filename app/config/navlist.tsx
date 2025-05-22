import {
  AnalyticsRounded,
  AssignmentRounded,
  HomeRounded,
  PeopleRounded,
} from "@mui/icons-material";

const navlist = {
  patient: [
    { text: "Home", icon: <HomeRounded /> },
    { text: "Feedbacks", icon: <AnalyticsRounded /> },
    { text: "Exercises", icon: <PeopleRounded /> },
    { text: "Appointments", icon: <AssignmentRounded /> },
  ],
  clinician: [
    { text: "Home", icon: <HomeRounded /> },
    { text: "Feedbacks", icon: <AnalyticsRounded /> },
    { text: "Exercises", icon: <PeopleRounded /> },
    { text: "Appointments", icon: <AssignmentRounded /> },
  ],
  admin: [
    { text: "Home", icon: <HomeRounded /> },
    { text: "Feedbacks", icon: <AnalyticsRounded /> },
    { text: "Exercises", icon: <PeopleRounded /> },
    { text: "Appointments", icon: <AssignmentRounded /> },
  ],
  superadmin: [
    { text: "Home", icon: <HomeRounded />, route: "/superadmin" },
    {
      text: "Admins",
      icon: <AnalyticsRounded />,
      route: "/superadmin/list/admins",
    },
    {
      text: "Patients",
      icon: <AssignmentRounded />,
      route: "/superadmin/list/patients",
    },
    {
      text: "Clinicians",
      icon: <PeopleRounded />,
      route: "/superadmin/list/clinicians",
    },
    {
      text: "Exercises",
      icon: <PeopleRounded />,
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
