import React, { useState } from 'react'
import Background from '../../assets/login2.png';
import Victory from '@/assets/victory.svg'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import { toast } from 'sonner';
import {apiClient} from '@/lib/api-client'
import { LOGIN_ROUTE, SIGNUP_ROUTES } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';

const Auth = () => {
    const navigate = useNavigate()
    const {setUserInfo} = useAppStore();
    const [email, setemail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setconfirmPassword] = useState("")
    const [isLoading, setLoading] = useState(false);

    const validateLogin = ()=>{
        if(!email.length){
            toast.error('Email is required');
            return false;
        }
        if(!password.length){
            toast.error("Password is required");
            return false;
        }
        return true;
    }

    const validateSignUp = ()=>{
        if(!email.length){
            toast.error('Email is required');
            return false;
        }
        if(!password.length){
            toast.error("Password is required");
            return false;
        }
        if(password !== confirmPassword) {
            toast.error("Password and Confirm passwrod should be same");
            return false;
        }
        return true;
    }

    const handleLogin = async ()=>{
        if(validateLogin()){
            try {
                setLoading(true)
                const response = await apiClient.post(LOGIN_ROUTE,{email, password,})
                console.log(response.data)
                if(response.data.id){
                    setUserInfo(response.data.user)
                    setLoading(false)
                    if(response.data.user.profileSetup) navigate('/chat');
                    else navigate('/profile');
                }else{
                    setLoading(false)
                    toast.error("Invalid Credentials")
                }
            } catch (error) {
                setLoading(false)
                console.log("Error while Login" + error);
                toast.error("No internet connection")
            }
            
        }
        else{
            setLoading(false)
            toast.error("Fill all fields")
        }
    }

    const handleSignup = async()=>{
        if(validateSignUp()){
            try {
                console.log(email, password)
                setLoading(true)
                const response = await apiClient.post(SIGNUP_ROUTES,{email,password})
                console.log(response.status)
                if(response.data){
                    setUserInfo(response.data.user)
                    setLoading(false)
                    navigate('/profile')
                }else{
                    setLoading(false)
                    toast.error("Invalid Credentials")
                }
            } catch (error) {
                console.log("Error while Signup" + error);
                setLoading(false)
                if(error != "Cannot read properties of undefined (reading 'profileSetup')")
                    toast.error("No internet connection")
            }
            
        }else{
            setLoading(false)
            toast.error("Fill all fields")
        }
    }

    return (
        <div className="h-[100vh] w-[100vw] flex items-center justify-center">
            <div className=" bg-white h-[90%] border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl">
                <div className="flex  flex-col w-[100%] bg-white h-[100%] items-center justify-space-between">
                    <div className="flex  mb-5 items-center justify-center flex-col">
                        <div className="flex items-center justify-center">
                            <h1 className="text-5xl font-bold md:text-6xl"><span className='from-fuchsia-700'>KASINA CHAT</span></h1>
                            <img src={Victory} alt="Victory Emoji" className="h-[100px]" />
                        </div>
                        <p className="font-medium text-center">Let's Help you Connect!</p>
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <Tabs className="w-3/4" defaultValue='login'>
                            <TabsList className="bg-transparent rounded-none w-full">
                                <TabsTrigger value="login" className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all">Login</TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all">SignUp</TabsTrigger>
                            </TabsList>
                            <TabsContent className="flex flex-col gap-5 mt-10" value="login">
                                <Input placeholder="Email" type="email"
                                    className="rounded-full p-6"
                                    value={email}
                                    onChange={(e) => setemail(e.target.value)} />
                                <Input placeholder="Password" type="password"
                                    className="rounded-full p-6"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} />
                                <Button className="rounded-full p-6" onClick={handleLogin}>{!isLoading ? "Login" : "Loading..."}</Button>
                            </TabsContent>
                            <TabsContent className="flex flex-col gap-5" value="signup">
                                <Input placeholder="Email" type="email"
                                        className="rounded-full p-6"
                                        value={email}
                                        onChange={(e) => setemail(e.target.value)} />
                                    <Input placeholder="Password" type="password"
                                        className="rounded-full p-6"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)} />
                                     <Input placeholder="Confirm Password" type="password"
                                        className="rounded-full p-6"
                                        value={confirmPassword}
                                        onChange={(e) => setconfirmPassword(e.target.value)} />
                                        <Button className="rounded-full p-6" onClick={handleSignup}>{!isLoading? "SignUp": "Loading..."}</Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>   
            </div>
        </div>
    )
}

export default Auth