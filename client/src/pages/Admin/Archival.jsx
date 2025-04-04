import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";

import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import MenuDropdown from "../../components/Layout/AdminMenu";
import UnarchiveUser from "../../components/Modals/UnarchiveUser";
import { emailAccountRestore } from "../../utils/emailAccountRestore";
import { exportArchivedUsers } from "../../utils/exportData";

// Calendar
import "react-datepicker/dist/react-datepicker.css";

export default function Archival() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  const [archivedUsers, setArchivedUsers] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Fetch Data
  useEffect(() => {
    fetchAdminData();
    fetchArchivedUsers();
  }, []);

  // Fetch Admin Data
  const fetchAdminData = async () => {
    try {
      const response = await fetch(`${appURL}/${route.admin.fetch}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
        },
      });

      if (!response.ok) {
        failNotify(toastMessage.fail.fetch);
        setLoading(false);
        throw new Error("Failed to fetch admin data");
      }

      const data = await response.json();
      setLoading(false);
      setAdminData(data.admin);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw new Error("Failed to fetch admin data", error);
    }
  };

  // Fetch Archived Users Data
  const fetchArchivedUsers = async () => {
    if (!accessToken) {
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        `${appURL}/${route.sudo.getArchivedAdmins}`, // Ensure this URL is correct
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        setLoading(false);
        failNotify(toastMessage.fail.fetch);
        throw new Error("Failed to fetch archived users data");
      }

      setLoading(false);
      const data = await response.json();
      setArchivedUsers(data.users);
    } catch (err) {
      setLoading(false);
      failNotify(toastMessage.fail.error);
      setError("Error in fetching data.");
      throw new Error("Failed to fetch archived users data", err);
    }
  };

  const refetch = () => {
    emailAccountRestore(selectedUser.email);
    fetchArchivedUsers();
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const [isUnarchive, setUnarchive] = useState(false);
  const handleModal = (user) => {
    setSelectedUser(user);
    setUnarchive(!isUnarchive);
  };

  const [tickBox, setTickBox] = useState([]);
  const handleCheckboxChange = (user) => {
    setTickBox((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(user)) {
        return prevSelectedUsers.filter((u) => u !== user);
      } else {
        return [...prevSelectedUsers, user];
      }
    });
  };

  const handleSelectAll = () => {
    if (tickBox.length === archivedUsers.length) {
      setTickBox([]);
    } else {
      setTickBox(archivedUsers);
    }
  };

  const handleExport = () => {
    if (tickBox.length === 0) {
      failNotify("Please select at least one user to export.");
      return;
    }
    exportArchivedUsers(tickBox);
    setTickBox([]);
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
      {/* Unarchive Modal */}
      {isUnarchive && (
        <>
          <UnarchiveUser
            handleModal={handleModal}
            userDetails={selectedUser}
            onFetch={refetch}
          />
        </>
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
                ) : adminData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {adminData?.firstName} {adminData?.lastName}
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
                    <div className="d-flex flex-wrap gap-3 align-items-center justify-content-start">
                      <div>
                        <p className="mb-0 fw-bold">Data Archival</p>
                        <p className="mb-0">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>

                      <div className="d-flex gap-3">
                        <button
                          className="fw-bold text-button border"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleExport()}
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">Last Active</th>
                          <th scope="col">Email Address</th>
                          <th scope="col" className="d-none d-md-table-cell">
                            First Name
                          </th>
                          <th scope="col" className="d-none d-md-table-cell">
                            Last Name
                          </th>
                          <th scope="col" className="d-none d-md-table-cell">
                            Role
                          </th>
                          <th scope="col">
                            <p className="text-center mb-0">Action</p>
                          </th>
                          <th scope="col" style={{ width: "70" }}>
                            <button
                              className="d-flex justify-content-center fw-bold text-center mx-auto text-button"
                              onClick={handleSelectAll}
                            >
                              Select All
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedUsers &&
                          archivedUsers
                            .filter((user) => user.userRole !== "admin")
                            .map((user) => (
                              <tr key={user._id}>
                                <th scope="row">
                                  {new Date(
                                    user.lastActivity
                                  ).toLocaleDateString()}
                                </th>
                                <td>{user.email}</td>
                                <td className="d-none d-md-table-cell">
                                  {user.firstName || "NA"}
                                </td>
                                <td className="d-none d-md-table-cell">
                                  {user.lastName || "NA"}
                                </td>
                                <td className="d-none d-md-table-cell">
                                  {user.userRole || "NA"}
                                </td>
                                <td className="mx-auto">
                                  <button
                                    className="fw-bold mx-auto w-100 text-button px-3 border"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleModal(user)}
                                  >
                                    Restore
                                  </button>
                                </td>
                                <td>
                                  <input
                                    className="mx-auto w-100"
                                    type="checkbox"
                                    checked={tickBox.includes(user)}
                                    onChange={() => handleCheckboxChange(user)}
                                  />
                                </td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
