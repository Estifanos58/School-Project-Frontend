export const HOST = import.meta.env.VITE_SERVER_URL || "http://localhost:9090/";
console.log(HOST)

export const AUTH_ROUTES = "api/auth";
export const SIGNUP_ROUTES = `${AUTH_ROUTES}/signup`
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`

export const USER_ROUTES = "api/user";
export const GET_USER_INFO = `${USER_ROUTES}/info`
export const UPDATE_PROFILE_ROUTE = `${USER_ROUTES}/update-profile`
export const ADD_PROFILE_IMAGE_ROUTE = `${USER_ROUTES}/add-profile-image`
export const REMOVE_PROFILE_IMAGE_ROUTE = `${USER_ROUTES}/remove-profile-image`


export const CONTACTS_ROUTES = "api/contacts";
export const SEARCH_CONTACTS_ROUTES = `${CONTACTS_ROUTES}/search`
export const GET_DM_CONTACTS_ROUTES = `${CONTACTS_ROUTES}/get-contacts-for-dm`; 
export const GET_ALL_CONTACTS = `${CONTACTS_ROUTES}/get-all-contacts`

export const MESSAGES_ROUTES = "api/messages"
export const GET_ALL_MESSAGES_ROUTE = `${MESSAGES_ROUTES}/get-messages`;
export const UPLOAD_FILE_ROUTE = `${MESSAGES_ROUTES}/upload-file`;

export const CHANNEL_ROUTES = 'api/channels';
export const CREATE_CHANNEL_ROUTE = `${CHANNEL_ROUTES}/create-channel`;
export const GET_USER_CHANNELS_ROUTE = `${CHANNEL_ROUTES}/user-channels`
export const GET_CHANNEL_MESSAGES = `${CHANNEL_ROUTES}/get-channel-messages`