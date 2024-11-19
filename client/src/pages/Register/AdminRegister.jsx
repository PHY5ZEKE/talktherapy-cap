import { Link } from "react-router-dom";
import { route } from "../../utils/route.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Slide } from "react-toastify";

import { toastMessage } from "../../utils/toastHandler";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

export default function AdminRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    email: "",
    password: "",
    confPassword: "",
    mobile: "",
  });

  const notify = (message) =>
    toast.success(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const appURL = import.meta.env.VITE_APP_URL;

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfPasswordVisibility = () => {
    setShowConfPassword(!showConfPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      firstName,
      middleName,
      lastName,
      email,
      address,
      password,
      confPassword,
      mobile,
    } = formData;

    if (password !== confPassword) {
      setError(true);
      setMessage("Passwords do not match.");
      return;
    }

    const submissionData = {
      firstName,
      middleName,
      lastName,
      email,
      address,
      password,
      mobile,
    };

    try {
      const response = await fetch(`${appURL}/${route.admin.signup}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        setError(false);
        notify(toastMessage.success.register);
        navigate("/login");
      } else {
        setMessage(result.message || "Registration Failed");
        setError(true);
      }
    } catch (error) {
      // Display error message in the form itself
      failNotify(toastMessage.fail.error);
      failNotify(error);
      setError(true);
    }
  };

  return (
    <div className="mw-100">
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

      <div
        style={{ minHeight: "80vh", height: "100%" }}
        className="row row-cols-sm-2 row-cols-1 d-flex flex-wrap align-items-center"
      >
        <div className="col landing-paragraph my-3 p-3 text-center">
          <h2 className="fw-bold mb-0">Register to</h2>
          <h1 className="text-blue text-landing" style={{ fontWeight: "900" }}>
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
            <h3 className="text-center fw-bold">Admin Registration</h3>
            {message && (
              <p className="text-danger text-center mb-2 p-2 rounded-3">
                {message}
              </p>
            )}

            <div
              className="tab-pane fade show active text-black"
              id="basic-tab-pane"
              role="tabpanel"
              aria-labelledby="basic-tab"
              tabIndex="0"
            >
              <h5 className="fw-bold">Basic Information</h5>

              <div className="">
                <p className="mb-0">First Name</p>
                <input
                  type="text"
                  className="form-control rounded-2"
                  aria-label="First name"
                  placeholder="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="">
                <p className="mb-0">Middle Name</p>
                <input
                  type="text"
                  aria-label="Middle name"
                  placeholder="Middle Name"
                  className="form-control rounded-2"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <p className="mb-0">Last Name</p>
                <input
                  type="text"
                  aria-label="Last name"
                  placeholder="Last Name"
                  className="form-control rounded-2"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <p className="mb-0">Phone Number</p>
                <input
                  type="text"
                  aria-label="Phone Number"
                  placeholder="Phone Number"
                  className="form-control rounded-2"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </div>

              <div>
                <p className="mb-0">Clinic Address</p>
                <input
                  type="text"
                  aria-label="Clinic address"
                  placeholder="Clinic Address"
                  className="form-control rounded-2"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="">
                <p className="mb-0">Birthday</p>
                <input
                  aria-label="Date"
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="form-control rounded"
                />
              </div>
            </div>

            <div
              className="tab-pane fade text-black"
              id="credential-tab-pane"
              role="tabpanel"
              aria-labelledby="credential-tab"
              tabIndex="0"
            >
              <h5 className="mt-3 fw-bold">Credentials</h5>

              <div className="">
                <p className="mb-0 fw-bold">Valid Email</p>
                <input
                  type="email"
                  className="form-control rounded-2"
                  placeholder="Valid email address"
                  aria-label="Valid email address"
                  aria-describedby="basic-addon2"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <p className="fw-bold mb-0">Password</p>
                <div className="d-flex">
                  <input
                    aria-label="Password"
                    placeholder="Password"
                    className="form-control rounded-2"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <span
                    className="input-group-text"
                    id="basic-addon2"
                    style={{ cursor: "pointer" }}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeSlashFill /> : <EyeFill />}
                  </span>
                </div>
              </div>

              <div className="">
                <p className="fw-bold mb-0">Confirm Password</p>

                <div className="d-flex">
                  <input
                    aria-label="Confirm password"
                    placeholder="Passwords must match"
                    className="form-control rounded-2"
                    type={showConfPassword ? "text" : "password"}
                    name="confPassword"
                    value={formData.confPassword}
                    onChange={handleChange}
                  />
                  <span
                    className="input-group-text"
                    id="basic-addon2"
                    style={{ cursor: "pointer" }}
                    onClick={toggleConfPasswordVisibility}
                  >
                    {showConfPassword ? <EyeSlashFill /> : <EyeFill />}
                  </span>
                </div>
              </div>
            </div>

            <ul
              className="mt-3 d-flex justify-content-center gap-1 nav nav-pills h-auto border-0"
              id="form-tab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link border active"
                  id="pills-basic-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#basic-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="basic-tab-pane"
                  aria-selected="true"
                >
                  1
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link border"
                  id="pills-credential-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#credential-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="credential-tab-pane"
                  aria-selected="false"
                >
                  2
                </button>
              </li>
            </ul>

            <div className="col-sm d-flex flex-column align-items-center justify-content-center">
              <button
                className="text-button fw-bold border rounded-5 my-3"
                type="submit"
                onClick={handleSubmit}
              >
                Submit
              </button>
              <Link to="/login" className="fw-bold">
                I want to login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
