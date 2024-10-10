import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";

// Icons
import Sort from "../../assets/icons/Sort";
import Edit from "../../assets/icons/Edit";
import Delete from "../../assets/icons/Delete";

export default function ManageAdmin() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [superAdmin, setSuperAdmin] = useState(null);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  //Super Admin
  useEffect(() => {
    const fetchSuperAdmin = async () => {
      const token = localStorage.getItem("accessToken"); // Retrieve the token from localStorage

      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      try {
        const response = await fetch(`${appURL}/${route.sudo.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSuperAdmin(data.superAdmin);
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

    fetchSuperAdmin();
  }, []);

  // Fetch all admins from the backend
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch(`${appURL}/${route.sudo.getAllAdmins}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Assuming token is stored in localStorage
          },
        });
        const data = await response.json();

        if (!data.error) {
          setAdmins(data.admins);
        } else {
          console.error("Failed to fetch admins:", data.message);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    fetchAdmins();
  }, []);

  // Function to fetch selected admin's details from the backend
  const fetchAdminDetails = async (adminId) => {
    setIsLoading(true); // Start loading

    try {
      const response = await fetch(
        `${appURL}/${route.sudo.getAdminById}${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = await response.json();

      if (!data.error) {
        setSelectedAdmin(data.admin); // Set the selected admin details
      } else {
        console.error("Failed to fetch admin details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Handle admin click: fetch admin details and set it to state
  const handleAdminClick = (admin) => {
    fetchAdminDetails(admin._id); // Fetch the selected admin's details
  };

  // Function to toggle activation status
  const toggleAdminStatus = async () => {
    if (!selectedAdmin) return;

    setIsProcessing(true); // Start processing

    try {
      const url = selectedAdmin.active
        ? `${appURL}/${route.admin.removeAdmin}`
        : `${appURL}/${route.admin.activateAdmin}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ email: selectedAdmin.email }), // Automatically pass the selected admin's email
      });

      const data = await response.json();

      if (!data.error) {
        // Update the selectedAdmin's status in the frontend
        setSelectedAdmin({
          ...selectedAdmin,
          active: !selectedAdmin.active,
        });

        // Optionally, update the admins list to reflect the change
        setAdmins(
          admins.map((admin) =>
            admin._id === selectedAdmin._id
              ? { ...admin, active: !selectedAdmin.active }
              : admin
          )
        );
      } else {
        console.error("Failed to toggle admin status:", data.message);
      }
    } catch (error) {
      console.error("Error toggling admin status:", error);
    } finally {
      setIsProcessing(false); // Stop processing
    }
  };

  return (
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* CONTENT */}
        <Col
          xs={{ order: 12 }}
          lg={{ order: 1 }}
          className="d-flex flex-column stretch-stretch"
        >
          {/* TOP BAR */}
          <Row
            lg
            md
            className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-center align-items-center"
          >
            <div>
              {error && <p className="error">{error}</p>}
              {superAdmin ? (
                <p className="m-0 fw-bold">
                  Hello, {superAdmin.firstName} {superAdmin.lastName}
                </p>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </Row>

          {/* TOTAL ADMINS */}
          <Row
            lg
            md
            className="total-admin border border-1 my-3 border-[#B9B9B9] card-content-bg-light p-3 d-flex justify-content-center align-items-center mx-auto"
          >
            <div className="admin-left d-flex justify-content-between">
              <div className="admin-child d-flex gap-3">
                <div className="d-none d-lg-block">
                  <p className="m-0">{admins.length}</p>
                  <p className="m-0 fw-bold">Total Admins</p>
                </div>
                <a href="/sudo/register">
                  <button className="action-btn">Register Admin</button>
                </a>
              </div>

              <Sort />
            </div>
          </Row>

          <Row lg md>
            {/* ADMIN LIST */}
            <Col lg className="height-responsive">
              <div className="card-container d-flex flex-column gap-2 scrollable-div notif-home">
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="card-content-bg-dark p-3"
                    onClick={() => handleAdminClick(admin)} // Handle admin selection
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex flex-column g-1 mb-2">
                      <p className="fw-bold mb-0">
                        {admin.firstName} {admin.middleName} {admin.lastName}
                      </p>
                      <p className="mb-0">{admin.clinicAddress}</p>
                      <p className="mb-0">{admin.contactNumber}</p>
                      <p className="mb-0">{admin.email}</p>
                    </div>

                    <div className="button-group d-flex justify-content-center flex-row gap-2 bg-white">
                      <Edit />
                      <Delete />
                    </div>
                  </div>
                ))}
              </div>
            </Col>
            {/* PROFILE PREVIEW */}
            <Col lg className="height-responsive">
              {isLoading ? (
                <p>Loading...</p>
              ) : selectedAdmin ? (
                <div className="card-container d-flex flex-column gap-2 scrollable-div notif-home">
                  <div className="p-3">
                    <div className="profile-img">
                      <img src={selectedAdmin.profilePicture} alt="Profile" />
                    </div>
                  </div>

                  <div className="d-flex flex-column g-1 mb-2 mx-3">
                    <h3 className="fw-bold mb-0">
                      {selectedAdmin.firstName} {selectedAdmin.middleName}{" "}
                      {selectedAdmin.lastName}
                    </h3>
                    <p className="mb-0">Admin</p>
                    <p className="mb-0">{selectedAdmin.address}</p>
                    <p className="mb-0">{selectedAdmin.mobile}</p>
                    <p className="mb-0">{selectedAdmin.email}</p>

                    {/* Dynamic Activate/Deactivate button */}
                    <button
                      className="action-btn btn-text-blue my-2"
                      onClick={toggleAdminStatus}
                      disabled={isProcessing} // Disable button while processing
                    >
                      {selectedAdmin.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ) : (
                <p>Select an admin to view their profile</p>
              )}
            </Col>

            <Col lg></Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
