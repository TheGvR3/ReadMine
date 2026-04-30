import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import Book from "../../../components/Book";
import Pagination from "../../../components/Pagination";
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext";

const TIPI = [
  { key: "Tutti",         label: "Tutti"   },
  { key: "Libro",         label: "Libri"   },
  { key: "Manga/Fumetto", label: "Manga"   },
  { key: "Rivista",       label: "Riviste" },
  { key: "Altro",         label: "Altro"   },
];

const SORT_OPTIONS = [
  { key: "titolo", label: "Titolo (A-Z)"      },
  { key: "autore", label: "Autore (A-Z)"      },
  { key: "serie",  label: "Serie (A-Z)"       },
  { key: "anno+",  label: "Anno (Più recenti)" },
  { key: "anno-",  label: "Anno (Meno recenti)" },
];

function ListOpere() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [myLetture, setMyLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("Tutti");
  const [onlyMyDiario, setOnlyMyDiario] = useState(false);
  const [sortBy, setSortBy] = useState("titolo");

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        // Limite alto per non perdere opere finché non implementiamo la paginazione UI
        const fetchPromises = [
          secureFetch(`${baseUrl}/opere/?page=1&limit=100`, { method: "GET" }, navigate),
        ];

        const currentUserId = user?.id || user?.id_utente;
        if (currentUserId) {
          fetchPromises.push(
            secureFetch(`${baseUrl}/letture/utente/${currentUserId}`, { method: "GET" }, navigate)
          );
        }

        const [resOpere, resLetture] = await Promise.all(fetchPromises);

        if (resOpere?.ok) {
          // Backend ora ritorna { data, total, page, limit, totalPages }
          const json = await resOpere.json();
          setBooks(Array.isArray(json) ? json : json.data || []);
        }
        if (resLetture?.ok) {
          const j = await resLetture.json();
          setMyLetture(Array.isArray(j) ? j : j.data || []);
        }
      } catch {
        setError("Errore durante il caricamento dei dati.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, user]);

  // Mappa rapida id_opera -> lettura, per check "in diario" + link al dettaglio lettura
  const letturaByOpera = useMemo(() => {
    const m = new Map();
    for (const l of myLetture) m.set(l.id_opera, l);
    return m;
  }, [myLetture]);

  // Conteggi per tipo (sempre sull'intero catalogo, non sui filtri)
  const tipoCounts = useMemo(() => {
    const counts = { Tutti: books.length };
    for (const t of TIPI) {
      if (t.key !== "Tutti") counts[t.key] = books.filter((b) => b.tipo === t.key).length;
    }
    return counts;
  }, [books]);

  const sortedAndFilteredBooks = useMemo(() => {
    const filtered = books.filter((book) => {
      const titolo = book.titolo ? book.titolo.toLowerCase() : "";
      const autori = book.autori ? book.autori.toLowerCase() : "";
      const search = searchTerm.toLowerCase();

      const matchesSearch = titolo.includes(search) || autori.includes(search);
      const matchesTipo   =
        selectedTipo === "Tutti" ||
        book.tipo === selectedTipo ||
        String(book.id_tipo) === selectedTipo;
      const matchesDiario = !onlyMyDiario || letturaByOpera.has(book.id_opera);

      return matchesSearch && matchesTipo && matchesDiario;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "titolo") return (a.titolo || "").localeCompare(b.titolo || "");
      if (sortBy === "autore") return (a.autori || "").localeCompare(b.autori || "");
      if (sortBy === "serie") {
        const serieA = a.serie || "zzz";
        const serieB = b.serie || "zzz";
        return serieA.localeCompare(serieB);
      }
      // Post-split: la view espone prima_edizione_anno (anno_pubblicazione vive su edizioni)
      if (sortBy === "anno+") return (b.prima_edizione_anno || 0) - (a.prima_edizione_anno || 0);
      if (sortBy === "anno-") return (a.prima_edizione_anno || 0) - (b.prima_edizione_anno || 0);
      return 0;
    });
  }, [books, searchTerm, selectedTipo, onlyMyDiario, letturaByOpera, sortBy]);

  const totalPages = Math.ceil(sortedAndFilteredBooks.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBooks = sortedAndFilteredBooks.slice(indexOfFirst, indexOfLast);

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (selectedTipo !== "Tutti" ? 1 : 0) +
    (onlyMyDiario ? 1 : 0);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedTipo("Tutti");
    setOnlyMyDiario(false);
    setCurrentPage(1);
  };

  const isCatalogEmpty = !loading && !error && books.length === 0;
  const isFilteredEmpty = !loading && books.length > 0 && currentBooks.length === 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show:   { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } },
  };

  const isLogged = !!(user?.id || user?.id_utente);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-24 md:py-10">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-center md:text-left w-full">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
              Libreria Opere
            </h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">
              {sortedAndFilteredBooks.length} {sortedAndFilteredBooks.length === 1 ? "volume" : "volumi"}
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

        {!isCatalogEmpty && (
          <>
            {/* --- RICERCA + ORDINAMENTO --- */}
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm mb-3 flex flex-col md:flex-row gap-2.5 relative z-10">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Cerca per titolo o autore..."
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                    aria-label="Pulisci ricerca"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none bg-gray-200/50 rounded-full p-0.5"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="md:w-56 relative">
                <select
                  aria-label="Ordina per"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 cursor-pointer appearance-none outline-none transition-all"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">⇅</span>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* --- SEGMENTED CONTROL TIPO --- */}
            <div
              role="tablist"
              aria-label="Filtra per tipo"
              className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-3 flex overflow-hidden divide-x divide-gray-100"
            >
              {TIPI.map((t) => {
                const active = selectedTipo === t.key;
                const count  = tipoCounts[t.key] ?? 0;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => { setSelectedTipo(t.key); setCurrentPage(1); }}
                    className={`flex-1 min-w-0 px-1 py-2.5 sm:py-3 transition-colors active:scale-[0.97] ${
                      active ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider truncate w-full text-center px-1">
                        {t.label}
                      </span>
                      <span className={`text-[10px] sm:text-[11px] font-black ${active ? "text-white/80" : "text-gray-400"}`}>
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* --- TOGGLE "SOLO NEL MIO DIARIO" + RESET FILTRI --- */}
            <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
              {isLogged && (
                <button
                  onClick={() => { setOnlyMyDiario(!onlyMyDiario); setCurrentPage(1); }}
                  aria-pressed={onlyMyDiario}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                    onlyMyDiario
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700"
                  }`}
                >
                  <span aria-hidden="true">📖</span>
                  Solo nel mio diario
                  {myLetture.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      onlyMyDiario ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {myLetture.length}
                    </span>
                  )}
                </button>
              )}

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-gray-500 hover:text-blue-600 underline ml-auto"
                >
                  Pulisci {activeFilterCount} {activeFilterCount === 1 ? "filtro" : "filtri"}
                </button>
              )}
            </div>
          </>
        )}

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
        ) : isCatalogEmpty ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4" aria-hidden="true">📚</div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Catalogo vuoto</h3>
            <p className="text-gray-500 text-sm mb-6 px-4">
              Non ci sono ancora opere nel catalogo. {user?.editor && "Inseriscine una per iniziare."}
            </p>
            {user?.editor && (
              <Link
                to="/createopera"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-black rounded-xl shadow-md active:scale-95 transition-all uppercase tracking-widest"
              >
                <span className="text-base">＋</span> Inserisci la prima opera
              </Link>
            )}
          </div>
        ) : isFilteredEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200"
          >
            <div className="text-4xl mb-3" aria-hidden="true">🔍</div>
            <p className="text-gray-700 font-black uppercase tracking-widest text-xs mb-1">
              Nessun risultato
            </p>
            <p className="text-gray-400 text-xs mb-4 px-4">
              Nessuna opera corrisponde ai filtri attivi.
            </p>
            <button
              onClick={resetFilters}
              className="text-blue-600 font-bold text-sm hover:underline"
            >
              Resetta i filtri
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              key={currentPage + searchTerm + selectedTipo + sortBy + String(onlyMyDiario)}
            >
              {currentBooks.map((book) => {
                const lettura = letturaByOpera.get(book.id_opera);
                const inDiario = !!lettura;
                return (
                  <motion.div
                    key={book.id_opera}
                    variants={itemVariants}
                    className="relative group transition-transform duration-300"
                  >
                    <Link to={`/opere/${book.id_opera}`} className="block h-full active:scale-[0.98] transition-transform">
                      <Book
                        title={book.titolo}
                        author={book.autori}
                        anno={book.prima_edizione_anno}
                        stato_opera={book.stato_opera}
                        generi={book.generi}
                        tipo={book.tipo}
                        serie={book.serie}
                      />
                    </Link>

                    {inDiario ? (
                      /* Bookmark "nel diario" — stesso angolo del + per non interferire col titolo */
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/lettura/${lettura.id_lettura}`);
                        }}
                        title="Già nel tuo diario — apri lettura"
                        aria-label="Apri lettura nel diario"
                        className="absolute top-2 right-2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white flex items-center justify-center active:scale-90 hover:bg-blue-700 transition-all"
                      >
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    ) : (
                      /* "+" Aggiungi: sempre visibile su mobile, hover-only su desktop */
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate("/createlettura", {
                            state: {
                              id_opera: book.id_opera,
                              titolo: book.titolo,
                            },
                          });
                        }}
                        title="Aggiungi al diario"
                        aria-label="Aggiungi al diario"
                        className="absolute top-2 right-2 z-10 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white border border-green-200 text-green-600 shadow-sm hover:bg-green-500 hover:text-white hover:border-green-500 active:scale-90 transition-all md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

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
