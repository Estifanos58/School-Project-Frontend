import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });
      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      const handleRecieveMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage, addContactsInDmContacts } =
          useAppStore.getState();
        // console.log(message);
        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          // console.log("message rec ", message);
          addMessage(message);
        }
        addContactsInDmContacts(message);
      };

      const handleRecieveChannelMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage , addChannelInChannelList } =
          useAppStore.getState();
          console.log(message+ " received for channel")
        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }
        addChannelInChannelList(message);
      };

      socket.current.on("recieveMessage", handleRecieveMessage);
      socket.current.on("recieve-channel-message", handleRecieveChannelMessage);
      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};