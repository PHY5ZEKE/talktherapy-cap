import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { Link } from "react-router-dom";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import EditProfile from "../../components/Modals/EditProfile";
import ChangePassword from "../../components/Modals/ChangePassword";
import MenuDropdown from "../../components/Layout/ClinicianMenu";
import ConfirmationDialog from "../../components/Modals/ConfirmationDialog";
import RequestContent from "../../components/Modals/RequestContent";

// Utils
import { route } from "../../utils/route";
import { page } from "../../utils/page-route";
import SocketFetch from "../../utils/SocketFetch";

export default function Profile() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [clinicianData, setClinicianData] = useState(null);
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

  // WebSocket Notification
  const socket = useRef(null);
  useEffect(() => {
    fetchClinicianData();

    socket.current = new WebSocket(`${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("Connected to the server");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "fetch-action") {
        fetchClinicianData();
      }
    };

    socket.current.onclose = () => {
      console.log("Disconnected from the server");
    };

    return () => {
      socket.current.close();
    };
  }, []);

  const webSocketFetch = () => {
    SocketFetch(socket);
  };

  const fetchClinicianData = async () => {
    try {
      const response = await fetch(`${appURL}/${route.clinician.fetch}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch clinician data");
      }

      const data = await response.json();
      setClinicianData(data.clinician);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Request Content
  const [isRequestContent, setRequestContent] = useState(false);
  const handleRequestContent = () => {
    setRequestContent(!isRequestContent);
  };

  return (
    <>
      {/* EDIT MODAL */}
      {isOpen && (
        <EditProfile
          editProfileAPI={route.clinician.edit}
          editPictureAPI={route.clinician.picture}
          userDetails={clinicianData}
          closeModal={handleModal}
          isOwner={true}
          onFetch={webSocketFetch}
        />
      )}

      {/* CHANGE PASS MODAL */}
      {isPasswordModalOpen && (
        <ChangePassword
          editPasswordAPI={route.clinician.password}
          closeModal={handlePasswordModal}
        />
      )}

      {/* Request Content */}
      {isRequestContent && (
        <>
          <RequestContent handleModal={handleRequestContent} clinicianData={clinicianData} />
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
                ) : clinicianData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {clinicianData?.firstName} {clinicianData?.lastName}
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
                    <p className="mb-0 fw-bold">Your Profile</p>
                    <p className="mb-0">Make changes to your profile.</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3 overflow-auto">
                    <div className="card">
                      <img
                        src={clinicianData?.profilePicture}
                        className="card-img-top"
                        alt="Profile picture"
                        style={{ maxHeight: "320px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="">
                          {`${clinicianData?.firstName} ${clinicianData?.middleName} ${clinicianData?.lastName}`}
                        </h5>
                        <p className="mb-0">
                          Specialization: {clinicianData?.specialization}
                        </p>
                        <p className="mb-0">
                          Clinic Address: {clinicianData?.address}
                        </p>
                        <p className="mb-0">Contact: {clinicianData?.mobile}</p>
                        <p className="mb-0">Email: {clinicianData?.email}</p>
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
                    <Link to={page.clinician.profile}>
                      <div className="mb-3 fw-bold text-button border w-100"
                      onClick={handleRequestContent}
                      >
                        Request Content
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
