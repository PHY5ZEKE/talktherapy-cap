import { useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import { page } from "../../utils/page-route";

export default function ClinicianMenu() {
  const { clearOnLogOut } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    clearOnLogOut();
    navigate("/login");
  };

  return (
    <div className="col d-block d-md-none">
      <div className="d-flex align-items-center justify-content-end h-100">
        <div>
          <div data-bs-toggle="dropdown" aria-expanded="false">
            <FontAwesomeIcon icon={faBars} size="xl" />
          </div>
          <ul className="dropdown-menu">
          <li>
              <Link className="dropdown-item" to={page.clinician.home}>
                Home
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to={page.clinician.content}>
                Exercises
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to={page.clinician.patients}>
                Patients
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to={page.clinician.schedule}>
                Appointments
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to={page.clinician.profile}>
                Profile
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link className="dropdown-item" to="#" onClick={handleLogout}>
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
