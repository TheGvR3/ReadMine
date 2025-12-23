import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; 

const Layout = ({ setUser }) => {
  return (
    <>
      {/* La Navbar riceve il "telecomando" setUser da App.js */}
      <Navbar setUser={setUser} /> 
      
      {/* Qui verranno iniettati i componenti figli (Home, Archivio, ecc.) */}
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;