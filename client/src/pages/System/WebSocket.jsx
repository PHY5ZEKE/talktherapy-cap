import React from "react";
import { useEffect, useRef, useState, useContext } from "react";
import { route } from "../../utils/route";
import { AuthContext } from "../../utils/AuthContext";

//   ENV
const appURL = import.meta.env.VITE_APP_URL;

export default function WebSocket({ children }) {
  //  Authentication
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const role = authState.userRole;

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

    socket.current = new WebSocket(`${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("Connected to the server");
    };

    socket.current.onmessage = (message) => {
      const signal = JSON.parse(message.data);
      if (signal.type === "notification") {
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

  async function webSocketNotification(message) {
    const response = JSON.stringify(message);
    const parsed = JSON.parse(response);

    let notification = {};
    if (parsed.type === "higherAccountEdit") {
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

      // Notify WebSocket server
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify(result));
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  const dataFromChild = (data) => {
    console.log("Data from child:", data);
  };

  return (
    <>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { webSocketNotification, dataFromChild })
      )}
    </>
  );
}
