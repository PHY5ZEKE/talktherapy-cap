import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import axios from "axios";
import { route } from "../../utils/route";
import formatDate from "../../utils/formatDate";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";
import MenuDropdown from "../../components/Layout/SudoMenu";
import EditProfile from "../../components/Modals/EditProfile";
import RegisterAdmin from "../../components/Modals/RegisterAdmin";

export default function Home() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const role = authState.userRole;

  // Get Super Admin and Admins
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [superAdmin, setSuperAdmin] = useState(null);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;
  const [userDetails, setUserDetails] = useState(null);
  const [editProfileAPI, setEditProfileAPI] = useState("");
  const [updateProfilePictureAPI, setUpdateProfilePictureAPI] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const notify = (message) =>
    toast.success(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const [isOpen, setIsOpen] = useState(false);
  const [isAdd, setIsAdd] = useState(false);

  const handleModal = (user) => {
    setIsOpen(!isOpen);
    setUserDetails(user);
    setEditProfileAPI(route.sudo.editAdmin);
  };

  const onProfileUpdate = async (updatedDetails) => {
    try {
      const response = await axios.put(
        `${appURL}/${editProfileAPI}`,
        updatedDetails,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Handle the response as needed
      notify(toastMessage.success.edit);
    } catch (error) {
      failNotify(toastMessage.fail.error);
      setError("Error updating profile", error);
    }
  };

  // WebSocket Notification
  const socket = useRef(null);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    // Get Notifications from MongoDB
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${appURL}/${route.notification.get}`);
        if (!response.ok) {
          throw new Error("Failed to fetch notif");
        }
        const data = await response.json();
        setNotifications(data.decryptedNotifications);
      } catch (error) {
        console.error("Error fetch notif", error);
      }
    };

    fetchNotifications();

    socket.current = new WebSocket(`ws://${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("Connected to the server");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        fetchNotifications();
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
    if (parsed.notif === "higherAccountEdit") {
      notification = {
        body: `${superAdmin.firstName} edited ${parsed.user}'s profile information.`,
        date: new Date(),
        show_to: role !== "admin" ? `${parsed.id}` : "admin",
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
      console.log("Notification sent:", JSON.stringify(resultWithNotif));

      // Notify WebSocket server
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify(resultWithNotif));
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };


  //Super Admin
  useEffect(() => {
    const fetchSuperAdmin = async () => {
      if (!accessToken) {
        setError("No token found. Please log in.");
        return;
      }

      try {
        const response = await fetch(`${appURL}/${route.sudo.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSuperAdmin(data.superAdmin);
        } else if (response.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          const errorText = await response.text();
          failNotify(toastMessage.fail.fetch);
          setError("Failed to fetch super admin data", errorText);
        }
      } catch (error) {
        failNotify(toastMessage.fail.fetch);
        failNotify(toastMessage.fail.error);
        setError("Error fetching super admin data", error);
      }
    };

    fetchSuperAdmin();
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(
          `${appURL}/${route.sudo.getAllAdmins}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setAdmins(response.data.admins);
      } catch (error) {
        setError("An error occurred while retrieving admins.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Function to toggle activation status
  const toggleAdminStatus = async (adminData) => {
    if (!adminData) return;

    setIsProcessing(true); // Start processing

    try {
      const url = adminData.active
        ? `${appURL}/${route.admin.removeAdmin}`
        : `${appURL}/${route.admin.activateAdmin}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: adminData.email }), // Automatically pass the selected admin's email
      });

      const data = await response.json();

      if (!data.error) {
        // Optionally, update the admins list to reflect the change
        setAdmins(
          admins.map((admin) =>
            admin._id === adminData._id
              ? { ...admin, active: !adminData.active }
              : admin
          )
        );
        notify(toastMessage.success.status);
      } else {
        failNotify(toastMessage.fail.status);
      }
    } catch (error) {
      failNotify(toastMessage.fail.error);
      setError("An error occurred while updating admin status.", error);
    } finally {
      setIsProcessing(false); // Stop processing
    }
  };

  return (
    <>
      {/* EDIT MODAL */}
      {isOpen && (
        <EditProfile
          editProfileAPI={editProfileAPI}
          editPictureAPI={updateProfilePictureAPI}
          userDetails={userDetails}
          closeModal={handleModal}
          isOwner={false}
          whatRole={role}
          onProfileUpdate={onProfileUpdate}
          onWebSocket={webSocketNotification}
        />
      )}

      {/* REGISTER ADMIN MODAL */}
      {isAdd && (
        <>
          <RegisterAdmin openModal={() => setIsAdd(!isAdd)} />
        </>
      )}

      <div className="container-fluid p-0 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : superAdmin ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {superAdmin?.firstName} {superAdmin?.lastName}
                    </p>
                  </>
                ) : (
                  <p>Fetching data.</p>
                )}
              </div>

              <MenuDropdown />
            </div>

            <div className="row h-100">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <div className="d-flex gap-3 justify-content-between">
                      <div>
                        <p className="mb-0 fw-bold">Admins</p>
                        <p className="mb-0">Quick manage admins.</p>
                      </div>

                      <button
                        className="fw-bold text-button border"
                        style={{ cursor: "pointer" }}
                        onClick={() => setIsAdd(!isAdd)}
                      >
                        Add Admin
                      </button>
                    </div>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {error ? (
                      <p>{error}</p>
                    ) : superAdmin ? (
                      <>
                        {admins.map((admin) => (
                          <div
                            key={admin._id}
                            className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          >
                            <h5 className="mb-0 fw-bold">
                              {admin.firstName} {admin.lastName}
                            </h5>
                            <p className="mb-0">{admin.email}</p>
                            <p className="mb-0">{admin.address}</p>
                            <p className="mb-3">{admin.mobile}</p>

                            <div className="d-flex gap-3">
                              <div
                                className="mb-3 fw-bold text-button border"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleModal(admin)}
                              >
                                Edit
                              </div>
                              <div
                                className="mb-3 fw-bold text-button border"
                                style={{ cursor: "pointer" }}
                              >
                                Delete
                              </div>
                              <div
                                className="mb-3 fw-bold text-button border"
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleAdminStatus(admin)}
                                disabled={isProcessing}
                              >
                                {admin.active ? "Deactivate" : "Activate"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p>Fetching data.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Notifications</p>
                    <p className="mb-0">
                      Account and system related activities will be shown here.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {notifications.length > 0 ? (
                      notifications
                        .filter((notif) => notif.show_to.includes("superadmin"))
                        .map((notification) => (
                          <div
                            key={notification._id}
                            className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          >
                            <p className="mb-0 fw-bold">{notification.body}</p>
                            <p className="mb-0">{formatDate(notification.date)}</p>
                          </div>
                        ))
                    ) : (
                      <p>No notifications available</p>
                    )}

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
