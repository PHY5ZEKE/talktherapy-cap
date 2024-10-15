import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import React, { useState, useEffect } from "react";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import EditProfile from "../../components/Modals/EditProfile";
import ChangePassword from "../../components/Modals/ChangePassword";
import MenuDropdown from "../../components/Layout/MenuDropdown";

// Utils
import { route } from "../../utils/route";

export default function Profile() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const fetchPatientData = async () => {
    const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

    try {
      const response = await fetch(`${appURL}/${route.patient.fetch}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patient data");
      }

      const data = await response.json();
      setPatientData(data.patient);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  return (
    <>
      {/* EDIT MODAL */}
      {isOpen && (
        <EditProfile
          editProfileAPI={route.patient.edit}
          editPictureAPI={route.patient.picture}
          userDetails={patientData}
          closeModal={handleModal}
          isOwner={true}
          whatRole={"patient"}
          onProfileUpdate={fetchPatientData} // Pass the callback function
        />
      )}

      {/* CHANGE PASS MODAL */}
      {isPasswordModalOpen && (
        <ChangePassword
          editPasswordAPI={route.patient.password}
          closeModal={handlePasswordModal}
        />
      )}

      <div className="container-fluid p-0 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                <p className="mb-0 mt-3">Hello,</p>
                <p className="fw-bold">Admin</p>
              </div>

              <MenuDropdown />
            </div>

            <div className="row h-100">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Your Profile</p>
                    <p className="mb-0">Make changes to your profile.</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3 overflow-auto">
                    <div className="card">
                      <img
                        src={patientData?.profilePicture}
                        className="card-img-top"
                        alt="Profile picture"
                        style={{maxHeight:"320px", objectFit:"cover"}}
                      />
                      <div className="card-body">
                        <h5 className="">
                          {patientData?.firstName} {patientData?.middleName}{" "}
                          {patientData?.lastName}
                        </h5>
                        <p className="mb-0">{patientData?.diagnosis}</p>
                        <p className="mb-0">{patientData?.birthday}</p>
                        <p className="mb-0">{patientData?.mobile}</p>
                        <p className="mb-0">{patientData?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Actions</p>
                    <p className="mb-0">Perform account changes.</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <div
                        className="mb-3 fw-bold text-button border w-100"
                        onClick={handleModal}
                      >
                        Edit Profile
                      </div>
                    </div>

                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <div
                        className="mb-3 fw-bold text-button border w-100"
                        onClick={handlePasswordModal}
                      >
                        Change Password
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* THIRD COL */}
              <div className="col-sm bg-white"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
