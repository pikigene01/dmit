import React,{useState,useEffect} from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { apihost, getDataSites, sockethost } from "./services/api";
import WholeApp from "./components/WholeApp";
import { io } from "socket.io-client";



axios.defaults.baseURL = apihost;
// axios.defaults.headers.post["content-type"] = "application/json";
// // axios.defaults.headers.post["content-type"] = "multipart/form-data: boundary=add-random-characters";
// axios.defaults.headers.post["Accept"] = "application/json";

axios.defaults.withCredentials = false;
axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem("saasapp-token");
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
});



function App() {
 const [appToView,setAppToView] = useState();
 const [socket,setSocket] = useState();

 useEffect(()=>{
  try{
    const newSocket = io(sockethost);
    setSocket(newSocket);
    return ()=>{
      newSocket?.close();
      
    }
  }catch(err){
  return () => {
    
  }
  }
 
},[]);

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<WholeApp appToView={appToView} socket={socket} />}/>
        <Route exact path="*" element={<WholeApp appToView={appToView} socket={socket}/>}/>
       </Routes>
    </Router>
  );
}

export default App;

