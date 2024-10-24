import { useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
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
              <a className="dropdown-item" href={page.sudo.home}>
                Home
              </a>
            </li>
            <li>
              <a className="dropdown-item" href={page.sudo.audit}>
                Audit Logs
              </a>
            </li>
            <li>
              <a className="dropdown-item" href={page.sudo.archival}>
                Data Archival
              </a>
            </li>
            <li>
              <a className="dropdown-item" href={page.sudo.profile}>
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
  );
}
