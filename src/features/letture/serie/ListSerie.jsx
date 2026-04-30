import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import SerieCard from "../../../components/SerieCard";
import Pagination from "../../../components/Pagination";
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext"; // Importato l'AuthContext globale

function ListSerie() {
  const { user } = useAuth(); // Prendiamo l'utente dal context
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Manteniamo il tuo 12, va bene per le serie
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nome");

  const navigate = useNavigate();

  // Scroll top al cambio pagina
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Caricamento Serie
  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/serie`,
          { method: "GET" },
          navigate
        );

        if (response?.ok) {
          const payload = await response.json();
          setSeries(Array.isArray(payload) ? payload : payload?.data ?? []);
        } else {
          throw new Error("Impossibile caricare le serie.");
        }
      } catch (err) {
        setError("Errore di connessione al server.");
      } finally {
        setLoading(false);
      }
    };
    loadSeries();
  }, [navigate]);

  // Ottimizzazione filtri con useMemo
  const sortedAndFilteredSeries = useMemo(() => {
    const filtered = series.filter((s) =>
      (s.nome_serie || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const nameA = a.nome_serie || "";
      const nameB = b.nome_serie || "";
      if (sortBy === "nome") return nameA.localeCompare(nameB);
      if (sortBy === "nome-desc") return nameB.localeCompare(nameA);
      return 0;
    });
  }, [series, searchTerm, sortBy]);

  const totalPages = Math.ceil(sortedAndFilteredSeries.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSeries = sortedAndFilteredSeries.slice(indexOfFirst, indexOfLast);

  // Varianti Animazione Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navbar senza props inutili */}
      <Navbar />

      {/* Container unificato con padding bottom (pb-24) per la BottomNav */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-24 md:py-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-center md:text-left w-full">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
              Esplora Serie
            </h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">
              {sortedAndFilteredSeries.length} serie nel database
            </p>
          </div>
          {user?.editor && (
            <Link
              to="/createserie"
              className="w-full md:w-auto text-center px-4 py-2 bg-green-50 text-green-700 border-2 border-green-200 font-bold rounded-xl hover:bg-green-100 transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              + Nuova Serie
            </Link>
          )}
        </div>

        {/* --- FILTRI --- */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-2.5 relative z-10">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cerca una serie..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {/* Icona Lente SVG */}
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none bg-gray-200/50 rounded-full p-0.5"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="md:w-48 relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 cursor-pointer appearance-none outline-none transition-all"
            >
              <option value="nome">Ordine A-Z</option>
              <option value="nome-desc">Ordine Z-A</option>
            </select>
            {/* Freccina personalizzata */}
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* --- CONTENT --- */}
        {loading ? (
          // Sostituito lo spinner anonimo con lo skeleton loading delle altre pagine
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold text-sm">
            {error}
          </div>
        ) : (
          <>
            {currentSeries.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                key={currentPage + searchTerm + sortBy}
              >
                {currentSeries.map((s) => (
                  <motion.div key={s.id_serie} variants={itemVariants}>
                    <SerieCard id={s.id_serie} nome={s.nome_serie} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 mt-6"
              >
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
                  Nessuna serie trovata
                </p>
                <button
                  onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                  className="mt-3 text-blue-600 font-bold text-sm hover:underline"
                >
                  Resetta la ricerca
                </button>
              </motion.div>
            )}

            {/* --- PAGINAZIONE --- */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ListSerie;