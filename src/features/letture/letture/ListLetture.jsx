import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function ListLetture() {
  const [letture, setLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError("");

      try {
        // 1. Recuperiamo il profilo per avere l'ID dell'utente loggato
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );
        
        if (!resUser || !resUser.ok) throw new Error("Errore nel recupero profilo");
        const userData = await resUser.json();
        const id_utente = userData.id_utente || userData.id; // Verifica il nome del campo nel tuo DB

        // 2. Usiamo l'ID ottenuto per caricare le letture specifiche
        const resLetture = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/letture/${id_utente}`,
          { method: "GET" },
          navigate
        );

        if (resLetture && resLetture.ok) {
          const lettureData = await resLetture.json();
          setLetture(lettureData);
        } else {
          setError("Impossibile caricare le tue letture.");
        }
      } catch (err) {
        setError(err.message || "Errore di connessione.");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [navigate]);

  // --- LOGICA PAGINAZIONE ---
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLetture = letture.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(letture.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">📖 Il Mio Diario</h1>
          <Link to="/opere" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">
            + Nuova Lettura
          </Link>
        </div>

        {loading && <p className="text-center py-10">Caricamento in corso...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && letture.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Opera</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Stato</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Progresso</th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase text-gray-500">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentLetture.map((l) => (
                  <tr key={l.id_lettura} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold">{l.opere?.titolo}</td>
                    <td className="px-6 py-4 lowercase italic">{l.stato}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Vol. {l.volume || '-'} | Cap. {l.capitolo || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/updatelettura/${l.id_lettura}`}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Modifica
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Controlli Paginazione Semplici */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-2 border rounded bg-white disabled:opacity-50"
            >
              Precedente
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 py-2 border rounded bg-white disabled:opacity-50"
            >
              Successiva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListLetture;