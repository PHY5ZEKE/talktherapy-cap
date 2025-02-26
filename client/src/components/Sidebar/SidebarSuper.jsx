// UI Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCalendar,
  faGear,
  faRightFromBracket,
  faBoxArchive,
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
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="d-none d-md-flex flex-column gap-3 text-center h-100 bg-white p-3">
        <div className="my-3 ">
          <Link to={page.sudo.home} className="text-link">
            <p className="mb-0 fw-bold d-block ">TALK</p>
            <p className="my-0 fw-bold d-block">THERAPY</p>
          </Link>
        </div>

        <div className="d-flex flex-column gap-5 mb-auto text-link">
          <Link
            to={page.sudo.home}
            className={`text-link ${isActive(page.sudo.home) ? "active" : ""}`}
          >
            <div className="h-tooltip">
              <FontAwesomeIcon icon={faHouse} size="xl" />
              <span className="tooltip tooltip-right px-3">Home</span>
            </div>
          </Link>
          <Link
            to={page.sudo.archival}
            className={`text-link ${isActive(page.sudo.archival) ? "active" : ""}`}
          >
            <div className="h-tooltip">
              <FontAwesomeIcon icon={faBoxArchive} size="xl" />
              <span className="tooltip tooltip-right px-3">Archival</span>
            </div>
          </Link>
          <Link
            to={page.sudo.audit}
            className={`text-link ${isActive(page.sudo.audit) ? "active" : ""}`}
          >
            <div className="h-tooltip">
              <FontAwesomeIcon icon={faCalendar} size="xl" />
              <span className="tooltip tooltip-right px-3">Audit Logs</span>
            </div>
          </Link>
          <Link
            to={page.sudo.profile}
            className={`text-link ${
              isActive(page.sudo.profile) ? "active" : ""
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
          </div>{" "}
        </div>
      </div>
    </>
  );
}
