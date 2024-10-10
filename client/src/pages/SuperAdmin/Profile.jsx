import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Sidebar from "../../components/Sidebar/SidebarSuper";
import EditProfile from "../../components/Modals/EditProfile";
import ChangePassword from "../../components/Modals/ChangePassword";

// utils
import { route } from "../../utils/route";

export default function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  const [isOpen, setIsOpen] = useState(false);
  const handleModal = () => {
    setIsOpen(!isOpen);
  };

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const handlePasswordModal = () => {
    setIsPasswordModalOpen(!isPasswordModalOpen);
  };

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    const endpoint = `${appURL}/${route.sudo.fetch}`;
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

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* EDIT MODAL */}
        {isOpen && (
          <EditProfile
            editProfileAPI={route.sudo.edit}
            editPictureAPI={route.sudo.picture}
            userDetails={userDetails}
            closeModal={handleModal}
            isOwner={true}
            onProfileUpdate={fetchUserDetails}
          />
        )}

        {/* CHANGE PASS MODAL */}
        {isPasswordModalOpen && (
          <ChangePassword
            editPasswordAPI={route.sudo.password}
            closeModal={handlePasswordModal}
          />
        )}

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
                <button className="action-btn" onClick={handlePasswordModal}>
                  Change Password
                </button>
              </div>
            </Col>

            <Col lg></Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
