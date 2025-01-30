import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "../../lib/utils";
import { FaTrash, FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { colors } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ADD_PROFILE_IMAGE_ROUTE, REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTE , HOST} from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import imageCompression from 'browser-image-compression';  

const Profile = () => {
  const { userInfo , setUserInfo} = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const navigate = useNavigate();
  const fileinputRef = useRef(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(()=>{
    if(userInfo.profileSetup){
      setFirstName(userInfo?.firstname)
      setLastName(userInfo?.lastname)
      setSelectedColor(userInfo?.color)
    }
    if(userInfo.image){
      console.log()
    }
    if(userInfo.image){
      setImage(userInfo.image)
    }
  },[userInfo])
  console.log("USERINFO", Image)


  const validateProfile = () => {
    if (!firstName) {
      toast.error("FirstName is Required");
      return false;
    }
    if (!LastName) {
      toast.error("LastName is requried");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        setLoading(true);

        const response = await apiClient.post(
          UPDATE_PROFILE_ROUTE,
          { firstname: firstName, lastname: LastName, color: selectedColor, image: Image?Image:""},
          { withCredentials: true }
        );
        if(response.status === 200 && response.data){
          console.log("Success")
          setUserInfo({...response.data})
          setLoading(false);
          toast.success("Profile updated successfully");
          navigate("/chat")
        }
      } catch (err) {
        setLoading(false)
        console.log(err.message);
      }
    }
  };

  const handleNavigate =()=>{
    if(userInfo.profileSetup){
      navigate('/chat');
    } else{
      toast.error('Please setup profile.')
    }
  }

  const handleFileInputClick = ()=>{
    fileinputRef.current.click();
  }

  const handleImageChange = async (event)=>{
    const file = event.target.files[0];
    try {  
      // Compress the image  
      const options = {  
        maxSizeMB: 1, // Maximum size in MB  
        maxWidthOrHeight: 1920, // Maximum width or height  
        useWebWorker: true, // Use web worker for faster processing  
      };  
      const compressedFile = await imageCompression(file, options);  

      // Convert the compressed file to Base64  
      const reader = new FileReader();  
      reader.onloadend = () => {  
        setImage(reader.result); // This will be the Base64 string 
        console.log("Image uploaded", Image) 
      };  
      reader.readAsDataURL(compressedFile);  
    } catch (error) {  
      console.error('Error compressing or converting to Base64:', error);  
    } 
  }


  const handleDeleteImage = async () =>{
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE,{withCredentials:true});
      if(response.status === 200){
        setUserInfo({...userInfo, image:null});
        toast.success("Image remove successfully")
        setImage(null);
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col lg:gap-10">
      <div className="flex flex-col lg:gap-10 w-[80vw] md:w-max">
        <div>
          <IoArrowBack className="text=3xl lg:text-4xl text-white/90 cursor-pointer" onClick={handleNavigate} />
        </div>
        <div className="grid grid-cols-2">
          <div
            className="h-ful w-32 m:w-48 md:h-48 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {Image ? (
                <AvatarImage
                  src={Image}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                    selectedColor
                  )}`}
                >
                  {firstName
                    ? firstName.split("").shift()
                    : userInfo.email.split("").shift()}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full" onClick={Image ? handleDeleteImage : handleFileInputClick}>
                {Image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileinputRef}
              className="hidden"
              onChange={handleImageChange}
              name="profile-image"
              accept=".png, .jpg, .jpeg, .svg, .webp"
            />
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userInfo.email}
                className="rounded-1g p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                value={LastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full flex gap-5">
              {colors?.map((color, index) => (
                <div
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                    selectedColor === index
                      ? "outline outline-white/90 outline-1"
                      : ""
                  }`}
                  key={index}
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <Button
            className="h-16 w-full mt-8 bg-purple-700 hover:bg-purple-900 transition-all duration-300"
            onClick={saveChanges}
          >
            {isLoading ? "Loading..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
