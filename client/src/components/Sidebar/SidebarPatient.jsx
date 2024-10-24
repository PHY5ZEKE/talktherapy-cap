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

import { Link, useNavigate } from "react-router-dom";

import { page } from "../../utils/page-route";

import { useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

export default function Sidebar() {
  const { clearOnLogout } = useContext(AuthContext);
  
  const navigate = useNavigate();

  const handleLogout = () => {
    clearOnLogout();

    // Redirect to the login page
    navigate("/login");
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
        <Link to={page.patient.home} className="text-link">
          <FontAwesomeIcon icon={faHouse} size="xl" />
        </Link>
        <Link to={page.patient.feedback} className="text-link">
          <FontAwesomeIcon icon={faStethoscope} size="xl" />
        </Link>
        <Link to={page.patient.content} className="text-link">
          <FontAwesomeIcon icon={faPhotoFilm} size="xl" />
        </Link>
        <Link to={page.patient.book} className="text-link">
          <FontAwesomeIcon icon={faCalendar} size="xl" />
        </Link>
        <Link to={page.patient.profile} className="text-link">
          <FontAwesomeIcon icon={faGear} size="xl" />
        </Link>
      </div>

      <div className="my-3 text-link" style={{cursor: "pointer"}} onClick={handleLogout}>
        <FontAwesomeIcon icon={faRightFromBracket} size="xl" />
      </div>
    </div>
  );
}
