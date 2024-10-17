import { Link } from "react-router-dom";
import { route } from "../../utils/route.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, middleName, lastName, email, password, confPassword } =
      formData;

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
    };

    try {
      const response = await fetch(`${appURL}/${route.clinician.signup}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionData }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Registration Successful");
        navigate("/login"); // Redirect to login or another page
      } else {
        setMessage(result.message);
        alert(result.message || "Registration Failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
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
            style={{ maxHeight: "70%", minWidth: "300px", maxWidth: "70%" }}
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
                    onClick={toggleConfPasswordVisibility}
                    className="text-button form-show rounded-2"
                  >
                    Show
                  </button>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm input-group">
                <span className="input-group-text">Consent</span>
                <div className="form-check form-check-inline mx-3">
                  <input
                    type="radio"
                    label="Yes"
                    name="consent"
                    value="yes"
                    checked={formData.consent === "yes"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    label="No"
                    name="consent"
                    value="no"
                    checked={formData.consent === "no"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">No</label>
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
  );
}
