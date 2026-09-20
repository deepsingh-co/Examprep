import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

import { SOCKET_URL } from "../utils/constants";

export const SocketContext = createContext(null);

let sharedSocket = null;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (!sharedSocket) {
      sharedSocket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
      });
    }
    setSocket(sharedSocket);

    return () => {};
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};