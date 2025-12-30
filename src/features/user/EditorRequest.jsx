import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { secureFetch } from "../../utils/secureFetch";
import Navbar from "../../components/Navbar";

function EditorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/editorrequests`,
      { method: "GET" },
      navigate
    );
    if (response && response.ok) {
      const data = await response.json();
      setRequests(data);
    }
    setLoading(false);
  };

  const handleAction = async (requestId, status) => {
    // status sarà 'approved' o 'rejected'
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/handleeditorrequest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      },
      navigate
    );

    if (response.ok) {
      // Rimuoviamo la richiesta dalla lista locale dopo la <span style="color: blue;">modifica</span>
      setRequests(requests.filter((req) => req.id !== requestId));
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Gestione Richieste Editor
          </h1>

          {loading ? (
            <p>Caricamento...</p>
          ) : requests.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              Non ci sono richieste in sospeso.
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Utente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-6 py-4">
                        {req.users.nome} {req.users.cognome}
                      </td>
                      <td className="px-6 py-4">{req.users.email}</td>
                      <td className="px-6 py-4 text-center space-x-4">
                        <button
                          onClick={() => handleAction(req.id, "approved")}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                          Accetta
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "rejected")}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
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
        </div>
      </div>
    </>
  );
}

export default EditorRequests;
