// UI Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faPhotoFilm,
  faCalendar,
  faGear,
  faRightFromBracket,
  faUsers
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

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-none d-md-flex flex-column gap-3 text-center h-100 bg-white p-3">
      <div className="my-3 ">
        <Link to={page.admin.home} className="text-link">
          <p className="mb-0 fw-bold d-block ">TALK</p>
          <p className="my-0 fw-bold d-block">THERAPY</p>
        </Link>
      </div>

      <div className="d-flex flex-column gap-5 mb-auto text-link">
        <Link to={page.admin.home} className={`text-link ${isActive(page.admin.home) ? 'active' : ''}`}>
          <FontAwesomeIcon icon={faHouse} size="xl" />
        </Link>
        <Link to={page.admin.content} className={`text-link ${isActive(page.admin.content) ? 'active' : ''}`}>
          <FontAwesomeIcon icon={faPhotoFilm} size="xl" />
        </Link>
        <Link to={page.admin.schedule} className={`text-link ${isActive(page.admin.schedule) ? 'active' : ''}`}>
          <FontAwesomeIcon icon={faCalendar} size="xl" />
        </Link>
        <Link to={page.admin.patients} className={`text-link ${isActive(page.admin.patients) ? 'active' : ''}`}>
          <FontAwesomeIcon icon={faUsers} size="xl" />
        </Link>
        <Link to={page.admin.profile} className={`text-link ${isActive(page.admin.profile) ? 'active' : ''}`}>
          <FontAwesomeIcon icon={faGear} size="xl" />
        </Link>
      </div>

      <div className="my-3 text-link" style={{cursor: "pointer"}} onClick={handleLogout}>
        <FontAwesomeIcon icon={faRightFromBracket} size="xl" />
      </div>
    </div>
  );
}
