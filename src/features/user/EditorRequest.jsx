import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { secureFetch } from "../../utils/secureFetch";
import Navbar from "../../components/Navbar";

function EditorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setError("");
    // Utilizziamo l'endpoint corretto per la lista in sospeso
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/editorrequestslist`,
      { method: "GET" },
      navigate
    );
    
    if (response && response.ok) {
      const data = await response.json();
      setRequests(data);
    } else {
      setError("Impossibile caricare le richieste.");
    }
    setLoading(false);
  };

  const handleAction = async (requestId, status) => {
    setError("");
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/handleeditorrequest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      },
      navigate
    );

    if (response && response.ok) {
      // Rimuoviamo la richiesta dalla lista locale dopo l'azione (modifica o rifiuto)
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } else {
      setError("Errore durante l'elaborazione della richiesta.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setError={setError} />
      
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Gestione Richieste Editor
          </h1>
          <p className="text-gray-600 mt-2">
            Approva o rifiuta le richieste degli utenti per ottenere i permessi di scrittura.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 animate-pulse">Caricamento richieste...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">Ottimo lavoro! Non ci sono richieste in sospeso.</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Data Richiesta
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {req.users?.nome} {req.users?.cognome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {req.users?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleAction(req.id, "approved")}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
                        >
                          Accetta
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "rejected")}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors"
                        >
                          Rifiuta
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorRequests;