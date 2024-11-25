import { useEffect } from "react";
// UI Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faStethoscope,
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
    if (path === page.patient.exercise) {
      return location.pathname.startsWith("/content/exercises");
    }
    return location.pathname === path;
  };

  return (
    <div className="d-none d-md-flex flex-column gap-3 text-center h-100 bg-white p-3">
      <div className="my-3 ">
        <Link to={page.patient.home} className="text-link">
          <p className="mb-0 fw-bold d-block ">TALK</p>
          <p className="my-0 fw-bold d-block">THERAPY</p>
        </Link>
      </div>

      <div className="d-flex flex-column gap-5 mb-auto text-link">
      <Link to={page.patient.home} className={`text-link ${isActive(page.patient.home) ? 'active' : ''}`}>
          <div className="h-tooltip">
            <FontAwesomeIcon icon={faHouse} size="xl" />
            <span className="tooltip tooltip-right px-3">Home</span>
          </div>
        </Link>
        <Link to={page.patient.feedback} className={`text-link ${isActive(page.patient.feedback) ? 'active' : ''}`}>
          <div className="h-tooltip">
            <FontAwesomeIcon icon={faStethoscope} size="xl" />
            <span className="tooltip tooltip-right px-3">Feedbacks</span>
          </div>
        </Link>
        <Link to={page.patient.content} className={`text-link ${isActive(page.patient.content) || isActive(page.patient.exercise) ? 'active' : ''}`}>
          <div className="h-tooltip">
            <FontAwesomeIcon icon={faPhotoFilm} size="xl" />
            <span className="tooltip tooltip-right px-3">Exercises</span>
          </div>
        </Link>
        <Link to={page.patient.book} className={`text-link ${isActive(page.patient.book) ? 'active' : ''}`}>
          <div className="h-tooltip">
            <FontAwesomeIcon icon={faCalendar} size="xl" />
            <span className="tooltip tooltip-right px-3">Appointments</span>
          </div>
        </Link>
        <Link to={page.patient.profile} className={`text-link ${isActive(page.patient.profile) ? 'active' : ''}`}>
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
