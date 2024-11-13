import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";

import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";
import MenuDropdown from "../../components/Layout/SudoMenu";
import UnarchiveUser from "../../components/Modals/UnarchiveUser";
import { emailAccountRestore } from "../../utils/emailAccountRestore";
import { exportArchivedUsers } from "../../utils/exportData";

// Calendar
import "react-datepicker/dist/react-datepicker.css";

export default function Archival() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const nav = useNavigate();
  const [superAdmin, setSuperAdmin] = useState(null);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  const [archivedUsers, setArchivedUsers] = useState(null);

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
    fetchSuperAdmin();
    fetchArchivedUsers();
  }, []);

  // Fetch Super Admin Data
  const fetchSuperAdmin = async () => {
    if (!accessToken) {
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        `${appURL}/${route.sudo.fetch}`, // Ensure this URL is correct
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuperAdmin(data.superAdmin);
      } else if (response.status === 401) {
        setError("Unauthorized. Please log in again.");
        clearOnLogOut();
        failNotify(toastMessage.fail.unauthorized);
        nav("/unauthorized");
      } else {
        const errorText = await response.text();
        failNotify(toastMessage.fail.error);
        failNotify(toastMessage.fail.fetch);
        setError("Failed to fetch data.", errorText);
      }
    } catch (error) {
      failNotify(toastMessage.fail.error);
      setError("Error in fetching data.");
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

      if (response.ok) {
        const data = await response.json();
        setArchivedUsers(data.users);
      } else if (response.status === 401) {
        setError("Unauthorized. Please log in again.");
        clearOnLogOut();
        failNotify(toastMessage.fail.unauthorized);
        nav("/unauthorized");
      } else {
        const errorText = await response.text();
        failNotify(toastMessage.fail.error);
        failNotify(toastMessage.fail.fetch);
        setError("Failed to fetch data.", errorText);
        console.log(error);
      }
    } catch (err) {
      failNotify(toastMessage.fail.error);
      setError("Error in fetching data.");
      console.log(err);
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
                      {superAdmin.firstName} {superAdmin.lastName}
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
                          <th scope="col">First Name</th>
                          <th scope="col">Last Name</th>
                          <th scope="col">Role</th>
                          <th scope="col">
                            <p className="text-center mb-0">Action</p>
                          </th>
                          <th scope="col" style={{ width: "70" }}>
                            <button
                              className="d-flex mx-auto action-btn btn-text-blue"
                              onClick={handleSelectAll}
                            >
                              Select All
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedUsers &&
                          archivedUsers.map((user) => (
                            <tr key={user._id}>
                              <th scope="row">
                                {new Date(
                                  user.lastActivity
                                ).toLocaleDateString()}
                              </th>
                              <td>{user.email}</td>
                              <td>{user.firstName}</td>
                              <td>{user.lastName}</td>
                              <td>{user.userRole}</td>
                              <td className="d-flex justify-content-center mx-auto">
                                <button
                                  className="fw-bold text-button border"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleModal(user)}
                                >
                                  Restore
                                </button>
                              </td>
                              <td className="">
                                <input
                                  className="d-flex justify-content-center mx-auto"
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
