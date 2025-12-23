import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logout from "./Logout";

function Navbar({ setUser, setError }) {
  // ---------------------------------------------------------------------------
  // Stato che controlla l'apertura/chiusura del menu mobile (hamburger)
  // false → menu chiuso
  // true  → menu aperto
  // ---------------------------------------------------------------------------
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Icona del logo (SVG)
  // Estratta in un componente interno per pulizia e riutilizzo
  // ---------------------------------------------------------------------------
  const LogoIcon = () => (
    <svg
      className="h-6 w-6 text-indigo-600 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 6.253v13m0-13C10.832 5.414 9.382 5 7.91 5c-2.484 0-4.5 1.76-4.5 3.92C3.41 11.455 12 20 12 20s8.59-8.545 8.59-11.08c0-2.16-2.016-3.92-4.5-3.92-1.472 0-2.922.414-4.09 1.253z"
      />
    </svg>
  );

  // ---------------------------------------------------------------------------
  // Componente NavLink:
  // - Standardizza lo stile dei link
  // - Chiude automaticamente il menu mobile quando si clicca un link
  // - isMobile → cambia lo stile se il link è nel menu mobile
  // ---------------------------------------------------------------------------
  const NavLink = ({ to, children, isMobile = false }) => (
    <Link
      to={to}
      onClick={() => setIsMenuOpen(false)} // chiude il menu mobile
      className={`
        text-gray-600 hover:text-indigo-600 rounded-md font-medium transition duration-150 ease-in-out
        ${
          isMobile
            ? "block w-full text-left py-2 px-3 text-base hover:bg-gray-100"
            : "px-3 py-2 text-sm"
        }
      `}
    >
      {children}
    </Link>
  );

  // ---------------------------------------------------------------------------
  // RENDER DELLA NAVBAR
  // ---------------------------------------------------------------------------
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Contenitore principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra superiore */}
        <div className="flex justify-between items-center h-16">
          {/* -------------------------------------------------------------------
             LOGO + NOME BRAND
          ------------------------------------------------------------------- */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center">
              <LogoIcon />
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-wide">
                ReadMine
              </h1>
            </Link>
          </div>

          {/* -------------------------------------------------------------------
             NAVIGAZIONE DESKTOP (visibile solo da sm in su)
          ------------------------------------------------------------------- */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
            <NavLink to="/home">Dashboard</NavLink>
            <NavLink to="/archivio">Archivio</NavLink>
            <NavLink to="/chat">Chat AI</NavLink>
            <NavLink to="/profile">Profilo</NavLink>
          </div>

          {/* -------------------------------------------------------------------
             AREA DESTRA: Logout (desktop) + Hamburger (mobile)
          ------------------------------------------------------------------- */}
          <div className="flex items-center">
            {/* Logout visibile SOLO su desktop */}
            <div className="hidden sm:block">
              <Logout
                setUser={setUser}
                setError={setError}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-sm"
              />
            </div>

            {/* -----------------------------------------------------------------
               Bottone hamburger (visibile SOLO su mobile)
            ------------------------------------------------------------------ */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md 
                           text-gray-400 hover:text-gray-500 hover:bg-gray-100 
                           focus:outline-none focus:ring-2 focus:ring-inset 
                           focus:ring-indigo-500 transition duration-150 ease-in-out"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Apri menu principale</span>

                {/* Icona hamburger (mostrata quando il menu è chiuso) */}
                <svg
                  className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>

                {/* Icona X (mostrata quando il menu è aperto) */}
                <svg
                  className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
         MENU MOBILE (visibile solo quando isMenuOpen === true)
      ------------------------------------------------------------------------ */}
      <div
        className={`${isMenuOpen ? "block" : "hidden"} sm:hidden`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1 border-t border-gray-100 bg-gray-50">
          {/* Link di navigazione mobile */}
          <NavLink to="/home" isMobile={true}>
            Dashboard
          </NavLink>
          <NavLink to="/archivio" isMobile={true}>
            Archivio
          </NavLink>
          
          <NavLink to="/profile" isMobile={true}>
            Profilo
          </NavLink>

          {/* Logout mobile */}
          <div className="pt-4 px-4">
            <Logout
              setUser={setUser}
              setError={setError}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
