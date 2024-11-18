import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentMedical,
  faFileMedical,
  faLaptopMedical,
  faSquareFull,
} from "@fortawesome/free-solid-svg-icons";

import LoginModal from "./LoginModal";

export default function Landing() {
  return (
    <>
      <LoginModal />

      <div className="bg-white blob-1">
        <div className="d-flex flex-column">
          <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
              <a className="navbar-brand text-logo fw-bold" href="#">
                TalkTherapy
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <a
                      className="nav-link fw-bold"
                      aria-current="page"
                      href="#services"
                    >
                      Services
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link fw-bold" href="#faq">
                      FAQ
                    </a>
                  </li>
                  <li class="nav-item dropdown">
                    <a
                      class="nav-link dropdown-toggle fw-bold"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Register
                    </a>
                    <ul class="dropdown-menu">
                      <li>
                        <a class="dropdown-item" href="/register/patientslp">
                          Patient
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="/register/clinician">
                          Clinician
                        </a>
                      </li>
                      <li>
                        <hr class="dropdown-divider" />
                      </li>
                      <li>
                        <a class="dropdown-item" href="/register/admin">
                          Admin
                        </a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          <div className="d-flex flex-column mx-0 align-items-center justify-content-center">
            <div className="landing-paragraph my-3 p-3 text-center">
              <h2 className="fw-bold mb-0">Welcome to</h2>
              <h1
                className="text-blue text-landing"
                style={{ fontWeight: "900" }}
              >
                TalkTherapy
              </h1>
              <h4>Speech service in your hands.</h4>

              <p className="mb-0">
                Skilled doctors, personalized exercises and feedback system.
              </p>
              <p>All-in-one go with TalkTherapy!</p>

              <button
                className="text-button shadow-sm fw-bold"
                data-bs-toggle="modal"
                data-bs-target="#loginModal"
              >
                Login
              </button>
            </div>

            <div className="my-3">
              <h3 className="text-center fw-bold" id="services">
                Services
              </h3>
              <div className="d-flex justify-content-center">
                <p className="text-center landing-subtext">
                  We prioritize your health by offering tailored services in
                  speech therapy, online appointments, and teleconferencing
                  consultations. Our highly qualified clinicians are here to
                  guide you in choosing the best treatment options to meet your
                  individual health needs. Let us help you find the right path
                  to recovery.
                </p>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-4 align-items-center justify-content-center p-3 my-3">
              <div className="bg-white shadow p-4 rounded-3">
                <FontAwesomeIcon
                  mask={faSquareFull}
                  icon={faCommentMedical}
                  className="landing-icon"
                />
                <h5>Speech Therapy</h5>
                <p>A long ass paragraph para cool hehehehe</p>
              </div>

              <div className="bg-white shadow p-4 rounded-3">
                <FontAwesomeIcon
                  mask={faSquareFull}
                  icon={faFileMedical}
                  className="landing-icon"
                />
                <h5>Appointment</h5>
                <p>A long ass paragraph para cool hehehehe</p>
              </div>

              <div className="bg-white shadow p-4 rounded-3">
                <FontAwesomeIcon
                  mask={faSquareFull}
                  icon={faLaptopMedical}
                  className="landing-icon"
                />
                <h5>Teleconference</h5>
                <p>A long ass paragraph para cool hehehehe</p>
              </div>
            </div>

            <div className="my-3">
              <h3 className="text-center fw-bold" id="faq">
                FAQ
              </h3>
              <div className="d-flex justify-content-center">
                <p className="text-center landing-subtext">
                  We prioritize your health by offering tailored services in
                  physical therapy, online appointments, and teleconferencing
                  consultations. Our highly qualified clinicians are here to
                  guide you in choosing the best treatment options to meet your
                  individual health needs. Let us help you find the right path
                  to recovery.
                </p>
              </div>
            </div>

            <div className="my-3 d-flex flex-column justify-content-center">
              <details className="landing-accordion p-0 mb-3 border border rounded-3">
                <summary className="open:bg-danger p-3 rounded-top-3">
                  header
                </summary>

                <p className="px-3 mt-3">details</p>
              </details>

              <details className="landing-accordion p-0 mb-3 border border rounded-3">
                <summary className="open:bg-danger p-3 rounded-top-3">
                  header
                </summary>

                <p className="px-3 mt-3">details</p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
