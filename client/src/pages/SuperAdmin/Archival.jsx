import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";

import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";
import MenuDropdown from "../../components/Layout/SudoMenu";

// Calendar
import Icon from "../../assets/icons/CalendarIcon";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Archival() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const nav = useNavigate();
  const [superAdmin, setSuperAdmin] = useState(null);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

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

  //Super Admin
  useEffect(() => {
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
          failNotify(toastMessage.fail.unauthorized)
          nav("/unauthorized")
        } else {
          const errorText = await response.text();
          failNotify(toastMessage.fail.error)
          failNotify(toastMessage.fail.fetch)
          setError("Failed to fetch data.", errorText);
        }
      } catch (error) {
        failNotify(toastMessage.fail.error)
        setError("Error in fetching data.");
      }
    };

    fetchSuperAdmin();
  }, []);

  return (
    <>
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
                        <p className="mb-0 fw-bold">System Activities</p>
                        <p className="mb-0">Date Here</p>
                      </div>

                      <DatePicker
                        className="calendar text-center"
                        showIcon
                        icon={Icon}
                        dateFormat={"yyyy/MM/dd"}
                      />

                      <div className="d-flex gap-3">
                        <button
                          className="fw-bold text-button border"
                          style={{ cursor: "pointer" }}
                        >
                          Import
                        </button>
                        <button
                          className="fw-bold text-button border"
                          style={{ cursor: "pointer" }}
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
                          <th scope="col" style={{ width: "70" }}>
                            <button className="action-btn btn-text-blue">
                              Select All
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">July 5, 2024</th>
                          <td>Mark@gmail.com</td>
                          <td>Mark</td>
                          <td>Villar</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">July 5, 2024</th>
                          <td>Mark@gmail.com</td>
                          <td>Mark</td>
                          <td>Villar</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">July 5, 2024</th>
                          <td>Mark@gmail.com</td>
                          <td>Mark</td>
                          <td>Villar</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                        </tr>
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
