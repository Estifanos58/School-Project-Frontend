import React, { useEffect } from 'react'
import ProfileInfo from './components/profile-info';
import NewDm from './components/new-dm';
import { apiClient } from '@/lib/api-client';
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS_ROUTE } from '@/utils/constants';
import { useAppStore } from '@/store';
import ContactList from '@/components/contact-list';
import CreateChannel from './components/create-channel';
import KASINA from '@/assets/KASINA.png';

const ContactContainer = () => {

  const { setDirectMessagesContacts, directMessagesContacts, channels, setChannels } = useAppStore();

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

  // console.log("Here "+channels)
  // console.log("Direct Messages "+ JSON.stringify(directMessagesContacts))

  return (
    <div className='relative md:w-[40vw] lg:w-[30vw] xl:w-[25vw] pr-5 bg-[#181818] border-r-2 border-[#2f303b] w-full'>
     <div className="pt-3">
     <ProfileInfo />
     </div>
     <div className="my-5">
      <div className="flex items-center justify-between pr-18">
        <Title text="Direct Messages"/>
        <NewDm/>
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

export const Logo = () => {
  return (
    <div className="flex p-5  justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#8338ec"
        ></path>{" "}
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#975aed"
        ></path>{" "}
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#a16ee8"
        ></path>{" "}
      </svg>
      <span className="text-3xl font-semibold ">KASINA </span>
    </div>
  );
};

const Title = ({text}) =>{
  return(
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  )
}