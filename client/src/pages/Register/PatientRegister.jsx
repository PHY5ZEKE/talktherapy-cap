import { Link } from "react-router-dom";
import { route } from "../../utils/route.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Slide } from "react-toastify";

import { toastMessage } from "../../utils/toastHandler";
import ConsentForm from "../../components/Modals/ConsentForm.jsx";

export default function ClinicianRegister() {
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
    consent: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const appURL = import.meta.env.VITE_APP_URL;

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfPasswordVisibility = () => {
    setShowConfPassword(!showConfPassword);
  };

  const navigate = useNavigate();

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
      password,
      confPassword,
      mobile,
      birthday,
      diagnosis,
      consent,
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

  const [isViewConsentForm, setViewConsentForm] = useState(false);
  const handleCViewConsentForm = () => {
    setViewConsentForm(!isViewConsentForm);
  };

  return (
    <>
      {isViewConsentForm && (
        <ConsentForm handleModal={handleCViewConsentForm} />
      )}
      <div className="container-fluid d-flex flex-column justify-content-between vh-100 backgroundImg">
        <div className="row bg-white">
          <nav className="p-3 border border-top-0 border-start-0 border-end-0">
            <p className="fw-bolder h5 mb-0">TalkTherapy</p>
            <p className="mb-0">Rehabilitation in your hands.</p>
          </nav>
        </div>

        <div className="row h-100">
          <div className="col-sm d-none d-lg-block p-3">
            <div className="mx-auto d-flex flex-column justify-content-center h-100 logoContainer">
              <h1 className="fw-boldest">TalkTherapy</h1>
              <h3 className="fw-boldest">Rehabilitation in your hands.</h3>
              <p>
                Skilled doctors, efficient scheduling, and telerehabilitation.
                All-in-one go with TalkTherapy.
              </p>
            </div>
          </div>

          <div className="col-sm my-auto p-3 overflow-hidden">
            {message && (
              <div
                className="d-flex mx-auto text-danger text-center mb-2 p-2 rounded-3 border"
                style={{ minWidth: "300px", maxWidth: "70%" }}
              >
                {message}
              </div>
            )}
            <form
              className="bg-white container-fluid form-container rounded-4 mx-auto p-3 overflow-auto"
              style={{ maxHeight: "75vh", minWidth: "300px", maxWidth: "70%" }}
              onSubmit={handleSubmit}
            >
              <h2 className="fw-bold text-center mb-0">Register</h2>
              <p className="text-center"> Please fill out all fields.</p>

              <h5>Basic Information</h5>

              <div className="row">
                <div className="col-sm d-flex flex-column mb-3">
                  <p className="mb-0 fw-bold">First Name</p>
                  <input
                    type="text"
                    className="form-input rounded-2"
                    aria-label="First name"
                    placeholder="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm d-flex flex-column mb-3">
                  <p className="mb-0 fw-bold">Middle Name</p>
                  <input
                    type="text"
                    aria-label="Middle name"
                    placeholder="Middle Name"
                    className="form-input rounded-2"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm d-flex flex-column mb-3">
                  <p className="mb-0 fw-bold">Last Name</p>
                  <input
                    type="text"
                    aria-label="Last name"
                    placeholder="Last Name"
                    className="form-input rounded-2"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-sm d-flex flex-column mb-3">
                  <p className="mb-0 fw-bold">Phone Number</p>
                  <input
                    type="text"
                    aria-label="Phone Number"
                    placeholder="Phone Number"
                    className="form-input rounded-2"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm d-flex flex-column mb-3">
                  <p className="mb-0 fw-bold">Birthday</p>
                  <input
                    aria-label="Date"
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="form-input rounded"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-sm d-flex flex-column mb-3">
                  <p className="fw-bold mb-0">Medical Diagnosis</p>
                  <select
                    className="form-input rounded-2"
                    aria-label="Diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
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

              <h5>Credentials</h5>

              <div className="row">
                <div className="col-sm d-flex flex-column mb-3">
                  <p className="mb-0 fw-bold">Valid Email</p>
                  <input
                    type="email"
                    className="form-input rounded-2"
                    placeholder="Valid email address"
                    aria-label="Valid email address"
                    aria-describedby="basic-addon2"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-sm d-flex flex-column mb-3">
                  <p className="fw-bold mb-0">Password</p>
                  <div className="d-flex">
                    <input
                      aria-label="Password"
                      placeholder="Password"
                      className="form-input rounded-2 w-100"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-button form-show rounded-2"
                    >
                      Show
                    </button>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm d-flex flex-column mb-3">
                  <p className="fw-bold mb-0">Confirm Password</p>

                  <div className="d-flex">
                    <input
                      aria-label="Confirm password"
                      placeholder="Passwords must match"
                      className="form-input rounded-2 w-100"
                      type={showConfPassword ? "text" : "password"}
                      name="confPassword"
                      value={formData.confPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={toggleConfPasswordVisibility}
                      className="text-button form-show rounded-2"
                    >
                      Show
                    </button>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm d-flex flex-column mb-3">
                  <p className="fw-bold mb-0">
                    Consent{" "}
                    <span
                      className="view-consent"
                      onClick={handleCViewConsentForm}
                    >
                      View Consent Form
                    </span>
                  </p>
                  <div className="d-flex">
                    <input
                      type="radio"
                      label="Yes"
                      name="consent"
                      value="yes"
                      checked={formData.consent === "yes"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label mx-2">Yes</label>
                    <input
                      type="radio"
                      label="No"
                      name="consent"
                      value="no"
                      checked={formData.consent === "no"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label mx-2">No</label>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm d-flex flex-column align-items-center justify-content-center">
                  <button
                    className="text-button fw-bold border rounded-5 my-3"
                    type="submit"
                  >
                    Submit
                  </button>
                  <Link to="/login" className="loginLink">
                    I want to login
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="row bg-white border border-bottom-0 border-start-0 border-end-0">
          <div className="col mx-auto text-center p-3">
            <p className="fw-bold mb-0">TalkTherapy</p>
          </div>
        </div>
      </div>
    </>
  );
}
