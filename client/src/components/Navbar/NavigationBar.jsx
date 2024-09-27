import React from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { Col, Row } from "react-bootstrap";
import "./navbar.css";

const NavigationBar = () => {
  return (
    <Navbar className="nav">
      <Container>
        <Row>
          <Col className="text-column">
            <Navbar.Brand className="navText">TalkTherapy</Navbar.Brand>
            <Navbar.Brand className="navTextBot">
              Rehabilitation in your hands.
            </Navbar.Brand>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
