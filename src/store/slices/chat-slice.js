import { GET_SPECIFIC_USER } from '@/utils/constants';
import { apiClient } from '@/lib/api-client';


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

  addContactsInDmContacts: async (message) => {
    const userId = get().userInfo.id; // Current user's ID from userInfo
    const fromId = message.sender === userId ? message.recipient : message.sender; // ID of the other user
    
    let dmContacts = [...get().directMessagesContacts]; // Clone array
  
    // Check if the contact is already in the list
    const index = dmContacts.findIndex((contact) => contact.id === fromId);
  
    if (index !== -1) {
      // Move existing contact to the top
      const [contact] = dmContacts.splice(index, 1);
      dmContacts.unshift(contact);
    } else {
      try {
        // Fetch user data from the backend
        const response = await apiClient.post(
          GET_SPECIFIC_USER,
                    { userId: fromId }, // Send searchTerm in the request body
                    { withCredentials: true }
                  );
  
        const userData = await response.data;
  
        // Add the new contact to the top of the list
        dmContacts.unshift(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  
    // Update state
    set({ directMessagesContacts: dmContacts });
  },
}
);  
