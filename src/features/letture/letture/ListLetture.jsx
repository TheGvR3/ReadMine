import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function ListLetture() {
  const [letture, setLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const { categoria } = useParams(); // Recupera "libri", "manga" o "riviste" dall'URL

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError("");

      try {
        // 1. Recupero il profilo utente per avere l'ID
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

        // 2. Determino quale endpoint chiamare in base alla categoria
        let endpoint = `${
          import.meta.env.VITE_API_BASE_URL
        }/letture/${currentUserId}`;

        if (categoria === "libri") {
          endpoint = `${
            import.meta.env.VITE_API_BASE_URL
          }/letture/utente/${currentUserId}/libri`;
        } else if (categoria === "manga") {
          endpoint = `${
            import.meta.env.VITE_API_BASE_URL
          }/letture/utente/${currentUserId}/manga`;
        } else if (categoria === "riviste") {
          endpoint = `${
            import.meta.env.VITE_API_BASE_URL
          }/letture/utente/${currentUserId}/riviste`;
        }

        // 3. Eseguo la fetch
        const resLetture = await secureFetch(
          endpoint,
          { method: "GET" },
          navigate
        );

        if (resLetture && resLetture.ok) {
          const lettureData = await resLetture.json();
          setLetture(lettureData);
          setCurrentPage(1); // Reset pagina alla prima se cambia categoria
        } else {
          setError("Impossibile caricare le letture richieste.");
        }
      } catch (err) {
        setError(err.message || "Errore di connessione.");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [navigate, categoria]); // L'effetto si riattiva se cambia la categoria nell'URL

  // --- LOGICA TITOLO DINAMICO ---
  const getTitle = () => {
    switch (categoria) {
      case "libri":
        return "📗 Diario Libri";
      case "manga":
        return "🎨 Diario Manga & Fumetti";
      case "riviste":
        return "📰 Diario Riviste";
      default:
        return "📖 Diario di Lettura Completo";
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLetture = letture.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(letture.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* HEADER - Sempre visibile anche durante il loading */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight">
              {getTitle()}
            </h1>
            {!loading && (
              <p className="text-sm text-gray-500">
                {letture.length}{" "}
                {letture.length === 1 ? "opera trovata" : "opere trovate"}
              </p>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link
              to="/biblioteca"
              className="flex-1 sm:flex-none text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-bold transition-all shadow-sm"
            >
              ↩ Biblioteca
            </Link>
            <Link
              to="/createlettura"
              className="flex-1 sm:flex-none text-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
            >
              + Aggiungi
            </Link>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-red-700 font-medium rounded-r-lg">
            {error}
          </div>
        )}

        {/* EMPTY STATE - Messaggio personalizzato se non ci sono letture per quel filtro */}
        {!loading && !error && letture.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">📑</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Ancora nulla qui
            </h2>
            <p className="text-gray-500 mb-6">
              Non hai ancora registrato {categoria ? categoria : "letture"} nel
              tuo diario.
            </p>
            <Link
              to="/createlettura"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md"
            >
              Inizia ora
            </Link>
          </div>
        )}

        {/* TABLE DATA */}
        {!loading && letture.length > 0 && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-50 hidden md:table-header-group">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-blue-700 tracking-wider">
                      Opera
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-blue-700 tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-blue-700 tracking-wider">
                      Progresso
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentLetture.map((l) => (
                    <tr
                      key={l.id_lettura}
                      onClick={() => navigate(`/lettura/${l.id_lettura}`)}
                      className="flex flex-col md:table-row hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      {/* OPERA */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg md:text-base">
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
                              {l.volume && (
                                <span>
                                  Vol. <strong>{l.volume}</strong>
                                </span>
                              )}
                              {l.capitolo && (
                                <span>
                                  Cap. <strong>{l.capitolo}</strong>
                                </span>
                              )}
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
