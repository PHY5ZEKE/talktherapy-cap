import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLaptopMedical } from "@fortawesome/free-solid-svg-icons";

export default function Landing() {
  return (
    <>
      <div className="container d-flex flex-column blob-1">
        <nav className="navbar px-3 navbar-expand-lg my-2 rounded-2">
          <div className="container-fluid">
            <a className="navbar-brand text-logo fw-bold" href="#">
              TalkTherapy
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavAltMarkup"
              aria-controls="navbarNavAltMarkup"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div className="navbar-nav">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
                <a className="nav-link" href="#services">
                  Services
                </a>
                <a className="nav-link" href="#faq">
                  FAQ
                </a>
              </div>
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
            <p>All-in-one go with TalkTherapy</p>

            <button className="text-button shadow-sm fw-bold">Login</button>
          </div>

          <div className="my-3">
            <h3 className="text-center fw-bold" id="services">Services</h3>
            <div className="d-flex justify-content-center">
              <p className="text-center landing-subtext">
                We prioritize your health by offering tailored services in
                physical therapy, online appointments, and teleconferencing
                consultations. Our highly qualified clinicians are here to guide
                you in choosing the best treatment options to meet your
                individual health needs. Let us help you find the right path to
                recovery.
              </p>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-4 align-items-center justify-content-center my-3">
            <div className="bg-white shadow-sm p-4 rounded-3">
              <FontAwesomeIcon
                icon={faLaptopMedical}
                className="landing-icon"
              />
              <h5>Speech Therapy</h5>
              <p>A long ass paragraph para cool hehehehe</p>
            </div>

            <div className="bg-white shadow-sm p-4 rounded-3">
              <FontAwesomeIcon
                icon={faLaptopMedical}
                className="landing-icon"
              />
              <h5>Speech Therapy</h5>
              <p>A long ass paragraph para cool hehehehe</p>
            </div>

            <div className="bg-white shadow-sm p-4 rounded-3">
              <FontAwesomeIcon
                icon={faLaptopMedical}
                className="landing-icon"
              />
              <h5>Teleconference</h5>
              <p>A long ass paragraph para cool hehehehe</p>
            </div>
          </div>

          <div className="my-3">
            <h3 className="text-center fw-bold" id="faq">FAQ</h3>
            <div className="d-flex justify-content-center">
              <p className="text-center landing-subtext">
                We prioritize your health by offering tailored services in
                physical therapy, online appointments, and teleconferencing
                consultations. Our highly qualified clinicians are here to guide
                you in choosing the best treatment options to meet your
                individual health needs. Let us help you find the right path to
                recovery.
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
    </>
  );
}
