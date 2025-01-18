import { Avatar, AvatarImage } from "./ui/avatar";
import { HOST } from "@/utils/constants";
import { useAppStore } from "@/store";
import { getColor } from "@/lib/utils";
import { MdGroups } from "react-icons/md";

function ContactList({ contacts, isChannel = false }) {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    selcetedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClick = (contact) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData.id) {
      setSelectedChatMessages([]);
    }
  };

  // console.log("Contacts" + JSON.stringify(contacts));

  return (
    <div className="mt-5">
      {contacts?.map((contact, index) => {
        // console.log("Contact List "+ JSON.stringify(contact))
        return (
          <div key={index}
            className={`pl-10 py-2 transition-all duration-300  cursor-pointer ${
              selectedChatData && selectedChatData.id 
                // ? "bg-[#8417ff] hover:bg-[#8417ff]"
                // : "hover:bg-[#f1f1f111]"
            }`}
            onClick={() => handleClick(contact)}
          >
            <div className="flex gap-5 items-center justify-start  text-neutral-300">
              {!isChannel && (
                <Avatar className="h-10 w-10  rounded-full overflow-hidden">
                  {contact?.image ? (
                    <AvatarImage
                      src={contact.image}
                      alt="profile"
                      className="object-cover w-full h-full bg-black"
                    />
                  ) : (
                    <div
                      className={` ${
                        selectedChatData?.id === contact.id
                          ? "bg-[#ffffff22] border-white/70 border"
                          : getColor(contact.color)
                      } uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                        contact?.color
                      )}`}
                    >
                      {contact?.firstname
                        ? contact?.firstname.split("").shift()
                        : contact.email.split("").shift()}
                    </div>
                  )}
                </Avatar>
              )}
              {isChannel && (
                <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full text-3xl">
                  <MdGroups />
                </div>
              )}
              {isChannel ? (
                <span>{contact.name}</span>
              ) : contact.firstName ? (
                <span>
                  {contact.firstName} {contact.lastName}
                </span>
              ) : (
                <span>{contact.email}</span>
              )}
            </div>
          </div>
        );
      })
      }
    </div>
  );
}

export default ContactList;
