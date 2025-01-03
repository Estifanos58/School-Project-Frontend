import { useAppStore } from "@/store";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect,useState,useRef } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerFill } from "react-icons/ri";
import {useSocket} from '../../../../../../context/SocketContext.jsx'
import { apiClient } from "@/lib/api-client.js";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants.js";
const MessageBar = () => {
  const [message, setMessage] = useState("");
  const emojiRef = useRef(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const {selectedChatType, selectedChatData, userInfo, setIsUploading, setFileUploadProgress} = useAppStore();
  const socket = useSocket();
  const fileInputRef = useRef();
  // const {userInfo} = useAppStore()

  // console.log("Selected Chat Type" + JSON.stringify(selectedChatType))

  useEffect(()=>{
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  },[])

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return; // Prevent sending empty messages
  
    const payload = {
      sender: userInfo.id,
      content: message,
      recipient: selectedChatData.id,
      messageType: "text",
      fileUrl: undefined,
    };
    console.log("Sent message from Messagebar" + JSON.stringify(payload))
  
    if (selectedChatType === "contact") {
      console.log("contact info"+ JSON.stringify(selectedChatData))
      socket?.sendMessage({
        ...payload,
        recipient: selectedChatData.id,
      });
    } else if (selectedChatType === "channel") {
      console.log("channel info"+ JSON.stringify(selectedChatData))
      socket?.sendMessage({
        ...payload,
        channelId: selectedChatData.id,
        recipient: null,
      });
    }
  
    setMessage(""); // Clear the message after sending
  };
  

  const handleAttachmentClick = ()=>{
    if(fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
  
        setIsUploading(true);
  
        const response = await apiClient.post(
          UPLOAD_FILE_ROUTE,
          formData,
          {
            withCredentials: true,
            onUploadProgress: (data) => {
              setFileUploadProgress(
                Math.round((100 * data.loaded) / data.total)
              );
            },
          }
        );
  
        if (response.status === 200 && response.data) {
          setIsUploading(false);
  
          const payload = {
            sender: userInfo.id,
            content: undefined,
            fileUrl: response.data.filePath,
            messageType: "file",
          };
  
          if (selectedChatType === "contact") {
            socket.sendMessage({
              ...payload,
              recipient: selectedChatData._id,
            });
          } else if (selectedChatType === "channel") {
            socket.sendMessage({
              ...payload,
              channelId: selectedChatData.id,
            });
          }
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.log(error);
    }
  };
  

  return (
    <div className="h-[10vh] absolute bottom-0 w-[80vw] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:outline-none"
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all" onClick={handleAttachmentClick}>
          <GrAttachment className="text-2xl" />
        </button>
        <input type='file' className="hidden" ref={fileInputRef} onChange={handleAttachmentChange} />
        <div className="relative">
          <button
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition"
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
          >
            <RiEmojiStickerFill className="text-2xl" />
          </button>
          <div ref={emojiRef} className="absolute bottom-16 right-0">
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duration-300 transition"
        onClick={handleSendMessage}
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  );
};

export default MessageBar;
