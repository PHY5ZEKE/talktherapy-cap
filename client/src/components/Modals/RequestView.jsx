import { useState, useContext } from "react";
import { toast, Slide } from "react-toastify";
import { route } from "../../utils/route";
import { AuthContext } from "../../utils/AuthContext";

export default function RequestView({
  clinicianId,
  headerClinician,
  headerPatient,
  details,
  requestId,
  onStatusChange,
  onWebSocket,
}) {
  const [loading, setLoading] = useState(false);

  const { authState } = useContext(AuthContext);
  const appURL = import.meta.env.VITE_APP_URL;
  const accessToken = authState.accessToken;

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

      
  const handleStatusChange = async (status) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${appURL}/${route.admin.updateRequestStatus}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ requestId, status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const data = await response.json();

      const userUpdate = {
        notif: "appointmentRequestAccess",
        body: `${headerClinician} request record access for ${headerPatient} has been ${status != "Assigned" ? "rejected" : "granted permission"}.`,
        show_to: [clinicianId],
      };

      onWebSocket(userUpdate);

      notify("Status updated successfully");
      onStatusChange(requestId, status);
    } catch (error) {
      console.log(error);
      failNotify("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <details className="accordion mb-3 border border rounded-3">
      <summary className="open:bg-danger p-3 rounded-top-3">{headerClinician} is requesting access for {headerPatient}</summary>

      <p className="px-3 mt-3">{details}</p>

      <div className="d-flex gap-3 m-3 border border-bottom-0 border-start-0 border-end-0">
        <p
          className="fw-bold mt-3 mb-0 text-button border"
          onClick={() => handleStatusChange("Assigned")}
          disabled={loading}
        >
          Accept
        </p>
        <p
          className="fw-bold mt-3 mb-0 text-button border"
          onClick={() => handleStatusChange("Denied")}
          disabled={loading}
        >
          Reject
        </p>
      </div>
    </details>
  );
}
