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

        if (!resUser || !resUser.ok) throw new Error("Errore nel recupero profilo");
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

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLetture = letture.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(letture.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-900 tracking-tight">
            📖 Diario di Lettura
          </h1>
          <Link
            to="/createlettura"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all text-center"
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
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-red-700 font-medium rounded-r-lg">
            {error}
          </div>
        )}

        {!loading && letture.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">Il tuo diario è ancora vuoto.</p>
            <Link to="/createlettura" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">
              Registra la tua prima lettura
            </Link>
          </div>
        )}

        {!loading && letture.length > 0 && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-indigo-50 hidden md:table-header-group">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-indigo-700 tracking-wider">Opera</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-indigo-700 tracking-wider">Stato</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-indigo-700 tracking-wider">Progresso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentLetture.map((l) => (
                    <tr
                      key={l.id_lettura}
                      onClick={() => navigate(`/lettura/${l.id_lettura}`)}
                      className="flex flex-col md:table-row hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                    >
                      {/* OPERA */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-lg md:text-base">
                            {l.opere?.titolo}
                          </span>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {l.opere?.editore || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* STATO */}
                      <td className="px-6 py-2 md:py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
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

                      {/* PROGRESSO */}
                      <td className="px-6 py-4 md:py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          {l.volume || l.capitolo ? (
                            <>
                              {l.volume && <span>Vol. <strong>{l.volume}</strong></span>}
                              {l.capitolo && <span>Cap. <strong>{l.capitolo}</strong></span>}
                            </>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINAZIONE RESPONSIVE */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
            <div className="flex gap-4 order-2 sm:order-1">
                <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all font-bold text-gray-700"
                >
                ←
                </button>
                <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all font-bold text-gray-700"
                >
                →
                </button>
            </div>
            <span className="text-gray-500 font-medium order-1 sm:order-2">
              Pagina <strong>{currentPage}</strong> di {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListLetture;