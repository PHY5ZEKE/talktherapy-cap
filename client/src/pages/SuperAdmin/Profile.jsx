import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Sidebar from "../../components/Sidebar/SidebarSuper";
import EditProfile from "../../components/Modals/EditProfile";
import ChangePassword from "../../components/Modals/ChangePassword";

export default function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const handleModal = () => {
    setIsOpen(!isOpen);
  };

  const [editProfileAPI, setEditProfileAPI] = useState("");
  const [updateProfilePictureAPI, setUpdateProfilePictureAPI] = useState("");
  const [getUserAPI, setGetUserAPI] = useState("");

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const handlePasswordModal = () => {
    setIsPasswordModalOpen(!isPasswordModalOpen);
    console.log(isPasswordModalOpen);
  };

  // Set API Endpoints
  useEffect(() => {
    setEditProfileAPI("super-admin/edit-super-admin");
    setUpdateProfilePictureAPI("super-admin/update-profile-picture");
    setGetUserAPI("super-admin/get-super-admin");
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      const endpoint = `http://localhost:8000/${getUserAPI}`;
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserDetails(data.superAdmin);
        } else if (response.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch super admin data:", errorText);
          setError("Failed to fetch super admin data");
        }
      } catch (error) {
        console.error("Error fetching super admin data:", error);
        setError("Error fetching super admin data");
      }
    };

    fetchUserDetails();
  }, [getUserAPI]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid>
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* EDIT MODAL */}
        {isOpen && (
          <EditProfile
            editProfileAPI={editProfileAPI}
            editPictureAPI={updateProfilePictureAPI}
            userDetails={userDetails}
            closeModal={handleModal}
            isOwner={true}
          />
        )}

        {/* CHANGE PASS MODAL */}
        {isPasswordModalOpen && <ChangePassword editPasswordAPI={`super-admin/change-password`} closeModal={handlePasswordModal} />}

        <Col xs={{ order: 12 }} lg={{ order: 1 }}>
          <Row className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-center align-items-center">
            <div>
              <p className="m-0">Hello,</p>
              <p className="m-0 fw-bold">
                {userDetails.firstName} {userDetails.middleName}{" "}
                {userDetails.lastName}
              </p>
            </div>
          </Row>
          {/* MAIN CONTENT */}
          <Row>
            {/* YOUR PROFILE */}
            <Col lg className="height-responsive full-height">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Your Profile</h4>
              </div>

              <div className="card-container d-flex flex-column gap-2 notif-home">
                {/* IMAGE COMPONENT */}
                <div className="p-3">
                  <div className="profile-img">
                    <img src={userDetails.profilePicture} alt="Profile" />
                  </div>
                </div>

                {/* PROFILE DETAILS */}
                <div className="d-flex flex-column g-1 mb-2 mx-3">
                  <h3 className="fw-bold mb-0">
                    {" "}
                    {userDetails.firstName} {userDetails.lastName}
                  </h3>
                  <p className="mb-0">{userDetails.address} </p>
                  <p className="mb-0">{userDetails.mobile}</p>
                  <p className="mb-0">{userDetails.email}</p>
                </div>
              </div>
            </Col>

            {/* ACTIONS */}
            <Col lg className="height-responsive">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Actions</h4>
              </div>

              <div className="card-container d-flex justify-content-center align-items-center flex-column gap-2 scrollable-div notif-home">
                {/* BUTTONS */}
                <a href="/sudo/users">
                  <button className="action-btn">Manage Admins</button>
                </a>

                <a href="/sudo/audit">
                  <button className="action-btn">Audit Logs</button>
                </a>
                <a href="/sudo/archival">
                  <button className="action-btn">Archival</button>
                </a>
                <button className="action-btn" onClick={handleModal}>
                  Edit Profile
                </button>
                <button
                  className="action-btn"
                  onClick={handlePasswordModal}
                >
                  Change Password
                </button>
              </div>
            </Col>

            <Col lg></Col>
          </Row>
        </Col>
      </Row>
      {/* CHANGE PASSWORD MODAL */}
      {/* <Modal
        show={showPasswordModal}
        onHide={handleClosePasswordModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleChangePasswordSubmit}>
            <div className="form-group">
              <p className="mb-0">Current Password</p>
              <div className="input-group">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  name="currentPassword"
                  onChange={handlePasswordChange}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <p className="mb-0">New Password</p>
              <div className="input-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  name="newPassword"
                  onChange={handlePasswordChange}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <p className="mb-0">Confirm New Password</p>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  name="confirmPassword"
                  onChange={handlePasswordChange}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="action-btn btn-text-blue btn-primary mt-3"
            >
              Save
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePasswordModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal> */}
    </Container>
  );
}
