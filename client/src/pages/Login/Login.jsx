import { useState, useContext } from "react";
import "./login.css";
import Navbar from "../../components/Navbar/NavigationBar.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { Form, Container, Row, Col, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import axios from "axios";
import { Slide, toast } from "react-toastify";
import { toastMessage } from "../../utils/toastHandler.js";

import { AuthContext } from "../../utils/AuthContext.jsx";

// Modal
import ChooseRegister from "../../components/Modals/ChooseRegister.jsx";

// Utils
import { route } from "../../utils/route.js";

const appURL = import.meta.env.VITE_APP_URL;

const Login = () => {
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

  // Handle Choose Register
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="backgroundImg">
        <Navbar />
        <div className="flex-container">
          <div className="logoContainer">
            <h1>TalkTherapy</h1>
            <h3>Rehabilitation in your hands.</h3>
            <p>
              Skilled doctors, efficient scheduling, and telerehabilitation.
              <br /> All-in-one go with TalkTherapy.
            </p>
          </div>
          <Container fluid className="loginContainer">
            <Form className="loginForm" onSubmit={(e) => handleLogin(e)}>
              <Row className="form-row">
                <Col>
                  <Form.Group>
                    <Form.Label className="helloLabel">
                      Hello, there!
                    </Form.Label>
                    <br />
                    <Form.Text className="text-muted d-block">
                      Enter your valid credentials to get started.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              {error && (
                <Row className="form-row mt-3">
                  <Col>
                    <Alert variant="danger">{error}</Alert>
                  </Col>
                </Row>
              )}
              <div className="input">
                <Row className="form-row">
                  <Col>
                    <Form.Group controlId="forEmail">
                      <Form.Control
                        className="emailInput"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="form-row">
                  <Col>
                    <Form.Group controlId="forPassword">
                      <div className="password-container">
                        <Form.Control
                          className="passwordInput"
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        {showPassword ? (
                          <EyeSlashFill
                            className="password-toggle"
                            onClick={handleTogglePassword}
                          />
                        ) : (
                          <EyeFill
                            className="password-toggle"
                            onClick={handleTogglePassword}
                          />
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              <Row className="form-row">
                <Col>
                  <Button className="loginBtn" type="submit">
                    LOGIN
                  </Button>
                </Col>
              </Row>
              <div className="link-group">
                <Row>
                  <Col className="text-center">
                    {isOpen && <ChooseRegister openModal={openModal} />}

                    <p
                      type="button"
                      className="fw-bold mb-0"
                      style={{ cursor: "pointer" }}
                      onClick={openModal}
                    >
                      Register
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col className="text-center">
                    <Link to="/forgot" className="forgotPassLink">
                      Forgot Password?
                    </Link>
                  </Col>
                </Row>
              </div>
            </Form>
          </Container>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Login;
