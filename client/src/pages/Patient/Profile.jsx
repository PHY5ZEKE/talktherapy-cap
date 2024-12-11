import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import EditProfile from "../../components/Modals/EditProfile";
import ChangePassword from "../../components/Modals/ChangePassword";
import ChangeProfilePicture from "../../components/Modals/ChangeProfilePicture";
import MenuDropdown from "../../components/Layout/PatientMenu";

// Utils
import { route } from "../../utils/route";

export default function Profile() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const role = authState.userRole;

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

  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const handleProfilePictureModal = () => {
    setIsProfilePictureModalOpen(!isProfilePictureModalOpen);
  };

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`${appURL}/${route.patient.fetch}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      {/* EDIT MODAL */}
      {isOpen && (
        <EditProfile
          editProfileAPI={route.patient.edit}
          editPictureAPI={route.patient.picture}
          userDetails={patientData}
          closeModal={handleModal}
          isOwner={true}
          whatRole={role}
          onFetch={fetchPatientData}
        />
      )}

      {/* CHANGE PROFILE PICTURE MODAL */}
      {isProfilePictureModalOpen && (
        <ChangeProfilePicture
          editPictureAPI={route.patient.picture}
          closeModal={handleProfilePictureModal}
          onFetch={fetchPatientData}
        />
      )}

      {/* CHANGE PASS MODAL */}
      {isPasswordModalOpen && (
        <ChangePassword
          editPasswordAPI={route.patient.password}
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
                ) : patientData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {patientData?.firstName} {patientData?.lastName}
                    </p>
                  </>
                ) : (
                  <p>Fetching data.</p>
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
                        src={patientData?.profilePicture}
                        className="card-img-top"
                        alt="Profile picture"
                        style={{ maxHeight: "320px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="fw-bold">
                          {patientData?.firstName} {patientData?.middleName}{" "}
                          {patientData?.lastName}
                        </h5>
                        <p className="mb-0">{patientData?.diagnosis} Patient</p>
                        <p className="mb-0">
                          {formatDate(patientData?.birthday)}
                        </p>
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
                        onClick={handleProfilePictureModal}
                      >
                        Change Profile Picture
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
