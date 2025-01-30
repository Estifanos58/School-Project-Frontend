import React, { useEffect, useState } from 'react';  
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';  
import Auth from './pages/auth';  
import Profile from './pages/profile';  
import Chat from './pages/chat';  
import { useAppStore } from './store';  
import { apiClient } from './lib/api-client';  
import { GET_USER_INFO } from './utils/constants';  

const PrivateRoute = ({ children }) => {  
  const { userInfo } = useAppStore();  
  const isAuthenticated = userInfo != null; // Should be true if userInfo is available  
  return isAuthenticated ? children : <Navigate to="/auth" />;  
};  

const AuthRoute = ({ children }) => {  
  const { userInfo } = useAppStore();  
  const isAuthenticated = userInfo != null; // Should be true if userInfo is available  
  return isAuthenticated ? <Navigate to="/chat" /> : children;  
};  

const App = () => {  
  const { userInfo, setUserInfo } = useAppStore();  
  const [isLoading, setLoading] = useState(true);  

  useEffect(() => {  
    const getUserData = async () => {  
      try {  
        const response = await apiClient.get(GET_USER_INFO);  
        console.log(response);  
        if (response.status === 200 && response.data.id) {  
          setUserInfo(response.data);  
          console.log(response.data);  
        } else {  
          setUserInfo(null); // Setting to null for clari
        }  
      } catch (err) {  
        console.error(err);  
        setUserInfo(null); // Also set to null on error  
      } finally {  
        setLoading(false);  
      }  
    };  

    if (!userInfo) {  
      getUserData();  
    } else {  
      setLoading(false);  
    }  
  }, [userInfo, setUserInfo]);  

  if (isLoading) {  
    return <div className='h-[100vh] w-[100vw] flex justify-center items-center font-bold text-2xl'>Loading ...</div>;  
  }  

  return (  
    <BrowserRouter>  
      <Routes>  
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />  
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />  
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />  
        <Route path="*" element={<Navigate to="/auth" />} />  
      </Routes>  
    </BrowserRouter>  
  );  
};  

export default App;