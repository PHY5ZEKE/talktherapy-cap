import { useState } from "react";
import "./register.css";
import Navbar from "../../components/Navbar/NavigationBar.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { Form, Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import { route } from "../../utils/route.js";

const RegisterAdmin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
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

    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      confirmPassword,
      address,
      mobile,
    } = formData;

    if (password !== confirmPassword) {
      setError(true);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${appURL}/${route.admin.signup}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          email,
          password,
          address,
          mobile,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(true);
        setMessage(data.message);
      } else {
        setError(false);
        setMessage(data.message);
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          address: "",
          mobile: "",
        }); // Clear the form on success
      }
    } catch (err) {
      setError(true);
      setMessage("An error occurred. Please try again.");
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
            <Form className="registerForm" onSubmit={handleSubmit}>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label className="registerLabel">Register</Form.Label>
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
                    <Form.Label className="formLabel">Middle Name</Form.Label>
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
                    <Form.Label className="formLabel">
                      Clinic Address
                    </Form.Label>
                    <Form.Group controlId="foraddress">
                      <Form.Control
                        className="inputField"
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="form-row">
                  <Col>
                    <Form.Label className="formLabel">
                      Contact Number
                    </Form.Label>
                    <Form.Group controlId="formobile">
                      <Form.Control
                        className="inputField"
                        type="text"
                        name="mobile"
                        value={formData.mobile}
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
                          name="confirmPassword"
                          value={formData.confirmPassword}
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
          </Container>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default RegisterAdmin;
