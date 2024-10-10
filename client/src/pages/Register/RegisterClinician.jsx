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
  Upload,
} from "react-bootstrap-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { route } from "../../utils/route";

const RegisterClinician = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState(""); // State for specialization
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confPassword: "",
    mobile: "",
    birthday: "",
    gender: "",
    adrress: "",
    specialization: "",
  });

  const datePickerRef = useRef(null);
  const appURL = import.meta.env.VITE_APP_URL;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfPasswordVisibility = () => {
    setShowConfPassword(!showConfPassword);
  };

  const handleNext = () => {
    if (step === 3) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleIconClick = () => {
    datePickerRef.current.setFocus();
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value); // Update the state with the selected gender
    setFormData({ ...formData, gender: event.target.value });
  };

  const handleSpecializationChange = (event) => {
    setSelectedSpecialization(event.target.value); // Update the state with the selected specialization
    setFormData({ ...formData, specialization: event.target.value });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${appURL}/${route.clinician.signup}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          birthday: selectedDate,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.message);
      } else {
        alert("Registration Successful");
        history.push("/login");
      }
    } catch (error) {
      console.error("Error registering clinician:", error);
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
              <Form className="registerForm">
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
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">Middle Name</Form.Label>
                      <Form.Group controlId="forMiddleName">
                        <Form.Control
                          className="inputField"
                          type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
              <Form className="registerForm">
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
                          onChange={handleInputChange}
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
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
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
                      <Form.Label className="formLabel">Gender</Form.Label>
                      <Form.Group controlId="forGender">
                        <Form.Control
                          as="select"
                          className="inputField"
                          value={selectedGender}
                          onChange={handleGenderChange}
                        >
                          <option value=""></option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Others">Others</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Row className="form-row">
                  <Col>
                    <Button className="nextBtn" onClick={handleNext}>
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

            {step === 3 && (
              <Form className="registerForm">
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
                        Specialization
                      </Form.Label>
                      <Form.Group controlId="forSpecialization">
                        <Form.Control
                          as="select"
                          className="inputField"
                          value={selectedSpecialization}
                          onChange={handleSpecializationChange}
                        >
                          <option value=""></option>
                          <option value="Aphasia">Aphasia</option>
                          <option value="Stroke">Stroke</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="form-row">
                    <Col>
                      <Form.Label className="formLabel">
                        Clinic Address
                      </Form.Label>
                      <Form.Group controlId="foradrress">
                        <Form.Control
                          className="inputField"
                          type="text"
                          name="adrress"
                          value={formData.adrress}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Row className="form-row">
                  <Col>
                    <Button className="submitBtn" onClick={handleNext}>
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

export default RegisterClinician;
