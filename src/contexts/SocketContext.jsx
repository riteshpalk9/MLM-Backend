import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:4862");

      newSocket.on("connect", () => {
        console.log("Connected to server");
        newSocket.emit("join-user-room", user.id);
      });

      newSocket.on("earning-notification", (data) => {
        toast.success(
          `🎉 You earned ₹${data.amount.toFixed(2)} from ${data.from}!`,
          {
            duration: 4862,
            position: "top-right",
          }
        );

        // Optionally update user wallet in real-time
        // This would require updating the AuthContext or using a global state
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
