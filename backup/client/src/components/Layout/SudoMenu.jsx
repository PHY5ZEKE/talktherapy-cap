import { useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import { page } from "../../utils/page-route";
export default function SudoMenu() {
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
              <Link className="dropdown-item" to={page.sudo.home}>
                Home
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to={page.sudo.archival}>
                Archival
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to={page.sudo.audit}>
                Audit Logs
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to={page.sudo.profile}>
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
