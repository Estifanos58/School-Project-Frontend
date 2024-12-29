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

  console.log("THIS IS THE SELECTED CHAT MESSAGE FROM CONTAINER" + JSON.stringify(selectedChatMessages))

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChannelMessages = async ()=> {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true }
        );
       
        if (response.data.messages) {
          console.log(response.data.messages,"group")
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    }


    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if(selectedChatType === "channel") getChannelMessages();
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
      // console.log(message, "hellow")

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2 font-semibold">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessage(message)}
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

  const renderDMMessages = (message) => (
    <div
      className={`flex ${
        message.sender === selectedChatData._id
          ? "justify-start"
          : "justify-end"
      } my-1`}
    >
      <div
        className={`${
          message.sender !== selectedChatData._id
            ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
            : "bg-[#2a2b33]/5 text-white/80 border-white/20"
        } border inline-block p-3 rounded-lg max-w-[70%] break-words shadow-md transition-transform duration-200 transform hover:scale-105`}
      >
        {message.messageType === "text" && message.content}
      </div>
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-white/20"
          } border inline-block p-3 rounded-lg max-w-[70%] break-words shadow-md transition-transform duration-200 transform hover:scale-105`}
        >
          {checkImage(message.fileUrl) ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                setshowImage(true);
                setImageUrl(message.fileUrl);
              }}
            >
              <img src={`${HOST}${message.fileUrl}`} height={300} width={300} />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <span className="text-white/8- text-3xl bg-black/20 rounded-full p-3">
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
      <div className="text-xs text-gray-600 ml-2 self-end">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  const renderChannelMessage = (message) => {
    return (
      <div
        className={`mt-5 ${
          message.sender._id !== userInfo.id ? "text-left" : "text-right"
        }`}
      >
        <div
          className={`${
            message.sender._id !== userInfo._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-white/20"
          } border inline-block p-3 rounded-lg max-w-[70%] break-words shadow-md ml-9 transition-transform duration-200 transform hover:scale-105`}
        >
          {message.messageType === "text" && message.content}
        </div>

            {message.messageType === "file" && (
            <div
              className={`${
                message.sender._id === userInfo._id
                  ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                  : "bg-[#2a2b33]/5 text-white/80 border-white/20"
              } border inline-block p-3 rounded-lg max-w-[70%] break-words shadow-md transition-transform duration-200 transform hover:scale-105`}
            >
              {checkImage(message.fileUrl) ? (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setshowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                >
                  <img src={`${HOST}${message.fileUrl}`} height={300} width={300} />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-white/8- text-3xl bg-black/20 rounded-full p-3">
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

        {message.sender._id !== userInfo.id ? 
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8  rounded-full overflow-hidden">
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
                {message.sender?.firstname
                  ? message.sender?.firstname.split("").shift()
                  : message.sender?.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm textwhite/60 ">{`${message.sender.firstname} ${message.sender.lastname}`}</span>
            <span className="text-xs text-white/60">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>: 
          <div>
              <div className="text-xs text-white/60 mt-1">
              {moment(message.timestamp).format("LT")}
               </div>
          </div>
        }
      </div>
    );
  };

  return (
    <div className="flex flex-col overflow-y-auto scrollbar-hidd p-4 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <img
            src={`${HOST}${imageUrl}`}
            alt="image"
            className="h-[70vh] w-[70vw] bg-cover"
          />
          <button className=" gap-5 fixed top-0 mt-[95px] ml-[50%] w-[30px] h-[30px] bg-slate-600">
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
