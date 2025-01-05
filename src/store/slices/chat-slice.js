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
  setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),

  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },

  closedChat: () =>
    set({
      selectedChatType: undefined,
      selectedChatData: undefined,
      selectedChatMessages: [],
    }),

  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;

    // Avoid duplicates by checking the message ID
    const isDuplicate = selectedChatMessages.some((msg) => msg.id === message.id);

    if (!isDuplicate) {
      const updatedMessages = [...selectedChatMessages, message];

      // Sort messages by timestamps
      updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      set({ selectedChatMessages: updatedMessages });
    }
  },

  addChannelInChannelList: (message) => {
    let channels = [...get().channels]; // Clone array
    const index = channels.findIndex((channel) => channel.id === message.channelId);

    if (index !== -1) {
      const [channel] = channels.splice(index, 1); // Remove and get the channel
      channels.unshift(channel); // Move to the top
    }

    set({ channels });
  },

  addContactsInDmContacts: (message) => {
    const userId = get().userInfo.id;
    const fromId = message.sender === userId ? message.recipient : message.sender;
    const fromData = message.sender === userId ? message.recipient : message.sender;

    let dmContacts = [...get().directMessagesContacts]; // Clone array

    // Find the contact by ID
    const index = dmContacts.findIndex((contact) => contact.id === fromId);

    if (index !== -1) {
      // Move existing contact to the top
      const [contact] = dmContacts.splice(index, 1);
      dmContacts.unshift(contact);
    } else {
      // Add new contact to the top
      dmContacts.unshift(fromData);
    }

    set({ directMessagesContacts: dmContacts }); // Update state
  },
});
