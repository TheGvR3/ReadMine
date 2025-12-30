import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Book from "../../../components/Book";
import { secureFetch } from "../../../utils/secureFetch";

function ListOpere() {
  /* ---------------------------------------------------------------------------
     1. STATI DELLA COMPONENTE
     ---------------------------------------------------------------------------
  */
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [myLetture, setMyLetture] = useState([]); // Stato per le letture dell'utente
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("Tutti");
  const [sortBy, setSortBy] = useState("titolo"); // Valore di default

  const navigate = useNavigate();

  /* ---------------------------------------------------------------------------
     2. EFFETTI COLLATERALI (SIDE EFFECTS)
     ---------------------------------------------------------------------------
  */

  // Effetto UX: Torna in cima alla pagina al cambio di pagina
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Caricamento Dati
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        // 1. Recupera Profilo per ID
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          {},
          navigate
        );
        let currentUserId = null;
        if (resUser && resUser.ok) {
          const userData = await resUser.json();
          currentUserId = userData.id || userData.id_utente;
          setUser(userData);
        }

        // 2. Carica Opere e Letture (se loggato)
        const fetchPromises = [
          secureFetch(
            `${import.meta.env.VITE_API_BASE_URL}/opere/`,
            {},
            navigate
          ),
        ];

        if (currentUserId) {
          fetchPromises.push(
            secureFetch(
              `${
                import.meta.env.VITE_API_BASE_URL
              }/letture/utente/${currentUserId}`,
              {},
              navigate
            )
          );
        }

        const [resOpere, resLetture] = await Promise.all(fetchPromises);

        if (resOpere?.ok) {
          const dataOpere = await resOpere.json();
          setBooks(dataOpere);
        }

        if (resLetture?.ok) {
          const dataLetture = await resLetture.json();
          setMyLetture(dataLetture);
        }
      } catch (err) {
        setError("Errore durante il caricamento.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Funzione per controllare se l'opera è già nel diario
  const isAlreadyInDiario = (idOpera) => {
    return myLetture.some((l) => l.id_opera === idOpera);
  };

  /* ---------------------------------------------------------------------------
    3. LOGICA DI CALCOLO PER LA PAGINAZIONE + FILTRI
  ---------------------------------------------------------------------------*/
  // 1. Filtriamo i libri
  const filteredBooks = books.filter((book) => {
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

  // 2. Ordiniamo i libri filtrati
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "titolo") {
      return (a.titolo || "").localeCompare(b.titolo || "");
    }
    if (sortBy === "autore") {
      return (a.autori || "").localeCompare(b.autori || "");
    }
    if (sortBy === "serie") {
      // Gestiamo i casi in cui la serie è null mettendoli in fondo
      const serieA = a.serie || "zzz";
      const serieB = b.serie || "zzz";
      return serieA.localeCompare(serieB);
    }
    if (sortBy === "anno") {
      // Ordine decrescente (dal più recente)
      return (b.anno_pubblicazione || 0) - (a.anno_pubblicazione || 0);
    }
    return 0;
  });

  // 3. Applichiamo la paginazione sui dati ordinati
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  /* ---------------------------------------------------------------------------
    4. SOTTO-COMPONENTE: UI DEI CONTROLLI
    ---------------------------------------------------------------------------
  */
  const PaginationControls = () => (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-8 mb-4">
      <button
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50 transition"
      >
        « Prima
      </button>

      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
      >
        ←
      </button>

      {getPageNumbers().map((num) => (
        <button
          key={num}
          onClick={() => setCurrentPage(num)}
          className={`px-3 py-1 rounded border shadow-sm transition-colors ${
            currentPage === num
              ? "bg-blue-600 text-white border-blue-600 font-bold"
              : "bg-white border-gray-300 hover:bg-gray-50"
          }`}
        >
          {num}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
      >
        →
      </button>

      <button
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
      >
        Ultima »
      </button>
    </div>
  );

  /* ---------------------------------------------------------------------------
     5. RENDER DELLA PAGINA
     ---------------------------------------------------------------------------
  */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setUser={setUser} setError={setError} />

      {/* CONTAINER UNICO PER TUTTO IL CONTENUTO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. HEADER: Titolo e Bottone "Nuova Opera" */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Lista Opere
          </h1>
          <Link
            to="/createopera"
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nuova Opera
          </Link>
        </div>

        {/* 2. BARRA DEI FILTRI: Ricerca e Select */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cerca per titolo o autore..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedTipo}
              onChange={(e) => {
                setSelectedTipo(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full py-2.5 px-4 border border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all appearance-none"
            >
              <option value="Tutti">Tutte le categorie</option>

              {/* I value devono essere identici alle stringhe nel JSON */}
              <option value="Libro">Libri</option>
              <option value="Manga/Fumetto">Manga & Fumetti</option>
              <option value="Rivista">Riviste</option>
              <option value="Altro">Altro</option>
            </select>
          </div>
          {/* Selettore Ordinamento */}
          <div className="w-full md:w-64">
            <label className="block text-xs text-gray-500 mb-1 ml-1">
              Ordina per:
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full py-2.5 px-4 border border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
            >
              <option value="titolo">Titolo (A-Z)</option>
              <option value="autore">Autore (A-Z)</option>
              <option value="serie">Serie</option>
              <option value="anno">Anno (Più recenti)</option>
            </select>
          </div>
        </div>

        {/* 3. CONTENUTO PRINCIPALE: Loading, Error o Grid */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600 font-medium">
              Caricamento in corso...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded-md">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredBooks.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentBooks.map((book) => {
                    const inDiario = isAlreadyInDiario(book.id_opera);
                    return (
                      <div
                        key={book.id_opera}
                        className="relative group transition-transform duration-300 hover:-translate-y-1"
                      >
                        <Link to={`/opere/${book.id_opera}`}>
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
                          className={`absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 border-2 ${
                            inDiario
                              ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                              : "bg-white border-gray-100 text-green-600 hover:border-green-500 hover:scale-110"
                          }`}
                          title={
                            inDiario ? "Già nel diario" : "Aggiungi al diario"
                          }
                        >
                          {inDiario ? (
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* PAGINAZIONE */}
                {filteredBooks.length > itemsPerPage && <PaginationControls />}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nessun risultato
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Prova a modificare i termini di ricerca o i filtri.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTipo("Tutti");
                  }}
                  className="mt-6 text-blue-600 font-semibold hover:text-blue-500"
                >
                  Resetta filtri
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ListOpere;
