import Col from "react-bootstrap/Col";

// CSS
import "./sidebar.css";
import "../../styles/containers.css";
import "../../styles/text.css";
import "../../styles/button.css";
import "../../styles/images.css";
import "../../assets/buttons/action-btn.css";
import "../../assets/buttons/icon-btn.css";
import "../../assets/icons/icon-display.css";

// Icons
import Notepad from '../../assets/buttons/Notepad'
import Settings from "../../assets/buttons/Settings";
import Logout from "../../assets/buttons/Logout";
import Content from "../../assets/buttons/Content";
import Calendar from "../../assets/buttons/Calendar";
import Home from "../../assets/buttons/Home";

export default function Sidebar() {
  return (
    <Col
      xs={{ order: 1 }}
      lg={{ order: 1, span: 1 }}
      className="border justify-content-center border-1 border-[#B9B9B9] sidebar d-flex flex-column
      justify-content-lg-between align-items-center p-2 height-responsive"
    >
      <div className="d-flex flex-lg-column align-items-center gap-3 flex-sm-row">
        <div className="d-flex flex-lg-column text-center mt-3">
          <a href="/patientHome">
            <p className="d-none d-lg-block text-primary fw-bolder my-0">
              TALK
            </p>
            <p className="d-none d-lg-block text-primary fw-bolder my-0">
              THERAPY
            </p>
          </a>
        </div>
        <a href="/patientHome">
          <Home />
        </a>
        <a href="/patientFeedbacks">
          <Notepad />
        </a>
        <a href="/patientContent">
          <Content />
        </a>
        <a href="/patientBook">
          <Calendar />
        </a>
        <a href="/patientProfile">
          <Settings />
        </a>
      </div>

      <div className="d-none d-lg-block">
        <Logout />
      </div>
    </Col>
  );
}
