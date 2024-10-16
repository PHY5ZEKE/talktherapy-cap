import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { route } from "../../utils/route.js";
import { useRef, useState } from "react";
export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confPassword: "",
    mobile: "",
    birthday: null,
    diagnosis: "",
    consent: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const appURL = import.meta.env.VITE_APP_URL;

  const datePickerRef = useRef(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfPasswordVisibility = () => {
    setShowConfPassword(!showConfPassword);
  };

  const handleIconClick = () => {
    datePickerRef.current.setFocus();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      birthday: date,
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2); // Move to the next step
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.consent !== "yes") {
      alert("You must accept the terms and conditions to sign up.");
      return;
    }

    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      mobile,
      birthday,
      diagnosis,
      consent,
    } = formData;

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
      userRole: "patientslp",
    };

    try {
      const response = await fetch(`${appURL}/${route.patient.signup}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Registration Successful");
        // Redirect to login or another page
      } else {
        alert(result.message || "Registration Failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <div className="container-fluid d-flex flex-column justify-content-between vh-100 backgroundImg">
        <div className="row bg-white">
          <nav className="p-3 border border-top-0 border-start-0 border-end-0">
            <p className="fw-bolder h5 mb-0">TalkTherapy</p>
            <p className="mb-0">Rehabilitation in your hands.</p>
          </nav>
        </div>

        <div className="row h-100">
          <div className="col d-none d-md-block p-3">
            <div className="w-75 mx-auto d-flex flex-column justify-content-center h-100 logoContainer">
              <h1 className="fw-boldest">TalkTherapy</h1>
              <h3 className="fw-boldest">Rehabilitation in your hands.</h3>
              <p>
                Skilled doctors, efficient scheduling, and telerehabilitation.
                All-in-one go with TalkTherapy.
              </p>
            </div>
          </div>

          <div className="col my-auto p-3">
            <form className="bg-white form-container rounded-4 mx-auto w-75 p-3">
              <h4 className="fw-bold text-center mb-0">Register</h4>
              <p className="text-center"> Please fill out all fields.</p>
              <h6>Basic Information</h6>

              <div className="input-group mb-3">
                <span className="input-group-text">
                  First, Middle, Last Name
                </span>
                <input
                  type="text"
                  aria-label="First name"
                  placeholder="First Name"
                  className="form-control"
                />
                <input
                  type="text"
                  aria-label="Middle name"
                  placeholder="Middle Name"
                  className="form-control"
                />
                <input
                  type="text"
                  aria-label="Last name"
                  placeholder="Last Name"
                  className="form-control"
                />
              </div>

              <div className="row">
                <div className="col">
                  <div className="input-group mb-3">
                    <span className="input-group-text">Phone Number</span>
                    <input
                      type="string"
                      aria-label="First name"
                      placeholder="First Name"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col">
                  <div className="input-group mb-3">
                    <span className="input-group-text">Date of Birth</span>
                    <input
                      type="date"
                      aria-label="Birthday"
                      placeholder="Birthday"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <h6>Credentials</h6>

              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Valid email address"
                  aria-label="Valid email address"
                  aria-describedby="basic-addon2"
                />
                <span className="input-group-text" id="basic-addon2">
                  @gmail.com
                </span>
              </div>

              <div className="row">
                <div className="col">
                  <div className="input-group mb-3">
                    <span className="input-group-text">Password</span>
                    <input
                      type="password"
                      aria-label="Password"
                      placeholder="Password"
                      className="form-control"
                    />
                    <span className="input-group-text">Show</span>
                  </div>
                </div>

                <div className="col">
                  <div className="input-group mb-3">
                    <span className="input-group-text">Confirm Password</span>
                    <input
                      type="password"
                      aria-label="Confirm password"
                      placeholder="Passwords must match"
                      className="form-control"
                    />
                    <span className="input-group-text">Show</span>
                  </div>
                </div>
              </div>

              <h6>Medical Information</h6>

              <div className="row">
                <div className="col">
                  <div className="input-group">
                    <span className="input-group-text">Medical Diagnosis</span>
                    <select
                      className="form-select"
                      aria-label="Default select example"
                    >
                      <option selected>Open this select menu</option>
                      <option value="1">One</option>
                      <option value="2">Two</option>
                      <option value="3">Three</option>
                    </select>
                  </div>
                </div>
                <div className="col">
                  <div className="input-group">
                    <span className="input-group-text">Medical Diagnosis</span>
                    <div className="form-check form-check-inline mx-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="inlineRadioOptions"
                        id="inlineRadio1"
                        value="yes"
                      />
                      <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="inlineRadioOptions"
                        id="inlineRadio2"
                        value="no"
                      />
                      <label className="form-check-label">No</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-100 d-flex flex-column align-items-center justify-content-center">
                <button
                  className="text-button border rounded-5 my-3"
                  type="submit"
                >
                  Submit
                </button>
                <Link to="/login" className="loginLink">
                  I want to login
                </Link>
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
