export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
  setChannels: (channels) => set({ channels }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) =>
    set({ directMessagesContacts }),
  addChannel: (channel)=>{
    const channels = get().channels;
    set({channels: [channel, ...channels]});
  },
  closedChat: () =>
    set({
      selectedChatType: undefined,
      selectedChatData: undefined,
      selectedChatMessages: [],
    }),
    addMessage: (message) => {
      const selectedChatMessages = get().selectedChatMessages;
    
      set({
        selectedChatMessages: [
          ...selectedChatMessages,
          {
            ...message,
            recipient: message.recipient, // Use as is (string ID)
            sender: message.sender,     // Use as is (string ID)
          },
        ],
      });
    },
    
  // addMessage: (message) => {
  //   const selectedChatMessages = get().selectedChatMessages;
  //   const selectedChatType = get().selectedChatType;

  //   set({
  //     selectedChatMessages: [
  //       ...selectedChatMessages,
  //       {
  //         ...message,
  //         recipient:
  //           selectedChatType === "channel"
  //             ? message.recipient
  //             : message.recipient.id,
  //         sender:
  //           selectedChatType === "channel"
  //             ? message.sender
  //             : message.sender.id,
  //       },
  //     ],
  //   });
  // },
  addChannelInChannelList: (message) => {
    const channels = get().channels;
    const data = channels.find((channel)=> channel.id === message.channelId);
    const index = channels.findIndex((channel)=> channel.id === message.channelId)
    if(index !== -1 && index !== undefined){
      channels.splice(index,1);
      channels.unshift(data);
    }
  },

  addContactsInDmContacts: (message)=>{
    console.log("contact In dm" +JSON.stringify(message))
    const userId = get().userInfo.id;
    const fromId = message.sender === userId ? message.recipient : message.sender;
    const fromData = message.sender === userId ? message.recipient : message.sender;
    const dmContacts = get().directMessagesContacts;
    const data = dmContacts.find((contact)=>
      console.log("contact" + JSON.stringify(contact))
      // contact.id === fromId
      );
    const index = dmContacts.findIndex((contact)=> contact.id === fromId);
    if(index !== 1 && index !== undefined){
      dmContacts.splice(index,1);
      dmContacts.unshift(data);
    }else{
      dmContacts.unshift(fromData);
    }
    set({directMessagesContacts});
  }
});
