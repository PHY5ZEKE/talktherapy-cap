export default function SocketFetch(socket) {
  const notification = {
    type: "fetch-action",
    message: "Fetch request received",
  };

  // Notify WebSocket server
  if (socket.current && socket.current.readyState === WebSocket.OPEN) {
    socket.current.send((JSON.stringify(notification)));
  }
}
