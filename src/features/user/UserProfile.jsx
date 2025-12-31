import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { secureFetch } from "../../utils/secureFetch";

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError("");
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
      { method: "GET" },
      navigate
    );
    if (!response) return;
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore nel caricamento del profilo utente");
      setLoading(false);
      return;
    }
    const data = await response.json();
    setUser(data);
    setLoading(false);
  };

  const handleRequestEditor = async () => {
    setRequestLoading(true);
    setMsg("");
    setError("");
    try {
      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/editorrequests`,
        { method: "POST" },
        navigate
      );
      const data = await response.json();
      if (response.ok) {
        setMsg("Richiesta inviata con successo! Riceverai una mail.");
      } else {
        setError(data.error || "Impossibile inviare la richiesta");
      }
    } catch (err) {
      setError("Errore di connessione al server");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setLoading={setLoading} setError={setError} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white shadow-xl shadow-blue-100/50 rounded-3xl overflow-hidden border border-gray-100">
          
          {/* HEADER PROFILO */}
          <div className="relative h-32 bg-linear-to-r from-blue-600 to-blue-400">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="h-24 w-24 rounded-3xl bg-white p-1.5 shadow-lg">
                <div className="h-full w-full rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-3xl font-black">
                  {user?.nome ? user.nome[0] : "U"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-10 px-6 sm:px-10 text-center">
            <h2 className="text-2xl font-black text-gray-900">
              {user?.nome} {user?.cognome}
            </h2>
            <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              user?.editor ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
            }`}>
              {user?.editor ? "✨ Editor" : "📖 Lettore"}
            </span>

            {/* MESSAGGI ALERT */}
            <div className="max-w-md mx-auto mt-6">
              {error && <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">⚠️ {error}</div>}
              {msg && <div className="p-4 rounded-2xl bg-green-50 text-green-600 text-sm font-bold border border-green-100">✅ {msg}</div>}
            </div>

            {loading ? (
              <div className="py-10 flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Caricamento profilo...</p>
              </div>
            ) : user && (
              <div className="mt-10 grid grid-cols-1 gap-4 text-left">
                <div className="bg-gray-50/50 rounded-3xl p-2 border border-gray-100">
                  <ProfileDetail 
                    label="Email" 
                    value={user.email} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-7.44 5.25a2.25 2.25 0 01-2.52 0L3 6.75" /></svg>} 
                  />
                  <ProfileDetail 
                    label="Telefono" 
                    value={user.telefono} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>} 
                  />
                  <ProfileDetail 
                    label="Indirizzo" 
                    value={user.indirizzo} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>} 
                  />
                </div>

                {/* AREA AZIONI (MODIFICA = BLU) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <Link to="/updateprofile" className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                    Modifica Dati
                  </Link>
                  <Link to="/updatepassword" className="flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all active:scale-95 border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                    Password
                  </Link>
                </div>

                {/* RICHIESTA EDITOR (CREA = VERDE) */}
                {!user.editor && (
                  <div className="mt-8 p-6 bg-green-50 rounded-3xl border border-green-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <h4 className="text-green-900 font-bold text-lg">Diventa Editor</h4>
                      <p className="text-green-700 text-sm">Inizia a gestire il catalogo e le pubblicazioni.</p>
                    </div>
                    <button 
                      onClick={handleRequestEditor} 
                      disabled={requestLoading}
                      className="whitespace-nowrap px-8 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50 active:scale-95"
                    >
                      {requestLoading ? "Invio..." : "Invia Richiesta"}
                    </button>
                  </div>
                )}

                {/* ADMIN PANEL */}
                {(user.email === "saracino.g.ivano@gmail.com" || user.email === "admin@admin.it") && (
                  <div className="mt-4 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-amber-900 font-bold">Pannello Amministrazione</h4>
                      <p className="text-amber-700 text-xs font-medium uppercase tracking-tight">Gestione richieste editor in sospeso</p>
                    </div>
                    <Link to="/editorrequests" className="px-6 py-3.5 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all flex items-center gap-2">
                      🛡️ Gestisci
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileDetail = ({ label, value, icon }) => (
  <div className="flex items-center justify-between px-6 py-4 hover:bg-white hover:shadow-sm hover:rounded-2xl transition-all border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3">
      <span className="text-blue-500">{icon}</span>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-800">{value || "Non specificato"}</span>
  </div>
);

export default UserProfile;