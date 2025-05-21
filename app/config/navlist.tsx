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
    { text: "Home", icon: <HomeRounded /> },
    { text: "Admins", icon: <AnalyticsRounded /> },
    { text: "Clinicians", icon: <PeopleRounded /> },
    { text: "Patients", icon: <AssignmentRounded /> },
    { text: "Exercises", icon: <PeopleRounded /> },
    { text: "Audits", icon: <AssignmentRounded /> },
  ],
  default: [],
};

export default navlist;
