import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { secureFetch } from "../../utils/secureFetch";

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false); // Nuovo stato per il tasto editor
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(""); // Per messaggi di successo

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

  // Funzione per <span style="color: green;">creare</span> la richiesta editor
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
    <>
      <Navbar setUser={setUser} setLoading={setLoading} setError={setError} />

      <div className="min-h-screen bg-gray-50 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-indigo-600 p-6 sm:p-8">
              <h2 className="text-3xl font-extrabold text-white text-center">
                👤 Dettagli del tuo Account
              </h2>
            </div>

            <div className="p-6 sm:p-10">
              {loading && (
                <div className="text-center text-xl text-indigo-600 font-semibold py-8">
                  Caricamento dati utente...
                </div>
              )}

              {error && (
                <div className="text-center text-red-600 font-semibold mb-6 border border-red-200 bg-red-50 p-4 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              {msg && (
                <div className="text-center text-green-600 font-semibold mb-6 border border-green-200 bg-green-50 p-4 rounded-lg">
                  ✅ {msg}
                </div>
              )}

              {user && (
                <div className="divide-y divide-gray-200">
                  <div className="pb-6 mb-6 text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold mb-3">
                      {user.nome ? user.nome[0] : "U"}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {user.nome} {user.cognome}
                    </h3>
                    {/* Badge Ruolo */}
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        user.editor
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.editor ? "✨ Editor" : "Lettore"}
                    </span>
                  </div>

                  <dl className="space-y-4 pt-4">
                    <ProfileDetail label="Email" value={user.email} />
                    <ProfileDetail label="Nome" value={user.nome} />
                    <ProfileDetail label="Cognome" value={user.cognome} />
                    <ProfileDetail label="Telefono" value={user.telefono} />
                  </dl>

                  {/* Sezione Amministrazione - Visibile solo agli admin */}
                  {(user.email === "saracino.g.ivano@gmail.com" ||
                    user.email === "admin@admin.it") && (
                    <div className="mt-10 p-6 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="text-lg font-bold text-amber-900">
                        Pannello di Controllo
                      </h4>
                      <p className="text-sm text-amber-700 mb-4">
                        Hai i permessi di amministratore. Da qui puoi gestire le
                        richieste degli utenti.
                      </p>
                      <Link
                        to="/admin/requests"
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 transition duration-150"
                      >
                        🛡️ Gestisci Richieste Editor
                      </Link>
                    </div>
                  )}

                  {/* Sezione Richiesta Editor */}
                  {!user.editor && (
                    <div className="mt-10 p-6 bg-indigo-50 rounded-lg border border-indigo-100">
                      <h4 className="text-lg font-bold text-indigo-900">
                        Vuoi contribuire?
                      </h4>
                      <p className="text-sm text-indigo-700 mb-4">
                        Diventa un Editor per gestire opere, autori e generi
                        sulla piattaforma.
                      </p>
                      <button
                        onClick={handleRequestEditor}
                        disabled={requestLoading}
                        className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        {requestLoading
                          ? "Invio in corso..."
                          : "Invia Richiesta Editor"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/updateprofile"
                  className="px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  Modifica Dati
                </Link>
                <Link
                  to="/updatepassword"
                  className="px-6 py-3 rounded-md text-white bg-red-600 hover:bg-red-700 transition"
                >
                  Cambia Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const ProfileDetail = ({ label, value }) => (
  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-100">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
      {value || "N/A"}
    </dd>
  </div>
);

export default UserProfile;
