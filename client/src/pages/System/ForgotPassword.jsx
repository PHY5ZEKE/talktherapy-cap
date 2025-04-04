import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

import { route } from "../../utils/route.js";

export default function ForgotPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const appURL = import.meta.env.VITE_APP_URL;
  const navigate = useNavigate();

  const [passwordValidationMessages, setPasswordValidationMessages] = useState({
    length: "Must be at least 8 characters",
    lowercase: "Must have one lowercase letter",
    uppercase: "Must have one uppercase letter",
    number: "Must include a number",
    special: "Must include a special character",
  });

  const [isTypingPassword, setIsTypingPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfPasswordVisibility = () => {
    setShowConfPassword(!showConfPassword);
  };

  const [isSending, setIsSending] = useState(false);
  const [isOtp, setIsOtp] = useState(false);

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setPassword(value);
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
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setIsSending(true);
      const response = await fetch(`${appURL}/${route.system.forgot}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.error) {
        setMessage(data.message);
        setIsError(true);
        setIsSending(false);
      } else {
        setIsError(false);
        setMessage("OTP sent to your email.");
        setIsSending(false);
        setStep(2);
      }
    } else if (step === 2) {
      // Handle verify OTP
      setIsSending(true);
      setIsOtp(true);
      const response = await fetch(`${appURL}/${route.system.otp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (data.error) {
        setIsError(true);
        setIsOtp(false);
        setIsSending(false);
        setMessage(data.message);
      } else {
        setIsError(false);
        setIsOtp(false);
        setIsSending(false);
        setMessage("OTP verified. Please enter your new password.");
        setStep(3);
      }
    } else if (step === 3) {
      // Handle reset password
      setIsSending(true);
      const response = await fetch(`${appURL}/${route.system.reset}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, password, confirmPassword }),
      });
      const data = await response.json();
      if (data.error) {
        setIsError(true);
        setIsSending(false);
        setMessage(data.message);
      } else {
        setIsError(false);
        setIsSending(false);
        setMessage("Password has been reset successfully.");
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
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

      <div
        className="row row-cols-sm-2 row-cols-1 d-flex flex-wrap align-items-center"
        style={{ minHeight: "80vh", height: "100%" }}
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

        <div className="col p-4">
          <div className="d-flex bg-white shadow rounded-4 mx-auto p-3 shadow flex-column">
            {message && (
              <p
                className={`text-center text-${
                  !isError ? "success" : "danger"
                } p-2 rounded-2 mb-2`}
              >
                {message}
              </p>
            )}

            {step === 1 && (
              <form className="d-flex flex-column justify-content-center">
                <h3 className="text-center fw-bold">Forgot Password?</h3>
                <p className="text-center mb-3">
                  Enter your valid email address to receive OTP.
                </p>

                <div className="row">
                  <p className="fw-bold mb-2 text-center">Email</p>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="youremail@gmail.com"
                      aria-label="Email"
                      aria-describedby="basic-addon2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="mx-auto text-button fw-bold border rounded-5 my-3"
                  type="submit"
                  onClick={handleNext}
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Submit"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form className="d-flex flex-column justify-content-center">
                <h3 className="text-center fw-bold">Forgot Password?</h3>
                <p className="text-center mb-3">
                  Your OTP is valid for 3 minutes.
                </p>

                <div className="row">
                  <p className="fw-bold mb-2 text-center">OTP</p>
                  <div className="input-group mb-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="mx-auto text-button fw-bold border rounded-5 my-3"
                  type="submit"
                  onClick={handleNext}
                  disabled={isSending}
                >
                  {isSending && isOtp ? "Verifying..." : "Submit"}
                </button>
              </form>
            )}

            {step === 3 && (
              <form className="d-flex flex-column justify-content-center">
                <h3 className="text-center fw-bold">New Password</h3>
                <p className="text-center mb-3">Type your new password.</p>

                <div className="row">
                  <p className="fw-bold mb-2 text-center">Password</p>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="********"
                      aria-label="Password"
                      aria-describedby="basic-addon2"
                      value={password}
                      onChange={handlePasswordChange}
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

                <div className="row">
                  <p className="fw-bold mb-2 text-center">Confirm Password</p>
                  <div className="input-group">
                    <input
                      type={showConfPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="********"
                      aria-label="Password"
                      aria-describedby="basic-addon2"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

                <button
                  className="mx-auto text-button fw-bold border rounded-5 my-3"
                  type="submit"
                  onClick={handleNext}
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Submit"}
                </button>
              </form>
            )}

            <div className="col-sm d-flex flex-column align-items-center justify-content-center">
              <Link to="/login" className="fw-bold">
                I want to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
