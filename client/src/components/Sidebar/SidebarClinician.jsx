// UI Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUsers,
  faPhotoFilm,
  faCalendar,
  faGear,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import { Link, useNavigate, useLocation } from "react-router-dom";

import { page } from "../../utils/page-route";

import { useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

export default function Sidebar() {
  const { clearOnLogOut } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearOnLogOut();
    // Redirect to the login page
    navigate("/login");
  };

  const isActive = (path) => {
    // Check if the current pathname matches the base of the route
    if (path === page.clinician.exercise) {
      return location.pathname.startsWith("/content/exercises");
    }
    return location.pathname === path;
  };

  return (
    <div className="d-none d-md-flex flex-column gap-3 text-center h-100 bg-white p-3">
      <div className="my-3 ">
        <Link to={page.clinician.home} className="text-link">
          <p className="mb-0 fw-bold d-block ">TALK</p>
          <p className="my-0 fw-bold d-block">THERAPY</p>
        </Link>
      </div>

      <div className="d-flex flex-column gap-5 mb-auto text-link">
        <Link
          to={page.clinician.home}
          className={`text-link ${
            isActive(page.clinician.home) ? "active" : ""
          }`}
        >
          <div className="h-tooltip">
            <FontAwesomeIcon icon={faHouse} size="xl" />
            <span className="tooltip tooltip-right px-3">Home</span>
          </div>
        </Link>
        <Link
          to={page.clinician.content}
          className={`text-link ${
            isActive(page.clinician.content) ||
            isActive(page.clinician.exercise)
              ? "active"
              : ""
          }`}
        >
          <div className="h-tooltip">
            <FontAwesomeIcon icon={faPhotoFilm} size="xl" />
            <span className="tooltip tooltip-right px-3">Exercises</span>
          </div>
        </Link>
        <Link
          to={page.clinician.patients}
          className={`text-link ${
            isActive(page.clinician.patients) ? "active" : ""
          }`}
        >
          <div className="h-tooltip">
            <FontAwesomeIcon icon={faUsers} size="xl" />
            <span className="tooltip tooltip-right px-3">Patients</span>
          </div>
        </Link>
        <Link
          to={page.clinician.schedule}
          className={`text-link ${
            isActive(page.clinician.schedule) ? "active" : ""
          }`}
        >
          <div className="h-tooltip">
            <FontAwesomeIcon icon={faCalendar} size="xl" />
            <span className="tooltip tooltip-right px-3">Schedule</span>
          </div>
        </Link>
        <Link
          to={page.clinician.profile}
          className={`text-link ${
            isActive(page.clinician.profile) ? "active" : ""
          }`}
        >
          <div className="h-tooltip">
            <FontAwesomeIcon icon={faGear} size="xl" />
            <span className="tooltip tooltip-right px-3">Profile</span>
          </div>
        </Link>
      </div>

      <div
        className="my-3 text-link"
        style={{ cursor: "pointer" }}
        onClick={handleLogout}
      >
        <div className="h-tooltip">
          <FontAwesomeIcon icon={faRightFromBracket} size="xl" />
          <span className="tooltip tooltip-right px-3">Logout</span>
        </div>
      </div>
    </div>
  );
}
