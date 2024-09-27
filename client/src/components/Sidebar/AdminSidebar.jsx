import Col from "react-bootstrap/Col";

// CSS
import "./sidebar.css";

// Icons
import Home from "../../assets/buttons/Home";
import Clinicians from "../../assets/buttons/Clinicians";
import Users from "../../assets/buttons/Users";
import Calendar from "../../assets/buttons/Calendar";
import Settings from "../../assets/buttons/Settings";
import Logout from "../../assets/buttons/Logout";
import Content from "../../assets/buttons/Content";

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
          <p className="d-none d-lg-block text-primary fw-bolder my-0">
            iKalinga
          </p>
        </div>
        <Home />
        <Clinicians />
        <Users />
        <Content />
        <Calendar />
        <Settings />
        <div className="d-lg-none">
          <Logout />
        </div>
      </div>

      <div className="d-none d-lg-block">
        <Logout />
      </div>
    </Col>
  );
}
