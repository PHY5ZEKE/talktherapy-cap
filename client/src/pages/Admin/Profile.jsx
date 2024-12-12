import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar/SidebarAdmin";
import MenuDropdown from "../../components/Layout/AdminMenu";
import EditProfile from "../../components/Modals/EditProfile";
import ChangeProfilePicture from "../../components/Modals/ChangeProfilePicture";
import ChangePassword from "../../components/Modals/ChangePassword";
import RequestView from "../../components/Modals/RequestView";

import { route } from "../../utils/route";
import { page } from "../../utils/page-route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import SocketFetch from "../../utils/SocketFetch";

export default function Profile() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const [isViewRequests, setIsViewRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const [isOpen, setIsOpen] = useState(false);
  const handleModal = () => {
    setIsOpen(!isOpen);
  };
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const handlePasswordModal = () => {
    setIsPasswordModalOpen(!isPasswordModalOpen);
  };

  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const handleProfilePictureModal = () => {
    setIsProfilePictureModalOpen(!isProfilePictureModalOpen);
  };

  // WebSocket Notification
  const socket = useRef(null);
  useEffect(() => {
    socket.current = new WebSocket(`${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("Connected to the server");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        fetchPendingRequests();
      }

      if (message.type === "fetch-action") {
        fetchAdminData();
      }
    };

    socket.current.onclose = () => {
      console.log("Disconnected from the server");
    };

    return () => {
      socket.current.close();
    };
  }, []);

  const webSocketNotification = async (message) => {
    const response = JSON.stringify(message);
    const parsed = JSON.parse(response);

    let notification = {};

    if (parsed.notif === "appointmentRequestAccess") {
      notification = {
        body: `${parsed.body}`,
        date: new Date(),
        show_to: parsed.show_to,
      };
    }

    try {
      const response = await fetch(`${appURL}/${route.notification.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      const result = await response.json();

      const resultWithNotif = { ...result, type: "notification" };

      // Notify WebSocket server
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify(resultWithNotif));
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      throw new Error("Failed to send notification", error);
    }
  };

  const webSocketFetch = () => {
    SocketFetch(socket);
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`${appURL}/${route.admin.fetch}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const data = await response.json();
      setAdminData(data.admin);
      setLoading(false);
    } catch (error) {
      failNotify(toastMessage.fail.error);
      setError(error.message);
      setLoading(false);
      throw new Error("Fetching admin data failed.", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${appURL}/${route.admin.pendingRequests}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }

      const data = await response.json();
      setPendingRequests(data.pendingRequests);
    } catch (error) {
      failNotify("Failed to fetch pending requests");
      throw new Error("Fetching pending requests failed.", error);
    }
  };

  const handleStatusChange = (requestId, status) => {
    setPendingRequests((prevRequests) =>
      prevRequests.map((request) =>
        request._id === requestId ? { ...request, status } : request
      )
    );
  };

  useEffect(() => {
    fetchAdminData();
    fetchPendingRequests();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="d-flex align-items-center justify-content-center vh-100">
  //       <div className="alert alert-danger" role="alert">
  //         {error}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      {isOpen && (
        <EditProfile
          editProfileAPI={route.admin.edit}
          editPictureAPI={route.admin.picture}
          userDetails={adminData}
          closeModal={handleModal}
          isOwner={true}
          onFetch={webSocketFetch}
        />
      )}

      {/* CHANGE PROFILE PICTURE MODAL */}
      {isProfilePictureModalOpen && (
        <ChangeProfilePicture
          editPictureAPI={route.admin.picture}
          closeModal={handleProfilePictureModal}
          onFetch={webSocketFetch}
        />
      )}

      {isPasswordModalOpen && (
        <ChangePassword
          editPasswordAPI={route.admin.password}
          closeModal={handlePasswordModal}
        />
      )}

      <div className="container-fluid p-0 vh-100 vw-100">
        <div className="d-flex flex-md-row flex-nowrap vh-100">
          <Sidebar />
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : adminData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {adminData?.firstName} {adminData?.lastName}
                    </p>
                  </>
                ) : (
                  <p>Fetching data.</p>
                )}
              </div>
              <MenuDropdown />
            </div>
            <div className="row">
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Your Profile</p>
                    <p className="mb-0">Make changes to your profile.</p>
                  </div>
                </div>
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3 overflow-auto">
                    <div className="card border">
                      <img
                        src={adminData?.profilePicture}
                        className="card-img-top"
                        alt="Profile picture"
                        style={{ maxHeight: "320px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="fw-bold">
                          {adminData?.firstName} {adminData?.middleName}{" "}
                          {adminData?.lastName}
                        </h5>
                        <p className="mb-0">{adminData?.address}</p>
                        <p className="mb-0">{adminData?.mobile}</p>
                        <p className="mb-0">{adminData?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    <Link to={page.admin.archival}>
                      <div className="mb-3 fw-bold text-button border w-100">
                        Archival
                      </div>
                    </Link>
                    <div
                      onClick={() => setIsViewRequests(true)}
                      className="mb-3 fw-bold text-button border w-100"
                    >
                      Clinician Requests
                    </div>
                    <div
                      className="mb-3 fw-bold text-button border w-100"
                      onClick={handleModal}
                    >
                      Edit Profile
                    </div>
                    <div
                      className="mb-3 fw-bold text-button border w-100"
                      onClick={handleProfilePictureModal}
                    >
                      Change Profile Picture
                    </div>
                    <div
                      className="mb-3 fw-bold text-button border w-100"
                      onClick={handlePasswordModal}
                    >
                      Change Password
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm bg-white">
                {isViewRequests && (
                  <>
                    <div className="row p-3">
                      <div className="col bg-white border rounded-4 p-3">
                        <p className="mb-0 fw-bold">View Clinician Requests</p>
                        <p className="mb-0">
                          All clinician requests for access to patient records.
                        </p>
                      </div>
                    </div>
                    <div className="row p-3">
                      <div
                        className="col bg-white border rounded-4 p-3 overflow-auto"
                        style={{ maxHeight: "75vh" }}
                      >
                        {pendingRequests.length > 0 ? (
                          pendingRequests.map((request) => (
                            <RequestView
                              key={request._id}
                              clinicianId={request.clinicianId._id}
                              headerClinician={`${request.clinicianId.firstName} ${request.clinicianId.lastName}`}
                              headerPatient={`${request.patientId.firstName} ${request.patientId.lastName}`}
                              details={request.reason}
                              requestId={request._id}
                              onWebSocket={webSocketNotification}
                              onStatusChange={handleStatusChange}
                            />
                          ))
                        ) : (
                          <p className="fw-bold text-center mb-0">
                            No pending requests.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
