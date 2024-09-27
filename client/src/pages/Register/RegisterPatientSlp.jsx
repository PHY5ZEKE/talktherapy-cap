import React, { useState, useRef } from "react";
import "./register.css";
import Navbar from "../../components/Navbar/NavigationBar.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { Form, Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  EyeFill,
  EyeSlashFill,
  Calendar2DateFill,
} from "react-bootstrap-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RegisterPatientSlp = () => {
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
      const response = await fetch(
        "http://localhost:8000/patient-SLP/slp-patient-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        }
      );

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

          <Container fluid className="registerContainer">
            {step === 1 && (
              <Form className="registerForm" onSubmit={handleNext}>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label className="registerLabel">
                        Register
                      </Form.Label>
                      <br />
                      <Form.Text className="text-muted d-block">
                        Please fill out all required fields.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="input">
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">First Name</Form.Label>
                      <Form.Group controlId="forFirstName">
                        <Form.Control
                          className="inputField"
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">Midlle Name</Form.Label>
                      <Form.Group controlId="forMiddleName">
                        <Form.Control
                          className="inputField"
                          type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">Last Name</Form.Label>
                      <Form.Group controlId="forLastName">
                        <Form.Control
                          className="inputField"
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">Email</Form.Label>
                      <Form.Group controlId="forEmail">
                        <Form.Control
                          className="inputField"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">Password</Form.Label>
                      <Form.Group controlId="forPassword">
                        <div className="password-container">
                          <Form.Control
                            className="inputField"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
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
                      <Form.Label className="formLabel">
                        Confirm Password
                      </Form.Label>
                      <Form.Group controlId="forConfPassword">
                        <div className="password-container">
                          <Form.Control
                            className="inputField"
                            type={showConfPassword ? "text" : "password"}
                            name="confPassword"
                            value={formData.confPassword}
                            onChange={handleChange}
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
                    <Button
                      className="nextBtn"
                      type="button"
                      onClick={handleNext}
                    >
                      NEXT
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
              <Form className="registerForm" onSubmit={handleSubmit}>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label className="registerLabel">
                        Register
                      </Form.Label>
                      <br />
                      <Form.Text className="text-muted d-block">
                        Please fill out all required fields.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="input">
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">
                        Phone Number
                      </Form.Label>
                      <Form.Group controlId="forPhoneNumber">
                        <Form.Control
                          className="inputField"
                          type="tel"
                          placeholder="+63"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">
                        Date of Birth
                      </Form.Label>
                      <Form.Group controlId="forDateOfBirth">
                        <div className="date-picker-container">
                          <i
                            className="calendar-icon"
                            onClick={handleIconClick}
                          >
                            <Calendar2DateFill />
                          </i>
                          <DatePicker
                            ref={datePickerRef}
                            selected={formData.birthday}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            scrollableYearDropdown
                            className="birthInput"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">
                        Medical Diagnosis
                      </Form.Label>
                      <Form.Group controlId="forDiagnosis">
                        <Form.Control
                          as="select"
                          className="inputField"
                          name="diagnosis"
                          value={formData.diagnosis}
                          onChange={handleChange}
                        >
                          <option value="">Select Diagnosis</option>
                          <option value="Diagnosis1">Diagnosis 1</option>
                          <option value="Diagnosis2">Diagnosis 2</option>
                          <option value="Diagnosis3">Diagnosis 3</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">Consent</Form.Label>
                      <Form.Group controlId="forConsent">
                        <div className="radio-container">
                          <Form.Check
                            type="radio"
                            label="Yes"
                            name="consent"
                            value="yes"
                            checked={formData.consent === "yes"}
                            onChange={handleChange}
                          />
                          <Form.Check
                            type="radio"
                            label="No"
                            name="consent"
                            value="no"
                            checked={formData.consent === "no"}
                            onChange={handleChange}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Row className="form-row">
                  <Col>
                    <Button className="submitBtn" type="submit">
                      SUBMIT
                    </Button>
                  </Col>
                </Row>
                {message && (
                  <Row className="form-row">
                    <Col>
                      <div
                        className={`alert ${
                          error ? "alert-danger" : "alert-success"
                        }`}
                        role="alert"
                      >
                        {message}
                      </div>
                    </Col>
                  </Row>
                )}
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

export default RegisterPatientSlp;
