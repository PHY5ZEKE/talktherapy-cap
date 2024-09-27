import React from "react";
import "./footer.css";
import Container from "react-bootstrap/Container";
import { Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col className="text-center">
            <p className="footerText">iKalinga</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
