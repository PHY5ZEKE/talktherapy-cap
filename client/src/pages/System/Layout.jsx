import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faStethoscope,
  faPhotoFilm,
  faCalendar,
  faGear,
  faRightFromBracket,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";

export default function Layout() {
  return (
    <>
      <div className="container-fluid p-0 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                <p className="mb-0 mt-3">Hello,</p>
                <p className="fw-bold">Admin</p>
              </div>

              <div className="col d-block d-md-none">
                <div className="d-flex align-items-center justify-content-end h-100">
                  <div>
                    <div data-bs-toggle="dropdown" aria-expanded="false">
                      <FontAwesomeIcon icon={faBars} size="xl" />
                    </div>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#">Home</a></li>
                            <li><a className="dropdown-item" href="#">Feedbacks</a></li>
                            <li><a className="dropdown-item" href="#">Exercises</a></li>
                            <li><a className="dropdown-item" href="#">Appointments</a></li>
                            <li><a className="dropdown-item" href="#">Settings</a></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><a className="dropdown-item" href="#">Logout</a></li>
                        </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="row h-100">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Today is </p>
                    <p className="mb-0">Your Appointments</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                  >
                  <h5 className="mb-0 fw-bold text-center">You currently don't have any appointments.</h5>
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Favorite Exercises</p>
                    <p className="mb-0">
                      Your bookmarked exercises will appear here.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh", minHeight: "60vh" }}
                  >
                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-pending">PENDING</div>
                    </div>

                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-accepted">ACCEPTED</div>
                    </div>

                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-cancelled">CANCELLED</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* THIRD COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Notifications</p>
                    <p className="mb-0">
                      Account related notifications will appear here.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh", minHeight: "60vh" }}
                  >
                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-pending">PENDING</div>
                    </div>

                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-accepted">ACCEPTED</div>
                    </div>

                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-cancelled">CANCELLED</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE FOOTER */}
          <div className="d-md-none d-block bg-warning w-100 container-fluid">
            <div className="row">
              <div className="col bg-warning">Full width</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
