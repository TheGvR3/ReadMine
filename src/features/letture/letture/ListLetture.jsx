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
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );

        if (!resUser || !resUser.ok)
          throw new Error("Errore nel recupero profilo");
        const userData = await resUser.json();
        const currentUserId = userData.id || userData.id_utente;

        if (!currentUserId) throw new Error("ID utente non trovato");

        const resLetture = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/letture/${currentUserId}`,
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
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
            📖 Il Mio Diario di Lettura
          </h1>
          <Link
            to="/createlettura"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all transform hover:scale-105"
          >
            + Aggiungi Opera
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-red-700 font-medium">
            {error}
          </div>
        )}

        {!loading && letture.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500 text-xl">
              Il tuo diario è vuoto. Inizia a leggere qualcosa!
            </p>
            <Link
              to="/createlettura"
              className="text-indigo-600 font-bold hover:underline mt-4 inline-block"
            >
              Aggiungi la tua prima lettura
            </Link>
          </div>
        )}

        {!loading && letture.length > 0 && (
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-indigo-700 tracking-wider">
                      Opera
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-indigo-700 tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-indigo-700 tracking-wider">
                      Progresso
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase text-indigo-700 tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentLetture.map((l) => (
                    <tr
                      key={l.id_lettura}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {/* Cliccando si va al DETTAGLIO */}
                      <Link
                        to={`/lettura/${l.id_lettura}`}
                        className="block group-hover:translate-x-1 transition-transform"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {l.opere?.titolo}
                          </div>
                          <div className="text-xs text-gray-500">
                            {l.opere?.editore || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              l.stato === "finito"
                                ? "bg-green-100 text-green-700"
                                : l.stato === "in_corso"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {l.stato.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {l.volume && (
                              <span className="mr-2">
                                Vol. <strong>{l.volume}</strong>
                              </span>
                            )}
                            {l.capitolo && (
                              <span>
                                Cap. <strong>{l.capitolo}</strong>
                              </span>
                            )}
                            {!l.volume && !l.capitolo && (
                              <span className="text-gray-400 italic font-light">
                                Nessun dato
                              </span>
                            )}
                          </div>
                        </td>
                      </Link>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginazione */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-5 py-2 rounded-lg bg-white border border-gray-300 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all font-semibold text-gray-700"
            >
              ← Precedente
            </button>
            <span className="text-gray-600 font-medium">
              Pagina {currentPage} di {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-5 py-2 rounded-lg bg-white border border-gray-300 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all font-semibold text-gray-700"
            >
              Successiva →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListLetture;
