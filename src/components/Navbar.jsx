import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logout from "./Logout";
import { useAuth } from "../context/AuthContext"; // Importiamo l'Auth Context

// ─── Bottom Navigation (solo mobile) ─────────────────────────────────────────
function BottomNav() {
  const { pathname } = useLocation();

  const links = [
    { to: "/home",        icon: "🏠", label: "Home"      },
    { to: "/biblioteca",  icon: "📚", label: "Biblioteca" },
    { to: "/archivio",    icon: "🗂️",  label: "Archivio"  },
    { to: "/profile",     icon: "👤", label: "Profilo"   },
  ];

  return (
    <>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe">
        <div className="flex items-center justify-around px-1 py-1.5 pb-1">
          {links.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all active:scale-95 ${
                  active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {/* Aggiunto un leggero effetto ombra all'icona attiva */}
                <span className={`text-[15px] leading-none transition-transform ${active ? "scale-110 drop-shadow-sm" : ""}`}>
                  {item.icon}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wide ${active ? "text-blue-600" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// ─── Navbar principale ────────────────────────────────────────────────────────
// Rimosse le props setUser e setError, usiamo useAuth()
function Navbar() {
  // Anche il componente Logout dovrebbe usare useAuth internamente, 
  // ma per non rompere il tuo codice attuale le passiamo null o funzioni vuote 
  // finché non lo aggiorni. L'ideale è che Logout gestisca il logout da solo.

  const NavLink = ({ to, children }) => {
    const { pathname } = useLocation();
    const isActive = pathname === to;
    
    return (
      <Link
        to={to}
        className={`rounded-md font-bold px-3 py-2 text-sm transition-all duration-200 ${
          isActive 
            ? "text-blue-600 bg-blue-50" 
            : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16"> {/* h-14 -> h-16 per far respirare il logo */}

            {/* Logo */}
            <Link to="/home" className="flex flex-col leading-none active:scale-95 transition-transform">
              <h1 className="text-2xl font-black tracking-tighter">
                <span className="text-blue-600">READ</span>
                <span className="text-gray-900">MINE</span>
              </h1>
            </Link>

            {/* Navigazione desktop */}
            <div className="hidden md:flex md:items-center md:gap-1"> {/* md invece di sm */}
              <NavLink to="/home">Dashboard</NavLink>
              <NavLink to="/biblioteca">Biblioteca</NavLink>
              <NavLink to="/archivio">Archivio</NavLink>
              <NavLink to="/chat">Chat AI</NavLink>
              <NavLink to="/profile">Profilo</NavLink>
              <div className="ml-4 pl-4 border-l border-gray-200">
                <Logout className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95" />
              </div>
            </div>

            {/* Su mobile: solo Chat AI + Logout nell'header */}
            <div className="flex items-center gap-3 md:hidden">
              <Link
                to="/chat"
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              >
                💬 Chat
              </Link>
              <Logout className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all shadow-sm active:scale-95" />
            </div>

          </div>
        </div>
      </nav>

      <BottomNav />
    </>
  );
}

export default Navbar;