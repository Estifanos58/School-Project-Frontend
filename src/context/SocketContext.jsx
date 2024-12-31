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
  const { userInfo, set } = useAppStore();
  const {
    selectedChatData,
    selectedChatType,
    addMessage,
    addContactsInDmContacts,
    addChannelInChannelList,
  } = useAppStore.getState();

  useEffect(() => {
    if (userInfo) {
      // Establish WebSocket connection with SockJS and STOMP
      const socket = new SockJS("http://localhost:9090/ws");
      stompClient.current = Stomp.over(socket);

      // Connect with user-specific headers
      stompClient.current.connect(
        { username: userInfo.id }, // Send user ID in headers
        () => {
          console.log("WebSocket connected!");

          // Subscribe to user-specific queues
          stompClient.current.subscribe("/topic/public", (message) => {
            console.log("Received direct message: ", message.body);
            handleReceiveMessage(JSON.parse(message.body));
          });

          stompClient.current.subscribe("/user/queue/channel-messages", (message) => {
            console.log("Received channel message: ", message.body);
            handleReceiveMessage(JSON.parse(message.body));
          });

          // Optional broadcast subscription for testing
          stompClient.current.subscribe("/topic/test", (message) => {
            console.log("Broadcast Message Received: ", message.body);
          });

          // Notify backend that the user has joined
          const addUserMessage = {
            sender: userInfo.username,
            type: "JOIN",
          };
          stompClient.current.send("/app/chat.addUser", {}, JSON.stringify(addUserMessage));
        },
        (error) => {
          console.error("WebSocket connection failed: ", error);
        }
      );

      // Handle WebSocket disconnection
      stompClient.current.onclose = () => {
        console.log("WebSocket disconnected!");
      };

      // Cleanup connection on component unmount
      return () => {
        if (stompClient.current) {
          stompClient.current.disconnect(() => {
            console.log("WebSocket disconnected!");
          });
        }
      };
    }
  }, [userInfo]);

  // Handle received messages
  const handleReceiveMessage = (message) => {

    // Process only if the current chat matches the sender or recipient
    if (
      selectedChatType !== undefined &&
      (selectedChatData.id === message.sender ||
        selectedChatData.id === message.recipient)
    ) {
      // console.log("MESSAGE RECEIVED IN SOCKET CONTEXT");
      console.log(
        "THIS IS WHAT IS BEING SENT TO ADD MESSAGE",
        JSON.stringify(message)
      );
      addMessage(message);
    }

    // Update contact or channel lists if required
    // addContactsInDmContacts(message);
    // addChannelInChannelList(message);
  };

  // Send message function
  const sendMessage = (message) => {
    console.log("Sending message: ", { ...message });
    
    if (stompClient.current && stompClient.current.connected) {
      if(selectedChatType === "channel"){
        stompClient.current.send(
          "/app/chat.sendChannelMessage",
          {},
          JSON.stringify(message));

      } else{
      stompClient.current.send(
        "/app/chat.sendMessage",
        {},
        JSON.stringify(message)
      );
    }
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
