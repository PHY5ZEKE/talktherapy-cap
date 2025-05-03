import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

import axios from "axios";

import { Slide, toast } from "react-toastify";
import { toastMessage } from "../../utils/toastHandler.js";

import { AuthContext } from "../../utils/AuthContext.jsx";

// Utils
import { route } from "../../utils/route.js";

const appURL = import.meta.env.VITE_APP_URL;

export default function Login() {
  const { setAuthInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const notify = () =>
    toast.success(toastMessage.success.login, {
      transition: Slide,
      autoClose: 2000,
    });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${appURL}/${route.system.login}`, {
        email: form.email,
        password: form.password,
      });

      if (response.data.error) {
        setError(response.data.message);
      } else {
        setAuthInfo(response.data.accessToken, response.data.userRole);

        // Redirect based on user role
        switch (response.data.userRole) {
          case "superAdmin":
            notify();
            navigate("/sudo");
            break;
          case "admin":
            notify();
            navigate("/admin");
            break;
          case "clinician":
            notify();
            navigate("/clinician");
            break;
          case "patientslp":
            notify();
            navigate("/patient");
            break;
          default:
            setError("Invalid user role");
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      }
    }
  };
  return (
    <div className="vw-100">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand text-logo fw-bold" to="/">
            TalkTherapy
          </Link>
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
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className="nav-link fw-bold"
                  aria-current="page"
                  to="/#services"
                >
                  Services
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-bold" to="/#faq">
                  FAQ
                </Link>
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

      <div className="d-flex flex-column p-3 blob-3">
        <div
          className="row row-cols-sm-4 row-cols-1 d-flex flex-wrap align-items-center"
          style={{ minHeight: "80vh", height: "100%" }}
        >
          <div className="col"></div>

          <div className="col landing-paragraph my-3 p-3 text-center">
            <h2 className="fw-bold mb-0">Login to</h2>
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
          </div>

          <form className="col p-4">
            <div
              id="formTabContent"
              className="tab-content d-flex bg-white shadow rounded-4 mx-auto p-3 shadow flex-column"
            >
              <h3 className="text-center fw-bold">Hello there!</h3>
              <p className="text-center mb-3">
                Enter your valid credentials to get started.
              </p>
              {error && (
                <p
                  className={`text-${
                    error ? "danger" : "success"
                  } p-2 rounded-2 mb-2`}
                >
                  {error}
                </p>
              )}

              <div className="row">
                <p className="fw-bold mb-2 text-center">Email</p>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="youremail@gmail.com"
                    aria-label="Email"
                    aria-describedby="basic-addon2"
                    name="email"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <p className="fw-bold mb-2 text-center">Password</p>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="********"
                    aria-label="Password"
                    aria-describedby="basic-addon2"
                    name="password"
                    onChange={handleChange}
                  />
                  <span
                    className="input-group-text"
                    id="basic-addon2"
                    style={{ cursor: "pointer" }}
                    onClick={handleTogglePassword}
                  >
                    {showPassword ? <EyeSlashFill /> : <EyeFill />}
                  </span>
                </div>
              </div>

              <div className="col-sm d-flex flex-column align-items-center justify-content-center">
                <button
                  className="text-button fw-bold border rounded-5 my-3"
                  type="submit"
                  onClick={handleLogin}
                >
                  Submit
                </button>
                <Link to="/forgot" className="fw-bold">
                  Forgot Password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
