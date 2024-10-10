import React, { useState, useRef } from "react";
import "./forgotPassword.css";
import Navbar from "../../components/Navbar/NavigationBar.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { Form, Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

import { route } from "../../utils/route.js";

const ForgotPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const appURL = import.meta.env.VITE_APP_URL;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfPasswordVisibility = () => {
    setShowConfPassword(!showConfPassword);
  };

  const handleNext = async () => {
    if (step === 1) {
      // Handle forgot password
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
      } else {
        setMessage("OTP sent to your email.");
        setStep(2);
      }
    } else if (step === 2) {
      // Handle verify OTP
      const response = await fetch(`${appURL}/${route.system.otp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (data.error) {
        setMessage(data.message);
      } else {
        setMessage("OTP verified. Please enter your new password.");
        setStep(3);
      }
    } else if (step === 3) {
      // Handle reset password
      const response = await fetch(`${appURL}/${route.system.reset}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, password, confirmPassword }),
      });
      const data = await response.json();
      if (data.error) {
        setMessage(data.message);
      } else {
        setMessage("Password has been reset successfully.");
      }
    }
  };

  return (
    <>
      <div className="backgroundImg">
        <Navbar />
        <div className="flex-container">
          <div className="logoContainer">
            <h1>iKalinga</h1>
            <h3>Rehabilitation in your hands.</h3>
            <p>
              Skilled doctors, efficient scheduling, and telerehabilitation.
              <br /> All-in-one go with iKalinga.
            </p>
          </div>

          <Container fluid className="forgotPasswordContainer">
            {message && (
              <Row>
                <Col>
                  <div className="alert alert-info">{message}</div>
                </Col>
              </Row>
            )}
            {step === 1 && (
              <Form className="forgotPasswordForm">
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label className="forgotPasswordLabel">
                        Forgot Password?
                      </Form.Label>
                      <br />
                      <Form.Text className="text-muted d-block">
                        Enter your valid email address to receive OTP.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="input">
                  <Row className="form-row">
                    <Col>
                      <Form.Group controlId="forEmail">
                        <Form.Control
                          className="inputField"
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Row className="form-row">
                  <Col>
                    <Button className="nextBtn" onClick={handleNext}>
                      SUBMIT
                    </Button>
                  </Col>
                </Row>
                <div className="link-group">
                  <Row>
                    <Col className="text-center">
                      <Link to="/login" className="loginLink">
                        I want to login
                      </Link>
                    </Col>
                  </Row>
                </div>
              </Form>
            )}

            {step === 2 && (
              <Form className="forgotPasswordForm">
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label className="forgotPasswordLabel">
                        Forgot Password?
                      </Form.Label>
                      <br />
                      <Form.Text className="text-muted d-block">
                        Your OTP is valid for 3 minutes.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="input">
                  <Row className="form-row">
                    <Col>
                      <Form.Group controlId="forOtp">
                        <Form.Control
                          className="inputField"
                          type="number"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Row className="form-row">
                  <Col>
                    <Button className="nextBtn" onClick={handleNext}>
                      SUBMIT
                    </Button>
                  </Col>
                </Row>
                <div className="link-group">
                  <Row>
                    <Col className="text-center">
                      <Link to="/login" className="loginLink">
                        I want to login
                      </Link>
                    </Col>
                  </Row>
                </div>
              </Form>
            )}

            {step === 3 && (
              <Form className="forgotPasswordForm">
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label className="forgotPasswordLabel">
                        New Password
                      </Form.Label>
                      <br />
                      <Form.Text className="text-muted d-block">
                        Type your new password.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="input">
                  <Row className="form-row">
                    <Col>
                      <Form.Group controlId="forPassword">
                        <div className="password-container">
                          <Form.Control
                            className="inputField"
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <i
                            onClick={togglePasswordVisibility}
                            className="password-toggle-icon"
                          >
                            {showPassword ? <EyeSlashFill /> : <EyeFill />}
                          </i>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Group controlId="forConfPassword">
                        <div className="password-container">
                          <Form.Control
                            className="inputField"
                            type={showConfPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <i
                            onClick={toggleConfPasswordVisibility}
                            className="password-toggle-icon"
                          >
                            {showConfPassword ? <EyeSlashFill /> : <EyeFill />}
                          </i>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Row className="form-row">
                  <Col>
                    <Button className="nextBtn" onClick={handleNext}>
                      SUBMIT
                    </Button>
                  </Col>
                </Row>
                <div className="link-group">
                  <Row>
                    <Col className="text-center">
                      <Link to="/login" className="loginLink">
                        I want to login
                      </Link>
                    </Col>
                  </Row>
                </div>
              </Form>
            )}
          </Container>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ForgotPassword;
