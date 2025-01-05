import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES, HOST } from "@/utils/constants";
import { MdFolderZip } from "react-icons/md";
import { ImFolderDownload } from "react-icons/im";
import { MdClose } from "react-icons/md";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";

const MessageContainer = () => {
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    userInfo,
    setSelectedChatMessages,
    setFileDownloadProgress,
    setIsDownloading,
  } = useAppStore();
  const scrollRef = useRef();
  const [showImage, setshowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData.id },
          { withCredentials: true }
        );
        if (response.data) {
          setSelectedChatMessages(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData.id}`,
          { withCredentials: true }
        );
        console.log("CHANNEL MESSAGE RECEIVED", response)
        if (response.data) {
          setSelectedChatMessages(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData.id) {
      if (selectedChatType === "contact") {
        getMessages();
      } else if (selectedChatType === "channel") {
        getChannelMessages();
      }
    }
  }, [selectedChatType, selectedChatData, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2 font-semibold">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {renderMessageContent(message)}
        </div>
      );
    });
  };

  const downloadFile = async (file) => {
    try {
      setIsDownloading(true);
      setFileDownloadProgress(0);
      const response = await apiClient.get(`${HOST}${file}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.floor((loaded * 100) / total);
          setFileDownloadProgress(percent);
        },
      });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", file.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
      setIsDowloading(false);
      setFileDownloadProgress(0);
    } catch (error) {
      setIsDownloading(false);
      console.error("Error downloading file:", error);
    }
  };

  const renderMessageContent = (message) => {
    const isCurrentUser = message.sender === userInfo.id;
    const isChannel = selectedChatType === "channel";

    const bubbleClass = isCurrentUser
      ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
      : "bg-[#2a2b33]/5 text-white/80 border-white/20";

    return (
      <div
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} my-1`}
      >
        <div
          className={`border inline-block p-3 rounded-lg max-w-[70%] break-words shadow-md transition-transform duration-200 transform hover:scale-105 ${bubbleClass}`}
        >
          {message.messageType === "text" && message.content}

          {message.messageType === "file" && (
            <div>
              {checkImage(message.fileUrl) ? (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setshowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                >
                  <img
                    src={`${HOST}${message.fileUrl}`}
                    height={300}
                    width={300}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                    <MdFolderZip />
                  </span>
                  <span>{message.fileUrl.split("/").pop()}</span>
                  <span
                    className="bg-black/20 p-3 rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                    onClick={() => downloadFile(message.fileUrl)}
                  >
                    <ImFolderDownload />
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {!isCurrentUser && isChannel && (
          <div className="flex items-center justify-start gap-3 ml-2">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender?.image && (
                <AvatarImage
                  src={`${HOST}${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              )}
              <AvatarFallback
                className={`uppercase h-8 w-8 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                  message.sender?.color
                )}`}
              >
                {message?.senderName && message?.senderName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">{`${message.senderName}`}</span>
            <span className="text-xs text-white/60">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col overflow-y-auto scrollbar-hidden p-4 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <img
            src={`${HOST}${imageUrl}`}
            alt="image"
            className="h-[70vh] w-[70vw] bg-cover"
          />
          <button className="gap-5 fixed top-0 mt-[95px] ml-[50%] w-[30px] h-[30px] bg-slate-600">
            <ImFolderDownload
              className="h-[100%] w-[100%]"
              onClick={() => downloadFile(imageUrl)}
            />
          </button>
          <div className="flex gap-5 fixed top-0 mt-[95px] ml-[60%] w-[30px] h-[30px] bg-slate-600">
            <MdClose
              onClick={() => {
                setshowImage(false);
                setImageUrl(null);
              }}
              className="h-[100%] w-[100%]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
