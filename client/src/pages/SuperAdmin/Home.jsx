import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";

// CSS
import "./home.css";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";

// Icons
import Delete from "../../assets/icons/Delete";
import Edit from "../../assets/icons/Edit";
import Search from "../../assets/icons/Search";
import Calendar from "../../assets/icons/Calendar";
// import { set } from "react-datepicker/dist/date_utils";

import EditProfile from "../../components/Modals/EditProfile";

export default function Home() {
  // Get Super Admin and Admins
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [superAdmin, setSuperAdmin] = useState(null);
  const [error, setError] = useState(null);

  const [userDetails, setUserDetails] = useState(null);
  const [editProfileAPI, setEditProfileAPI] = useState("");
  const [updateProfilePictureAPI, setUpdateProfilePictureAPI] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const handleModal = (user) => {
    setIsOpen(!isOpen);
    setUserDetails(user);
    setEditProfileAPI('super-admin/edit-admin')
  };

  //Super Admin
  useEffect(() => {
    const fetchSuperAdmin = async () => {
      const token = localStorage.getItem("accessToken"); // Retrieve the token from localStorage

      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8000/super-admin/get-super-admin", // Ensure this URL is correct
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  useEffect(() => {
    const fetchAdmins = async () => {
      const token = localStorage.getItem("accessToken"); // Retrieve token from local storage
      try {
        const response = await axios.get(
          "http://localhost:8000/super-admin/getAllAdmins",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdmins(response.data.admins);
      } catch (err) {
        setError("An error occurred while retrieving admins.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* EDIT MODAL */}
        {isOpen && (
          <EditProfile
            editProfileAPI={editProfileAPI}
            editPictureAPI={updateProfilePictureAPI}
            userDetails={userDetails}
            closeModal={handleModal}
            isOwner={false}
            whatRole={'superAdmin'}
          />
        )}

        {/* CONTENT */}
        <Col
          xs={{ order: 12 }}
          lg={{ order: 1 }}
          className="d-flex flex-column stretch-flex"
        >
          {/* USER TOP BAR */}
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

          <Row lg md>
            {/* CONTENT USER LIST */}
            <Col lg className="height-responsive d-none d-lg-block">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Admins</h4>
              </div>

              <div className="card-container d-flex flex-column gap-2">
                <div className="search-bar d-flex align-content-center gap-2">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search for Admins"
                    className="search-input"
                  />
                </div>

                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}

                <div className="scrollable-div d-flex flex-column gap-3">
                  {admins.map((admin) => (
                    
                    <div key={admin._id} className="card-content-bg-dark p-3">
                      <div className="d-flex flex-column g-1 mb-2">
                        <p className="fw-bold mb-0">
                          {admin.firstName} {admin.lastName}
                        </p>
                        <p className="mb-0">{admin.email}</p>
                        <p className="mb-0">{admin.address}</p>
                        <p className="mb-0">{admin.mobile}</p>
                      </div>

                      <div className="button-group d-flex justify-content-center flex-row gap-2 bg-white">
                        <button className="icon-btn" onClick={()=>{handleModal(admin)}}>
                          <Edit />
                        </button>
                        <Delete />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* NOTIFICATION */}
            <Col lg className="height-responsive">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Notifications</h4>
              </div>
              {/* DATE COMPONENT */}
              <div className="card-content-bg-light p-3">
                <div className="container text-center">
                  <div className="row">
                    <div className="col">
                      <div className="row">
                        <p className="mb-0">July</p>
                        <p className="mb-0">Today is Friday, July 5, 2024</p>
                      </div>
                    </div>

                    <div className="col">
                      <Calendar />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-container d-flex flex-column gap-2 scrollable-div-2 notif-home">
                {/* NOTIFICATION COMPONENT */}
                <div className="card-content-bg-dark p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">July 5, 2024</p>
                    <p className="mb-0">7:31 PM</p>
                    <p className="mb-0">
                      Session of Dr. Reyes with Nicole Oraya has started.
                    </p>
                  </div>

                  <div className="button-group bg-white">
                    <p className="fw-bold my-0 status">ON-GOING</p>
                  </div>
                </div>

                {/* NOTIFICATION COMPONENT */}
                <div className="card-content-bg-dark p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">July 5, 2024</p>
                    <p className="mb-0">7:31 PM</p>
                    <p className="mb-0">
                      Session of Dr. Reyes with Nicole Oraya has started.
                    </p>
                  </div>

                  <div className="button-group bg-white">
                    <p className="fw-bold my-0 status">ON-GOING</p>
                  </div>
                </div>

                {/* NOTIFICATION COMPONENT */}
                <div className="card-content-bg-dark p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">July 5, 2024</p>
                    <p className="mb-0">7:31 PM</p>
                    <p className="mb-0">
                      Session of Dr. Reyes with Nicole Oraya has started.
                    </p>
                  </div>

                  <div className="button-group bg-white">
                    <p className="fw-bold my-0 status">ON-GOING</p>
                  </div>
                </div>

                {/* NOTIFICATION COMPONENT */}
                <div className="card-content-bg-dark p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">July 5, 2024</p>
                    <p className="mb-0">7:31 PM</p>
                    <p className="mb-0">
                      Session of Dr. Reyes with Nicole Oraya has started.
                    </p>
                  </div>

                  <div className="button-group bg-white">
                    <p className="fw-bold my-0 status">ON-GOING</p>
                  </div>
                </div>

                {/* NOTIFICATION COMPONENT */}
                <div className="card-content-bg-dark p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">July 5, 2024</p>
                    <p className="mb-0">7:31 PM</p>
                    <p className="mb-0">
                      Session of Dr. Reyes with Nicole Oraya has started.
                    </p>
                  </div>

                  <div className="button-group bg-white">
                    <p className="fw-bold my-0 status">ON-GOING</p>
                  </div>
                </div>

                {/* NOTIFICATION COMPONENT */}
                <div className="card-content-bg-dark p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">July 5, 2024</p>
                    <p className="mb-0">7:31 PM</p>
                    <p className="mb-0">
                      Session of Dr. Reyes with Nicole Oraya has started.
                    </p>
                  </div>

                  <div className="button-group bg-white">
                    <p className="fw-bold my-0 status">ON-GOING</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
