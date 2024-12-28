import { useAppStore } from "@/store";
import { createContext, useContext, useEffect, useRef } from "react";
import * as Stomp from "stompjs";
import SockJS from "sockjs-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const stompClient = useRef(null);
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      // Establish WebSocket connection with SockJS and STOMP
      const socket = new SockJS("http://localhost:9090/ws");
      stompClient.current = Stomp.over(socket);

      stompClient.current.connect({}, () => {
        console.log("WebSocket connected!");

        // Subscribe to a topic
        stompClient.current.subscribe("/topic/public", (message) => {
          handleReceiveMessage(JSON.parse(message.body));
        });

        // Send the 'addUser' message when connected
        const addUserMessage = {
          sender: userInfo.username,
          type: "JOIN",
        };
        stompClient.current.send("/app/chat.addUser", {}, JSON.stringify(addUserMessage));
      });

      stompClient.current.onclose = () => {
        console.log("WebSocket disconnected!");
      };

      return () => {
        if (stompClient.current) {
          stompClient.current.disconnect();
        }
      };
    }
  }, [userInfo]);

  // Handle received messages
  const handleReceiveMessage = (message) => {
    const {
      selectedChatData,
      selectedChatType,
      addMessage,
      addContactsInDmContacts,
      addChannelInChannelList,
    } = useAppStore.getState();

    if (
      selectedChatType !== undefined &&
      (selectedChatData.id === message.sender ||
        selectedChatData.id === message.recipient)
    ) {
      addMessage(message);
    }
    console.log("Received message "+message);
    // Update contacts or channel lists
    addContactsInDmContacts(message);
    addChannelInChannelList(message);
  };

  // Send message function
  const sendMessage = (message) => {
    console.log("send message" + {...message})
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send("/app/chat.sendMessage", {}, JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected!");
    }
  };

  return (
    <SocketContext.Provider value={{ sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
