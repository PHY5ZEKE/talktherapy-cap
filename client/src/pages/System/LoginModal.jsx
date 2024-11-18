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

export default function LoginModal() {
  const { setAuthInfo } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const notify = () =>
    toast.success(toastMessage.success.login, {
      transition: Slide,
      autoClose: 2000,
    });

  const handleForgot = () => {
    navigate("/forgot");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${appURL}/${route.system.login}`, {
        email,
        password,
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
    <>
      <div
        className="modal fade"
        id="loginModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" id="exampleModalLabel">
            <div className="d-flex flex-column text-center">
              <h2 className="fw-bold mt-3 mb-0">Hello there!</h2>
              <p className="mb-0">
                Enter your valid credentials to get started.
              </p>
            </div>

            <div className="container-fluid p-4">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div className="mb-3 d-flex gap-3 justify-content-center">
              <button
                className="text-button border fw-bold"
                style={{ cursor: "pointer" }}
                onClick={handleLogin}
                data-bs-dismiss="modal"
              >
                Submit
              </button>
              <button
                className="text-button border fw-bold"
                style={{ cursor: "pointer" }}
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>

            <p
              className="fw-bold text-center mb-3"
              onClick={handleForgot}
              data-bs-toggle="modal"
            >
              Forgot Password?
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
