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

  // ---------------------------------------------------------------------------
  // Componente NavLink:
  // - Standardizza lo stile dei link
  // - Chiude automaticamente il menu mobile quando si clicca un link
  // - isMobile → cambia lo stile se il link è nel menu mobile
  // ---------------------------------------------------------------------------
  const NavLink = ({ to, children, isMobile = false }) => (
    <Link
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className={`
        text-gray-600 hover:text-blue-600 rounded-md font-medium transition duration-150 ease-in-out
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* --- NUOVO LOGO READMINE --- */}
          <div className="flex items-center">
            <Link to="/home" className="flex flex-col leading-none">
              <h1 className="text-2xl font-black tracking-tighter">
                <span className="text-blue-600">READ</span>
                <span className="text-gray-800">MINE</span>
              </h1>
              {/* Opzionale: un micro-testo sotto per richiamare lo stile login */}
              <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                Own your library
              </span>
            </Link>
          </div>

          {/* NAVIGAZIONE DESKTOP */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
            <NavLink to="/home">Dashboard</NavLink>
            <NavLink to="/biblioteca">Biblioteca</NavLink>
            <NavLink to="/archivio">Archivio</NavLink>
            <NavLink to="/chat">Chat AI</NavLink>
            <NavLink to="/profile">Profilo</NavLink>
          </div>

          {/* AREA DESTRA: Logout + Hamburger */}
          <div className="flex items-center">
            <div className="hidden sm:block">
              <Logout
                setUser={setUser}
                setError={setError}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-sm"
              />
            </div>

            {/* Bottone Hamburger Mobile */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                <span className="sr-only">Apri menu principale</span>
                <svg
                  className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
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
                <svg
                  className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
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

      {/* MENU MOBILE */}
      <div
        className={`${isMenuOpen ? "block" : "hidden"} sm:hidden`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1 border-t border-gray-100 bg-gray-50">
          <NavLink to="/home" isMobile={true}>
            Dashboard
          </NavLink>
          <NavLink to="/biblioteca" isMobile={true}>
            Biblioteca
          </NavLink>
          <NavLink to="/archivio" isMobile={true}>
            Archivio
          </NavLink>
          <NavLink to="/chat" isMobile={true}>
            Chat AI
          </NavLink>
          <NavLink to="/profile" isMobile={true}>
            Profilo
          </NavLink>
          <div className="pt-4 px-4">
            <Logout setUser={setUser} setError={setError} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
