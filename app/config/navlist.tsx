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
  "super-admin": [
    { text: "Home", icon: <HomeRounded /> },
    { text: "Feedbacks", icon: <AnalyticsRounded /> },
    { text: "Exercises", icon: <PeopleRounded /> },
    { text: "Appointments", icon: <AssignmentRounded /> },
  ],
  default: [],
};

export default navlist;
