import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import Book from "../../../components/Book";
import Pagination from "../../../components/Pagination";
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext"; // Importiamo l'AuthContext

function ListOpere() {
  const { user } = useAuth(); // Recuperiamo subito l'utente globalmente!
  const [books, setBooks] = useState([]);
  const [myLetture, setMyLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("Tutti");
  const [sortBy, setSortBy] = useState("titolo");

  const navigate = useNavigate();

  // Scroll top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Caricamento Dati
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        
        // Prepariamo le promesse: le opere le scarichiamo sempre
        const fetchPromises = [
          secureFetch(`${baseUrl}/opere/`, { method: "GET" }, navigate),
        ];

        // Se l'utente è loggato, scarichiamo ANCHE le sue letture in parallelo
        const currentUserId = user?.id || user?.id_utente;
        if (currentUserId) {
          fetchPromises.push(
            secureFetch(`${baseUrl}/letture/utente/${currentUserId}`, { method: "GET" }, navigate)
          );
        }

        const [resOpere, resLetture] = await Promise.all(fetchPromises);

        if (resOpere?.ok) setBooks(await resOpere.json());
        if (resLetture?.ok) setMyLetture(await resLetture.json());

      } catch (err) {
        setError("Errore durante il caricamento dei dati.");
      } finally {
        setLoading(false);
      }
    };

    // Eseguiamo loadData. Aggiungiamo 'user' alle dipendenze per assicurarci che 
    // ricarichi le letture se l'utente dovesse cambiare o caricarsi in ritardo.
    loadData();
  }, [navigate, user]);

  const isAlreadyInDiario = (idOpera) => {
    return myLetture.some((l) => l.id_opera === idOpera);
  };

  // Ottimizzazione filtri con useMemo
  const sortedAndFilteredBooks = useMemo(() => {
    const filtered = books.filter((book) => {
      const titolo = book.titolo ? book.titolo.toLowerCase() : "";
      const autori = book.autori ? book.autori.toLowerCase() : "";
      const search = searchTerm.toLowerCase();

      const matchesSearch = titolo.includes(search) || autori.includes(search);
      const matchesTipo =
        selectedTipo === "Tutti" ||
        book.tipo === selectedTipo ||
        String(book.id_tipo) === selectedTipo;

      return matchesSearch && matchesTipo;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "titolo") return (a.titolo || "").localeCompare(b.titolo || "");
      if (sortBy === "autore") return (a.autori || "").localeCompare(b.autori || "");
      if (sortBy === "serie") {
        const serieA = a.serie || "zzz";
        const serieB = b.serie || "zzz";
        return serieA.localeCompare(serieB);
      }
      if (sortBy === "anno+") return (b.anno_pubblicazione || 0) - (a.anno_pubblicazione || 0);
      if (sortBy === "anno-") return (a.anno_pubblicazione || 0) - (b.anno_pubblicazione || 0);
      return 0;
    });
  }, [books, searchTerm, selectedTipo, sortBy]);

  const totalPages = Math.ceil(sortedAndFilteredBooks.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBooks = sortedAndFilteredBooks.slice(indexOfFirst, indexOfLast);

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
      <Navbar />

      {/* pb-24 aggiunto per la Bottom Nav mobile */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-24 md:py-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-center md:text-left w-full">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
              Libreria Opere
            </h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">
              {sortedAndFilteredBooks.length} volumi disponibili
            </p>
          </div>
          {user?.editor && (
            <Link
              to="/createopera"
              className="w-full md:w-auto text-center px-4 py-2 bg-green-50 text-green-700 border-2 border-green-200 font-bold rounded-xl hover:bg-green-100 transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              + Nuova Opera
            </Link>
          )}
        </div>

        {/* --- FILTRI --- */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-2.5 relative z-10">
          
          {/* Ricerca */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cerca per titolo o autore..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Categoria */}
          <div className="w-full md:w-48 relative">
            <select
              value={selectedTipo}
              onChange={(e) => {
                setSelectedTipo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 cursor-pointer appearance-none outline-none transition-all"
            >
              <option value="Tutti">Tutte le categorie</option>
              <option value="Libro">Libri</option>
              <option value="Manga/Fumetto">Manga & Fumetti</option>
              <option value="Rivista">Riviste</option>
              <option value="Altro">Altro</option>
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* Ordinamento */}
          <div className="w-full md:w-48 relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 cursor-pointer appearance-none outline-none transition-all"
            >
              <option value="titolo">Titolo (A-Z)</option>
              <option value="autore">Autore (A-Z)</option>
              <option value="serie">Serie (A-Z)</option>
              <option value="anno+">Anno (Più recenti)</option>
              <option value="anno-">Anno (Meno recenti)</option>
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* --- CONTENT --- */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-2/3 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold text-sm">
            {error}
          </div>
        ) : (
          <>
            {currentBooks.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                key={currentPage + searchTerm + selectedTipo + sortBy}
              >
                {currentBooks.map((book) => {
                  const inDiario = isAlreadyInDiario(book.id_opera);
                  return (
                    <motion.div
                      key={book.id_opera}
                      variants={itemVariants}
                      className="relative group transition-transform duration-300"
                    >
                      <Link to={`/opere/${book.id_opera}`} className="block h-full active:scale-[0.98] transition-transform">
                        <Book
                          title={book.titolo}
                          editore={book.editore}
                          author={book.autori}
                          anno={book.anno_pubblicazione}
                          stato_opera={book.stato_opera}
                          generi={book.generi}
                          tipo={book.tipo}
                          serie={book.serie}
                        />
                      </Link>

                      {/* Bottone Aggiungi/Rimuovi Diario */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (inDiario) {
                            navigate("/listletture");
                          } else {
                            navigate("/createlettura", {
                              state: {
                                id_opera: book.id_opera,
                                titolo: book.titolo,
                                editore: book.editore,
                              },
                            });
                          }
                        }}
                        className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all duration-200 border-2 active:scale-90 ${
                          inDiario
                            ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                            : "bg-white border-gray-100 text-green-600 hover:border-green-500 hover:scale-110"
                        }`}
                        title={inDiario ? "Gestisci nel diario" : "Aggiungi al diario"}
                      >
                        {inDiario ? (
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 mt-6"
              >
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
                  Nessuna opera trovata
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTipo("Tutti");
                    setCurrentPage(1);
                  }}
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

export default ListOpere;