import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../utils/AuthContext";

import Sidebar from "../../components/Sidebar/SidebarSuper";
import EditProfile from "../../components/Modals/EditProfile";
import ChangePassword from "../../components/Modals/ChangePassword";
import ChangeProfilePicture from "../../components/Modals/ChangeProfilePicture";
import MenuDropdown from "../../components/Layout/SudoMenu";

import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import SocketFetch from "../../utils/SocketFetch";

// utils
import { route } from "../../utils/route";
import { page } from "../../utils/page-route";
import { Link } from "react-router-dom";

export default function Profile() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

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

  const socket = useRef(null);
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!accessToken) {
        setError("No token found. Please log in.");
        return;
      }

      const endpoint = `${appURL}/${route.sudo.fetch}`;
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserDetails(data.superAdmin);
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

    fetchUserDetails();

    socket.current = new WebSocket(`${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("Connected to the server");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "fetch-action") {
        fetchUserDetails();
      }
    };

    socket.current.onclose = () => {
      console.log("Disconnected from the server");
    };

    return () => {
      socket.current.close();
    };
  }, []);

  const webSocketFetch = async () => {
    SocketFetch(socket);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!userDetails) {
    return (
      <div className="container-fluid d-flex vh-100 align-items-center justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* EDIT MODAL */}
      {isOpen && (
        <EditProfile
          editProfileAPI={route.sudo.edit}
          editPictureAPI={route.sudo.picture}
          userDetails={userDetails}
          closeModal={handleModal}
          isOwner={true}
          onFetch={webSocketFetch}
        />
      )}

      {/* CHANGE PROFILE PICTURE MODAL */}
      {isProfilePictureModalOpen && (
        <ChangeProfilePicture
          editPictureAPI={route.sudo.picture}
          closeModal={handleProfilePictureModal}
          onFetch={webSocketFetch}
        />
      )}

      {/* CHANGE PASS MODAL */}
      {isPasswordModalOpen && (
        <ChangePassword
          editPasswordAPI={route.sudo.password}
          closeModal={handlePasswordModal}
        />
      )}

      <div className="container-fluid p-0 vh-100 vw-100">
        <div className="d-flex flex-md-row flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : userDetails ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {userDetails.firstName} {userDetails.lastName}
                    </p>
                  </>
                ) : (
                  <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                )}
              </div>

              <MenuDropdown />
            </div>

            <div className="row">
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
                    <div className="card border">
                      <img
                        src={userDetails?.profilePicture}
                        className="card-img-top"
                        alt="Profile picture"
                        style={{ maxHeight: "320px", objectFit: "cover" }}
                        loading="lazy"
                      />
                      <div className="card-body">
                        <h5 className="fw-bold">
                          {userDetails?.firstName} {userDetails?.middleName}{" "}
                          {userDetails?.lastName}
                        </h5>
                        <p className="mb-0">{userDetails?.address}</p>
                        <p className="mb-0">{userDetails?.mobile}</p>
                        <p className="mb-0">{userDetails?.email}</p>
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
                    <Link to={page.sudo.audit}>
                      <div className="mb-3 fw-bold text-button border w-100">
                        Audit Logs
                      </div>
                    </Link>

                    <Link to={page.sudo.archival}>
                      <div className="mb-3 fw-bold text-button border w-100">
                        Archival
                      </div>
                    </Link>

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

              {/* THIRD COL */}
              <div className="col-sm bg-white"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
