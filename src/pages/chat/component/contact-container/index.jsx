import React, { useEffect, useState } from 'react'
import ProfileInfo from './components/profile-info';
import NewDm from './components/new-dm';
import { apiClient } from '@/lib/api-client';
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS_ROUTE } from '@/utils/constants';
import { useAppStore } from '@/store';
import ContactList from '@/components/contact-list';
import CreateChannel from './components/create-channel';
import { IoSearchSharp } from "react-icons/io5";
import { SEARCH_CONTACTS_ROUTES, HOST } from "@/utils/constants";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";



const ContactContainer = () => {
  const [searchedContacts, setSearchedContacts] = useState([]);
  const { setDirectMessagesContacts, directMessagesContacts, channels, setChannels } = useAppStore();
  const { setSelectedChatType, setSelectedChatData } = useAppStore();
  const [openNewContact, setOpenNewContact] = useState(false);


  // const { setSelectedChatType, setSelectedChatData } = useAppStore();


  useEffect(()=>{
    const getContacts = async ()=>{
      const response = await apiClient.get(GET_DM_CONTACTS_ROUTES, {withCredentials: true});
      // console.log(response.data+"Contact Detail "+response.status);
      if(response.data){
        setDirectMessagesContacts(response.data)
      }
    }

    const getChannels = async ()=>{
      const response = await apiClient.get(GET_USER_CHANNELS_ROUTE, {withCredentials: true});
      console.log(response.data+" "+response.status);
      if(response.data){
        setChannels(response.data)
      }
    }

    getContacts();
    getChannels();
  },[setChannels, setDirectMessagesContacts]);


  // Function to search contacts
    const searchContacts = async (searchTerm) => {
      try {
        if (searchTerm.length > 0) {
          // Send POST request to search endpoint
          const response = await apiClient.post(
            SEARCH_CONTACTS_ROUTES,
            { searchTerm }, // Send searchTerm in the request body
            { withCredentials: true }
          );
  
          console.log("Response Data:", response.data); // Log raw data
          console.log("Response Status:", response.status);
  
          if (response.status === 200) {
            setSearchedContacts(response.data); // Store contacts
          } else {
            setSearchedContacts([]);
          }
        } else {
          setSearchedContacts([]);
        }
      } catch (error) {
        console.error("Error searching contacts:", error);
      }
    };

    const selectNewContact = (contact) => {
      setOpenNewContact(false);
      setSelectedChatType("contact");
      setSelectedChatData(contact);
      console.log("SELECTED CHAT CONTACT", contact)
      setSearchedContacts([]);
    };

  // console.log("Here search"+ contact)
  // console.log("Direct Messages "+ JSON.stringify(directMessagesContacts))

  return (
    <div className='relative md:w-[40vw] lg:w-[30vw] xl:w-[25vw] pr-0 bg-[#181818] border-r-2 border-[#181818] w-full'>
     <div className="pt-3">
     <ProfileInfo />
    
     </div>
     <div className="my-5">
      <div className="flex items-center mr-10 ml-10 rounded-lg bg-[#444343]">
        {/* <Title text="Search"/> */}
        <IoSearchSharp className='pl-3 text-3xl'/>
        <input type="text" className=' bg-[#444343] pl-3 text-white outline-none border-white' placeholder='Search' onChange={(e) => searchContacts(e.target.value)}/>
      </div>
      <div className='min-h-0  mt-1  rounded-3xl bg-[#2c2b2b] w-[76%] flex flex-col m-auto'>
              {searchedContacts.map((contact, index) => (
                
                <div
                  className="flex gap-3 mb-1 ml-3 items-center cursor-pointer"
                  key={index}
                  onClick={() => selectNewContact(contact)}
                >
                  <div className="w-12 h-12 relative">
                    <Avatar className="h-12 w-12  rounded-full overflow-hidden">
                      {contact.image ? (
                        <AvatarImage
                          src={contact.image}
                          alt="profile"
                          className="object-cover w-full h-full bg-black"
                        />
                      ) : (
                        <div
                          className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                            contact.color
                          )}`}
                        >
                          {contact.firstname
                            ? contact.firstname.charAt(0)
                            : contact.email.charAt(0)}
                        </div>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex flex-col">
                    <span>
                      {contact.firstname && contact.lastname
                        ? `${contact.firstname} ${contact.lastname}`
                        : contact.email}
                    </span>
                    <span className="text-xs">{contact.email}</span>
                  </div>
                  
                </div>
              ))}
      </div>
      {/* <div className="max-h-[40vh] overflow-y-auto scrollbar-hidden"> 
        <ContactList contacts={directMessagesContacts}/>
      </div> */}
     </div>
     <div className="my-5">
      <div className="flex items-center justify-between pr-18">
        <Title text="Private"/>
        {/* <NewDm/> */}
      </div>
      <div className="max-h-[40vh] overflow-y-auto scrollbar-hidden"> 
        <ContactList contacts={directMessagesContacts}/>
      </div>
     </div>
     <div className="my-5">
      <div className="flex items-center justify-between pr-18">
        <Title text="Channels"/>
        <CreateChannel/>
      </div>
      <div className="max-h-[40vh] overflow-y-auto scrollbar-hidden"> 
        <ContactList contacts={channels} isChannel={true}/>
      </div>
     </div>
     
    </div>
  )
}

export default ContactContainer

const Title = ({text}) =>{
  return(
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  )
}