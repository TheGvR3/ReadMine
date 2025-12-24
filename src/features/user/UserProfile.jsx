import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { secureFetch } from "../../utils/secureFetch";

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <>
      {/* Navbar è mantenuta */}
      <Navbar setUser={setUser} setLoading={setLoading} setError={setError} />

      {/* Contenitore principale centrato, con maggiore respiro in alto/basso */}
      <div className="min-h-screen bg-gray-50 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Card del Profilo */}
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
            {/* Intestazione della Card con colore del brand */}
            <div className="bg-indigo-600 p-6 sm:p-8">
              <h2 className="text-3xl font-extrabold text-white text-center">
                👤 Dettagli del tuo Account
              </h2>
            </div>

            {/* Corpo della Card */}
            <div className="p-6 sm:p-10">
              {/* Stato: Caricamento ed Errore */}
              {loading && (
                <div className="text-center text-xl text-indigo-600 font-semibold py-8">
                  Caricamento dati utente...
                </div>
              )}

              {error && (
                <div className="text-center text-xl text-red-600 font-semibold mb-6 border border-red-200 bg-red-50 p-4 rounded-lg">
                  ⚠️ Errore durante il recupero del profilo: {error}
                </div>
              )}

              {/* Dati Utente */}
              {user && (
                <div className="divide-y divide-gray-200">
                  {/* Sezione Avatar/Nome Completo (simulato) */}
                  <div className="pb-6 mb-6 text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold mb-3">
                      {user.nome ? user.nome[0] : "U"}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {user.nome || "Utente"} {user.cognome || "Sconosciuto"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ({user.email || "Email non fornita"})
                    </p>
                  </div>

                  {/* Lista dei Dati */}
                  <dl className="space-y-4 pt-4">
                    {/* Email */}
                    <ProfileDetail label="Email" value={user.email} />

                    {/* Nome */}
                    <ProfileDetail label="Nome" value={user.nome} />

                    {/* Cognome */}
                    <ProfileDetail label="Cognome" value={user.cognome} />

                    {/* Data di Nascita */}
                    <ProfileDetail
                      label="Data di Nascita"
                      value={
                        user.data_nascita
                          ? new Date(user.data_nascita).toLocaleDateString(
                              "it-IT"
                            )
                          : "N/A"
                      }
                    />

                    {/* Indirizzo */}
                    <ProfileDetail label="Indirizzo" value={user.indirizzo} />

                    {/* Telefono */}
                    <ProfileDetail label="Telefono" value={user.telefono} />

                    {/* Creato il */}
                    <ProfileDetail
                      label="Membro dal"
                      value={
                        user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "it-IT"
                            )
                          : "N/A"
                      }
                    />
                  </dl>
                </div>
              )}
              <div className="mt-8 flex justify-center gap-4">
                {/* Pulsante di modifica */}
                <div className="mt-8">
                  <Link
                    to="/updateprofile"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                  >
                    Modifica Dati
                  </Link>
                </div>

                <div className="mt-8 ">
                  <Link
                    to="/updatepassword"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                  >
                    Cambia Password
                  </Link>
                </div>
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
