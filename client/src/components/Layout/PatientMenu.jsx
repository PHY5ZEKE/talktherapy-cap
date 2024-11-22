import { useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";

export default function PatientMenu() {
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
              <Link className="dropdown-item" to="/patient">
                Home
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/patient/feedback">
                Feedbacks
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/patient/content">
                Exercises
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/patient/book">
                Appointments
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/patient/profile">
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
