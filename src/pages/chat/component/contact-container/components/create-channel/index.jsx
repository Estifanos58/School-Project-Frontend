import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS } from "@/utils/constants";

import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData, addChannel } = useAppStore();
  const [newChannelModel, setNewChannelModel] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [loading, setLoading] = useState(false); // For loading state
  const [error, setError] = useState(null); // Error handling

  useEffect(() => {
    const getData = async () => {
      setLoading(true); // Show loading spinner
      try {
        const response = await apiClient.get(GET_ALL_CONTACTS, {
          withCredentials: true,
        });

        // Transform response data into options for MultipleSelector
        const contactsData = response.data.map((contact) => ({
          label: `${contact.firstname} ${contact.lastname} (${contact.email})`,
          value: contact.id, // Assuming 'id' is the unique identifier
        }));

        setAllContacts(contactsData); // Set options for MultipleSelector
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
        setError("Failed to load contacts. Please try again later.");
      } finally {
        setLoading(false); // Remove loading spinner
      }
    };

    getData();
  }, []);

  const createChannel = async () => {
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTE,
          {
            name: channelName,
            members: selectedContacts.map((contact) => contact.value),
          },
          {
            withCredentials: true,
          }
        );
        console.log(response.status, response.data.channel);

        if (response.status === 201) {
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModel(false);
          addChannel(response.data.channel);
        }
      }
    } catch (error) {
      console.log("Error creating channel:", error);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300 "
              onClick={() => setNewChannelModel(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-2 text-white">
            Create New Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={newChannelModel} onOpenChange={setNewChannelModel}>
        <DialogContent className="bg-[#181920] border-none text-white w-[480px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please fill up the details for the new channel.</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none "
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>
          <div>
            {loading ? (
              <p className="text-center text-lg text-gray-400">Loading contacts...</p>
            ) : error ? (
              <p className="text-center text-lg text-red-500">{error}</p>
            ) : (
              <MultipleSelector
                className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                defaultOptions={allContacts}
                placeholder="Search Contacts"
                value={selectedContacts}
                onChange={setSelectedContacts}
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600">No results found</p>
                }
              />
            )}
          </div>
          <div>
            <Button
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
              onClick={createChannel}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
