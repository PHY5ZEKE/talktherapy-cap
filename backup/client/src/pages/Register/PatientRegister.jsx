import { Link } from "react-router-dom";
import { route } from "../../utils/route.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Slide } from "react-toastify";

import { toastMessage } from "../../utils/toastHandler";
import ConsentForm from "../../components/Modals/ConsentForm.jsx";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

import { emailSuccessRegister } from "../../utils/emailSuccessRegister.jsx";
export default function PatientRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confPassword: "",
    mobile: "",
    birthday: "",
    diagnosis: "",
    consent: "no", // Default value is "no"
  });

  const [passwordValidationMessages, setPasswordValidationMessages] = useState({
    length: "Must be at least 8 characters",
    lowercase: "Must have one lowercase letter",
    uppercase: "Must have one uppercase letter",
    number: "Must include a number",
    special: "Must include a special character",
  });

  const [isTypingPassword, setIsTypingPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfPasswordVisibility = () => {
    setShowConfPassword(!showConfPassword);
  };

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? (checked ? "yes" : "no") : value,
    }));

    if (name === "password") {
      setIsTypingPassword(true);
      const validationMessages = {
        length: value.length >= 8 ? "" : "Must be at least 8 characters",
        lowercase: /[a-z]/.test(value) ? "" : "Must have one lowercase letter",
        uppercase: /[A-Z]/.test(value) ? "" : "Must have one uppercase letter",
        number: /\d/.test(value) ? "" : "Must include a number",
        special: /[^a-zA-Z0-9]/.test(value)
          ? ""
          : "Must include a special character",
      };
      setPasswordValidationMessages(validationMessages);
    }
  };

  const [isDisabled, setIsDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsDisabled(true);
    setIsSubmitting(true);

    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      confPassword,
      mobile,
      birthday,
      diagnosis,
      consent,
    } = formData;

    if (password !== confPassword) {
      setIsDisabled(false);
      setIsSubmitting(false);
      setError(true);
      setMessage("Passwords do not match.");
      return;
    }

    const submissionData = {
      firstName,
      middleName,
      lastName,
      email,
      password,
      mobile,
      birthday,
      diagnosis,
      consent: consent === "yes",
    };

    try {
      const response = await fetch(`${appURL}/${route.patient.signup}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionData }),
      });

      const result = await response.json();

      if (response.ok) {
        emailSuccessRegister(email);
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
    } finally {
      setIsDisabled(false);
      setIsSubmitting(false);
    }
  };

  const [isViewConsentForm, setViewConsentForm] = useState(false);
  const handleCViewConsentForm = () => {
    setViewConsentForm(!isViewConsentForm);
  };

  return (
    <>
      {isViewConsentForm && (
        <ConsentForm handleModal={handleCViewConsentForm} />
      )}

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
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
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
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle fw-bold"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Register
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/register/patientslp">
                        Patient
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/register/clinician">
                        Clinician
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/register/admin">
                        Admin
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="d-flex flex-column p-5 blob-3">
          <div
            className="row row-cols-sm-4 row-cols-1 align-items-center"
            style={{ minHeight: "80vh", height: "100%" }}
          >
            <div className="col"></div>
            <div className="col landing-paragraph my-3 p-3 text-center">
              <h2 className="fw-bold mb-0">Register to</h2>
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

            <form className="col p-2">
              <div
                id="formTabContent"
                className="tab-content p-3 d-flex bg-white shadow rounded-4 mx-auto shadow flex-column"
              >
                <h3 className="text-center fw-bold">Patient Registration</h3>
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
                    <p className="mb-0">
                      First Name <span className="text-required">*</span>
                    </p>
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
                  <div className="">
                    <p className="mb-0">
                      Last Name <span className="text-required">*</span>
                    </p>
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

                  <div className="">
                    <p className="mb-0">
                      Phone Number <span className="text-required">*</span>
                    </p>
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

                  <div className="">
                    <p className="mb-0">
                      Birthday <span className="text-required">*</span>
                    </p>
                    <input
                      aria-label="Date"
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      className="form-control rounded"
                    />
                  </div>

                  <div className="">
                    <p className="mb-0">
                      Medical Diagnosis <span className="text-required">*</span>
                    </p>
                    <select
                      className="form-select rounded-2"
                      aria-label="Diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <option value="" disabled>
                        Select Your Diagnosis
                      </option>
                      <option value="Autism Spectrum Disorder">
                        Autism Spectrum Disorder
                      </option>
                      <option value="Attention-Deficit Hyperactivity Disorder">
                        Attention-Deficit Hyperactivity Disorder
                      </option>
                      <option value="Global Developmental Delay">GDD</option>
                      <option value="Cerebral Palsy">Cerebral Palsy</option>
                      <option value="Down Syndrome">Down Syndrome</option>
                      <option value="Hearing Impairment">
                        Hearing Impairment
                      </option>
                      <option value="Cleft Lip and/or Palate">
                        Cleft Lip and/or Palate
                      </option>
                      <option value="Stroke">Stroke</option>
                      <option value="Stuttering">Stuttering</option>
                      <option value="Aphasia">Aphasia</option>
                      <option value="Others">Others</option>
                    </select>
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
                    <p className="mb-0 fw-bold">
                      Valid Email <span className="text-required">*</span>
                    </p>
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
                    <p className="fw-bold mb-0">
                      Password <span className="text-required">*</span>
                    </p>
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
                    <div className="mt-2">
                      {isTypingPassword &&
                        Object.values(passwordValidationMessages).map(
                          (message, index) =>
                            message && (
                              <p key={index} className="text-red mb-0">
                                {message}
                              </p>
                            )
                        )}
                    </div>
                  </div>

                  <div className="">
                    <p className="fw-bold mb-0">
                      Confirm Password <span className="text-required">*</span>
                    </p>

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

                  <div className="form-check mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="consent"
                      id="consent"
                      checked={formData.consent === "yes"}
                      onChange={handleChange}
                    />

                    <span
                      className="view-consent ms-2"
                      onClick={handleCViewConsentForm}
                      style={{ cursor: "pointer", color: "blue" }}
                    >
                      View Consent Form
                    </span>
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
                    disabled={isDisabled || isSubmitting}
                  >
                    {isSubmitting ? `SUBMITTING` : `SUBMIT`}
                  </button>
                  <Link to="/login" className="fw-bold">
                    I want to login
                  </Link>
                </div>
              </div>
            </form>

            <div className="col"></div>
          </div>
        </div>
      </div>
    </>
  );
}
