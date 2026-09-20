import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

export const SocketContext = createContext(null);

let sharedSocket = null;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (!sharedSocket) {
      sharedSocket = io("http://localhost:5000", {
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