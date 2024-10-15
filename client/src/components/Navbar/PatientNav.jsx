import Logout from "../../assets/buttons/Logout"
import { Row } from "react-bootstrap"

export default function PatientNav({data}) {
  return (
    <Row
    lg
    md
    className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-between align-items-center flex-wrap"
  >
    <div className="w-75">
      <p className="m-0">Hello,</p>
      <p className="m-0 fw-bold">{data || "Admin"}</p>
    </div>

    <div className="d-block d-lg-none w-25 d-flex justify-content-end">
      <Logout />
    </div>
  </Row>
  )
}
