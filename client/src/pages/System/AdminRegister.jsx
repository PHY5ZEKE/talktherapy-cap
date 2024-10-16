import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { route } from "../../utils/route.js";
import { useRef, useState } from "react";
export default function AdminRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    clinicaddress: "",
    email: "",
    password: "",
    confPassword: "",
    mobile: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    };

    const {
      firstName,
      middleName,
      lastName,
      email,
      clinicaddress,
      password,
      mobile,
    } = formData;

    if (password !== confPassword) {
        setError(true);
        setMessage("Passwords do not match.");
        return;
      };
    
    const submissionData = {
      firstName,
      middleName,
      lastName,
      email,
      clinicaddress,
      password,
      mobile,
      userRole: "adminslp", // idk what user role
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
        alert("Registration Successful");
        // Redirect to login or another page
      } else {
        alert(result.message || "Registration Failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }

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
            <form className="bg-white form-container rounded-4 mx-auto w-75 p-3" onSubmit={handleSubmit}>
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
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  aria-label="Middle name"
                  placeholder="Middle Name"
                  className="form-control"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  aria-label="Last name"
                  placeholder="Last Name"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="row">
                <div className="col">
                  <div className="input-group mb-3">
                    <span className="input-group-text">Phone Number</span>
                    <input
                      type="string"
                      aria-label="Phone Number"
                      placeholder="Phone Number"
                      className="form-control"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <div className="input-group mb-3">
                    <span className="input-group-text">Clinic Address</span>
                    <input
                      type="string"
                      aria-label="Clinic Address"
                      placeholder="Clinic Address"
                      className="form-control"
                      name="clinicaddress"
                      value={formData.clinicaddress}
                      onChange={handleChange}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                      aria-label="Password"
                      placeholder="Password"
                      className="form-control"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <i onClick={togglePasswordVisibility} className="input-group-text">Show</i>
                  </div>
                </div>

                <div className="col">
                  <div className="input-group mb-3">
                    <span className="input-group-text">Confirm Password</span>
                    <input
                      aria-label="Confirm password"
                      placeholder="Passwords must match"
                      className="form-control"
                      type={showConfPassword ? "text" : "password"}
                      name="confPassword"
                      value={formData.confPassword}
                      onChange={handleChange}
                    />
                    <i onClick={togglePasswordVisibility} className="input-group-text">Show</i>
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
};
