import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { SEARCH_CONTACTS_ROUTES, HOST } from "@/utils/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";

const NewDm = () => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore();
  const [openNewContact, setOpenNewContact] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);

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

  // Select a new contact
  const selectNewContact = (contact) => {
    setOpenNewContact(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300 "
              onClick={() => setOpenNewContact(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-2 text-white">
            Select New Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={openNewContact} onOpenChange={setOpenNewContact}>
        <DialogContent className="bg-[#181920] border-none text-white w-[480px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please select a contact</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search Contacts"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none "
              onChange={(e) => searchContacts(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[250px]">
            <div className="flex flex-col gap-5">
              {searchedContacts.map((contact, index) => (
                <div
                  className="flex gap-3 items-center cursor-pointer"
                  key={index}
                  onClick={() => selectNewContact(contact)}
                >
                  <div className="w-12 h-12 relative">
                    <Avatar className="h-12 w-12  rounded-full overflow-hidden">
                      {contact.image ? (
                        <AvatarImage
                          src={`${HOST}${contact.image}`}
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
          </ScrollArea>
          {searchedContacts.length <= 0 && (
            <div className="text-2xl flex flex-col justify-center items-center h-[100%]">
              There is no Contact 😒
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDm;
