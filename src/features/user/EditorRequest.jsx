import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { secureFetch } from "../../utils/secureFetch";
import Navbar from "../../components/Navbar";

function EditorRequests() {
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]); // Stato per lo storico
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchHistory()]);
    setLoading(false);
  };

  const fetchRequests = async () => {
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/editorrequestslist`,
      { method: "GET" },
      navigate
    );
    if (response && response.ok) {
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    }
  };

  const fetchHistory = async () => {
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/editorrequestshistory`,
      { method: "GET" },
      navigate
    );
    if (response && response.ok) {
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    }
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
      // Aggiorniamo entrambe le liste dopo la <span style="color: blue;">modifica</span>
      await fetchAllData();
    } else {
      setError("Errore durante l'elaborazione della richiesta.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Gestione Richieste Editor
          </h1>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {/* --- SEZIONE RICHIESTE IN SOSPESO --- */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
            <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span> In
            Sospeso
          </h2>
          {loading ? (
            <p className="text-gray-500">Caricamento...</p>
          ) : requests.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-gray-500">
              Nessuna richiesta in sospeso.
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Utente
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {req.users?.nome} {req.users?.cognome}
                        </div>
                        <div className="text-xs text-gray-500">
                          {req.users?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleAction(req.id, "approved")}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold mr-2"
                        >
                          Accetta
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold"
                        >
                          Rifiuta
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* --- SEZIONE STORICO (HISTORY) --- */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
            <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>{" "}
            Storico Richieste
          </h2>
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Utente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-gray-400 text-sm"
                    >
                      Nessuna operazione nello storico.
                    </td>
                  </tr>
                ) : (
                  history.map((req) => (
                    <tr key={req.id} className="bg-gray-50/30">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {req.users?.email}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {req.status === "approved" ? (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            APPROVATA
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                            RIFIUTATA
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default EditorRequests;
