import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function MenuDropdown() {

    const navigate = useNavigate();

    const handleLogout = () => {
      // Clear the authentication token and user information from local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
  
      // Redirect to the login page
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
            <a className="dropdown-item" href="/patient">
              Home
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="/patient/feedback">
              Feedbacks
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="/patient/content">
              Exercises
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="/patient/book">
              Appointments
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="/patient/profile">
              Profile
            </a>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <a className="dropdown-item" href="#" onClick={handleLogout}>
              Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  )
}
