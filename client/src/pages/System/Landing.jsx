import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentMedical,
  faFileMedical,
  faLaptopMedical,
  faSquareFull,
} from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <>
      <div className="blob-1">
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
                      <Link class="dropdown-item" to="/register/patientslp">
                        Patient
                      </Link>
                    </li>
                    <li>
                      <Link class="dropdown-item" to="/register/clinician">
                        Clinician
                      </Link>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <Link class="dropdown-item" to="/register/admin">
                        Admin
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="d-flex flex-column">
          <div className="blob-2 d-flex flex-column mx-0 align-items-center justify-content-center">
            <div className="landing-paragraph my-5 p-3 text-center">
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
              <Link to="/login">
                <button className="text-button shadow-sm fw-bold">Login</button>
              </Link>
            </div>

            <div className="py-5">
              <div className="my-3">
                <h3 className="text-center fw-bold" id="services">
                  Services
                </h3>
                <div className="d-flex justify-content-center">
                  <p className="text-center landing-subtext">
                    We prioritize your health by offering tailored services in
                    speech therapy, online appointments, and teleconferencing
                    consultations. Our highly qualified clinicians are here to
                    guide you in choosing the best treatment options to meet
                    your individual health needs. Let us help you find the right
                    path to recovery.
                  </p>
                </div>
              </div>

              <div className="mx-auto row row-cols-sm-4 row-cols-md-3 row-cols-lg-4 row-cols-1 justify-content-center p-3 gap-3">
                <div className="col bg-white shadow p-4 rounded-3 mb-3">
                  <FontAwesomeIcon
                    mask={faSquareFull}
                    icon={faCommentMedical}
                    className="landing-icon mb-3"
                  />
                  <h5 className="fw-bold mb-3">Speech Therapy</h5>
                  <p className="text-secondary-emphasis">
                    TalkTherapy is a web application designed to make speech
                    therapy accessible and affordable for individuals with
                    speech and communication challenges, especially in
                    underserved areas of the Philippines. By connecting patients
                    with licensed therapists through online consultations, the
                    platform eliminates the need for travel and physical
                    resources. It also uses advanced technologies like facial,
                    lip, and voice recognition to provide personalized feedback
                    and progress tracking.
                  </p>
                </div>

                <div className="col bg-white shadow p-4 rounded-3 mb-3">
                  <FontAwesomeIcon
                    mask={faSquareFull}
                    icon={faFileMedical}
                    className="landing-icon mb-3"
                  />
                  <h5 className="fw-bold mb-3">Appointment</h5>
                  <p className="text-secondary-emphasis">
                    Scheduling speech therapy appointments has never been
                    easier. With TalkTherapy, you can book sessions with
                    speech-language pathologists at your convenience, all from
                    the comfort of your home. Our user-friendly platform lets
                    you select preferred day and time, and view therapist
                    availability. TalkTherapy ensures a hassle-free process, so
                    you can focus on improving your communication skills.
                  </p>
                </div>

                <div className="col bg-white shadow p-4 rounded-3 mb-3">
                  <FontAwesomeIcon
                    mask={faSquareFull}
                    icon={faLaptopMedical}
                    className="landing-icon mb-3"
                  />
                  <h5 className="fw-bold mb-3">Teleconference</h5>
                  <p className="text-secondary-emphasis">
                    TalkTherapy brings speech therapy right to your fingertips
                    through secure and reliable teleconferencing. Our platform
                    connects you with speech-language pathologists for live,
                    one-on-one sessions, eliminating the need for long commutes
                    or physical visits. Whether you're at home or on the go, you
                    can access professional guidance and personalized exercises
                    designed to meet your communication needs.
                  </p>
                </div>
              </div>
            </div>

            <div className="blob-4">
              <div className="py-5">
                <div className="my-3">
                  <h3 className="text-center fw-bold" id="faq">
                    FAQ
                  </h3>
                  <div className="d-flex justify-content-center">
                    <p className="text-center landing-subtext mb-0">
                      We prioritize your health by offering tailored services in
                      physical therapy, online appointments, and
                      teleconferencing consultations. Our highly qualified
                      clinicians are here to guide you in choosing the best
                      treatment options to meet your individual health needs.
                      Let us help you find the right path to recovery.
                    </p>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column justify-content-center">
                <details className="mx-auto landing-accordion p-0 mb-3 border border rounded-3">
                  <summary className="open:bg-danger p-3 rounded-top-3">
                    What is the process for booking an appointment?
                  </summary>

                  <p className="px-3 mt-3">
                    Ensure your referral file is ready.
                  </p>

                  <p className="px-3 mt-3">
                    Navigate to the "Book Schedule" page.
                  </p>
                  <p className="px-3 mt-3">
                    Fill out the required information.
                  </p>
                  <p className="px-3 mt-3">
                    Upload your referral file and click "Submit."
                  </p>
                  <p className="px-3 mt-3">
                    Your request will be marked as pending and will require
                    approval by an administrator.
                  </p>
                  <p className="px-3 mt-3"></p>
                </details>

                <details className="mx-auto landing-accordion p-0 mb-3 border border rounded-3">
                  <summary className="open:bg-danger p-3 rounded-top-3">
                    Can I reschedule my appointments if I am unavailable?
                  </summary>

                  <p className="px-3 mt-3">
                    Yes, appointments can be rescheduled based on clinician
                    availability. However, rescheduling requires administrator
                    approval. If rescheduling is denied, the appointment will
                    revert to its original time.
                  </p>
                </details>

                <details className="mx-auto landing-accordion p-0 mb-3 border border rounded-3">
                  <summary className="open:bg-danger p-3 rounded-top-3">
                    Can I change the schedule of my appointment?
                  </summary>

                  <p className="px-3 mt-3">
                    Yes, appointment schedules can be adjusted based on
                    clinician availability, but changes are subject to
                    administrator approval.
                  </p>
                </details>

                <details className="mx-auto landing-accordion p-0 mb-3 border border rounded-3">
                  <summary className="open:bg-danger p-3 rounded-top-3">
                    Why is my appointment pending?
                  </summary>

                  <p className="px-3 mt-3">
                    Appointments are marked as Pending because they require
                    review and approval by an administrator to ensure: The
                    referral file you submitted is valid and complete. The
                    requested schedule aligns with clinician availability. All
                    system policies and procedures are being followed. Once your
                    appointment is reviewed and accepted by an administrator,
                    you will receive a confirmation notification.
                  </p>
                </details>

                <details className="mx-auto landing-accordion p-0 mb-3 border border rounded-3">
                  <summary className="open:bg-danger p-3 rounded-top-3">
                    Which browsers support the machine learning functionality?
                  </summary>

                  <p className="px-3 mt-3">
                    The machine learning functionality works best with Google
                    Chrome and Microsoft Edge. While it is compatible with most
                    browsers, it is not operable on Opera and Firefox.
                  </p>
                </details>

                <details className="mx-auto landing-accordion p-0 mb-3 border border rounded-3">
                  <summary className="open:bg-danger p-3 rounded-top-3">
                    How do I register as a clinician or admin?
                  </summary>

                  <p className="px-3 mt-3">
                    To register, your email must first be added to the system by
                    authorized personnel. Once registered, you can create an
                    account.
                  </p>
                </details>

                <details className="mx-auto landing-accordion p-0 mb-3 border border rounded-3">
                  <summary className="open:bg-danger p-3 rounded-top-3">
                    What happens if my account is archived?
                  </summary>

                  <p className="px-3 mt-3">
                    Archived accounts will no longer have access to the system.
                    Additionally, all associated appointments and schedules will
                    be cleared.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
