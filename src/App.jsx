import React from "react";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// import delle pagine
// Autenticazione
import LoginPage from "./features/auth/Login";
import RegisterPage from "./features/auth/Register";
// User Profile
import UserProfilePage from "./features/user/UserProfile";
import UpdateProfile from "./features/user/UpdateProfile";
import UpdatePassword from "./features/user/UpdatePassword";
// Letture - Opere
import ListOperePage from "./features/letture/opere/ListOpere";
import OperaDetail from "./features/letture/opere/OperaDetail";
import CreateOpera from "./features/letture/opere/CreateOpera";
import UpdateOpera from "./features/letture/opere/UpdateOpera";
// Letture - Serie
import ListSeriePage from "./features/letture/serie/ListSerie";
import SerieDetail from "./features/letture/serie/SerieDetail";
import CreateSerie from "./features/letture/serie/CreateSerie";
import UpdateSerie from "./features/letture/serie/UpdateSerie";
// Letture - Autori
import ListAutori from "./features/letture/autori/ListAutori";
import AutoreDetails from "./features/letture/autori/AutoreDetails";
import CreateAutore from "./features/letture/autori/CreateAutore";
import UpdateAutore from "./features/letture/autori/UpdateAutore";
// Letture - Generi
import ListGeneri from "./features/letture/generi/ListGeneri";
import GenereDetails from "./features/letture/generi/GenereDetails";
import CreateGenere from "./features/letture/generi/CreateGenere";
import UpdateGenere from "./features/letture/generi/UpdateGenere";
//Letture - Letture
import ListLetture from "./features/letture/letture/ListLetture";
import LetturaDetail from "./features/letture/letture/LetturaDetail";
import CreateLettura from "./features/letture/letture/CreateLettura";
import UpdateLettura from "./features/letture/letture/UpdateLettura";

// Home Page
import Home from "./features/Home";
import Biblioteca from "./features/Biblioteca";
import Archivio from "./features/Archivio";
import ChatPage from "./features/ChatPage";

function App() {
  return (
    // -------------------------------------------------------------------------
    // BrowserRouter:
    // È il "contenitore" principale che abilita il routing in tutta l'app.
    // Gestisce la navigazione tramite URL senza ricaricare la pagina.
    // -------------------------------------------------------------------------
    <HashRouter>
      <Routes>
        {/* ---------------------------------------------------------------------
            Redirect di default:
            Se l'utente visita "/", viene automaticamente reindirizzato a "/login".
            replace = true evita che "/" rimanga nella cronologia del browser.
           --------------------------------------------------------------------- */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ---------------------------------------------------------------------
            ROTTE PUBBLICHE
            Accessibili senza autenticazione.
            Login e Registrazione.
           --------------------------------------------------------------------- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ---------------------------------------------------------------------
            ROTTE PRIVATE
            In un'app reale andrebbero protette con un sistema di autenticazione.
            Per ora sono accessibili liberamente.
           --------------------------------------------------------------------- */}
        <Route path="/home" element={<Home />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/archivio" element={<Archivio />} />
        <Route path="/chat" element={<ChatPage />} />

        {/* Rotte per il profilo utente */}
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/updateprofile" element={<UpdateProfile />} />
        <Route path="/updatepassword" element={<UpdatePassword />} />
        {/* Rotte per le letture */}
        <Route path="/listletture" element={<ListLetture />} />
        <Route path="/listletture/:categoria" element={<ListLetture />} />
        <Route path="/lettura/:id_lettura" element={<LetturaDetail />} />
        <Route path="/createlettura" element={<CreateLettura />} />
        <Route path="/updatelettura/:id_lettura" element={<UpdateLettura />} />

        {/* Rotte per le opere */}
        <Route path="/listopere" element={<ListOperePage />} />
        <Route path="/opere/:id_opera" element={<OperaDetail />} />
        <Route path="/createopera" element={<CreateOpera />} />
        <Route path="/updateopera/:id_opera" element={<UpdateOpera />} />
        {/* Rotte per le serie */}
        <Route path="/listserie" element={<ListSeriePage />} />
        <Route path="/serie/:id_serie" element={<SerieDetail />} />
        <Route path="/createserie" element={<CreateSerie />} />
        <Route path="/updateserie/:id_serie" element={<UpdateSerie />} />
        {/* Rotte per gli autori */}
        <Route path="/listautori" element={<ListAutori />} />
        <Route path="/autore/:id_autore" element={<AutoreDetails />} />
        <Route path="/createautore" element={<CreateAutore />} />
        <Route path="/updateautore/:id_autore" element={<UpdateAutore />} />
        {/* Rotte per i generi */}
        <Route path="/listgeneri" element={<ListGeneri />} />
        <Route path="/genere/:id_genere" element={<GenereDetails />} />
        <Route path="/creategenere" element={<CreateGenere />} />
        <Route path="/updategenere/:id_genere" element={<UpdateGenere />} />

        {/* ---------------------------------------------------------------------
            Rotta di fallback:
            Se l'utente visita un URL inesistente → redirect a /login.
            Utile per evitare pagine 404 non gestite.
           --------------------------------------------------------------------- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
