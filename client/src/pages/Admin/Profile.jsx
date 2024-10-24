import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import MenuDropdown from "../../components/Layout/AdminMenu";
import EditProfile from "../../components/Modals/EditProfile";
import ChangePassword from "../../components/Modals/ChangePassword";
import RequestView from "../../components/Modals/RequestView";

// Utils
import { route } from "../../utils/route";
import { page } from "../../utils/page-route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

export default function Profile() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  const [isViewRequests, setIsViewRequests] = useState(false);

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

  // Fetch admin data from the backend
  const fetchAdminData = async () => {
    const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

    try {
      const response = await fetch(`${appURL}/${route.admin.fetch}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const data = await response.json();
      setAdminData(data.admin);
      setLoading(false);
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <>
      {/* EDIT MODAL */}
      {/* EDIT MODAL */}
      {isOpen && (
        <EditProfile
          editProfileAPI={route.admin.edit}
          editPictureAPI={route.admin.picture}
          userDetails={adminData}
          closeModal={handleModal}
          isOwner={true}
          onProfileUpdate={fetchAdminData} // Pass the callback function
        />
      )}

      {/* CHANGE PASS MODAL */}
      {isPasswordModalOpen && (
        <ChangePassword
          editPasswordAPI={route.admin.password}
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
                        src={adminData?.profilePicture}
                        className="card-img-top"
                        alt="Profile picture"
                        style={{ maxHeight: "320px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="">
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
                    <Link to={page.admin.archival}>
                      <div className="mb-3 fw-bold text-button border w-100">
                        Archival
                      </div>
                    </Link>

                    <div
                    onClick={() => setIsViewRequests(true)}
                    className="mb-3 fw-bold text-button border w-100">
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
                      onClick={handlePasswordModal}
                    >
                      Change Password
                    </div>
                  </div>
                </div>
              </div>

              {/* THIRD COL */}
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
                        style={{ maxHeight: "75vh", minHeight: "60vh" }}
                      >
                        <RequestView
                          header={"Dr. Rico Nieto - Access Request"}
                          details={
                            "Ito reason ko aha! Uh u can include the patient name na din"
                          }
                        />
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
