import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function ListAutori() {
  /* ---------------------------------------------------------------------------
     1. STATI DELLA COMPONENTE (STATE MANAGEMENT)
     ---------------------------------------------------------------------------
  */
  const [user, setUser] = useState(null);
  const [autori, setAutori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nome"); // Default: Alfabetico

  // Stati Paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const navigate = useNavigate();

  /* ---------------------------------------------------------------------------
     2. EFFETTI COLLATERALI (SIDE EFFECTS)
     ---------------------------------------------------------------------------
  */

  // Scroll in alto al cambio pagina
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Caricamento dati dal server
  useEffect(() => {
    const loadAutori = async () => {
      setLoading(true);
      setError("");

      try {
        // --- NUOVO: Recupera profilo utente per gestire i permessi ---
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );

        if (resUser && resUser.ok) {
          const userData = await resUser.json();
          setUser(userData); // Popola lo stato per attivare il tasto "Nuovo Autore"
        }

        // --- Caricamento Lista Autori ---
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/autori`,
          { method: "GET" },
          navigate
        );

        if (!response) return;

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          setError(err.error || "Errore durante il caricamento degli autori.");
        } else {
          const data = await response.json();
          setAutori(data);
        }
      } catch (err) {
        setError("Errore di connessione al server.");
      } finally {
        setLoading(false);
      }
    };

    loadAutori();
  }, [navigate]);

  /* ---------------------------------------------------------------------------
     3. LOGICA DI CALCOLO PER LA PAGINAZIONE
     ---------------------------------------------------------------------------
  */
  /* ---------------------------------------------------------------------------
   3. LOGICA DI FILTRO E ORDINAMENTO
   ---------------------------------------------------------------------------
*/
  const filteredAutori = autori.filter((autore) => {
    const nome = autore.nome_autore ? autore.nome_autore.toLowerCase() : "";
    return nome.includes(searchTerm.toLowerCase());
  });

  const sortedAutori = [...filteredAutori].sort((a, b) => {
    if (sortBy === "nome") {
      return (a.nome_autore || "").localeCompare(b.nome_autore || "");
    }
    if (sortBy === "nome-desc") {
      return (b.nome_autore || "").localeCompare(a.nome_autore || "");
    }
    return 0;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAutori = sortedAutori.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedAutori.length / itemsPerPage);

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
     5. RENDER DELLA PAGINA (JSX)
     ---------------------------------------------------------------------------
  */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setUser={setUser} setError={setError} />

      {/* Header Azioni */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lista Autori</h1>
        {user && user.editor === true && (
          <Link
            to="/createautore"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150"
          >
            + Nuovo Autore
          </Link>
        )}
      </div>

      {/* 2. BARRA DEI FILTRI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-end gap-4">
          {/* Ricerca */}
          <div className="flex-1 w-full relative">
            <label className="block text-xs text-gray-400 mb-1 ml-1">
              Cerca autore:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
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
                placeholder="Scrivi il nome..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Ordinamento */}
          <div className="w-full md:w-64">
            <label className="block text-xs text-gray-400 mb-1 ml-1">
              Ordina per:
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full py-2 px-4 border border-gray-200 bg-gray-50 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
            >
              <option value="nome">Nome (A-Z)</option>
              <option value="nome-desc">Nome (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-center bg-red-50 p-4 rounded-lg">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {sortedAutori.length > 0 ? (
              <>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentAutori.map((autore) => (
                    <Link
                      key={autore.id_autore}
                      to={`/autore/${autore.id_autore}`}
                      className="block p-4 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50 transition-all"
                    >
                      <li>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {autore.nome_autore}
                        </h2>
                      </li>
                    </Link>
                  ))}
                </ul>

                {/* Paginazione: usa la lunghezza dei filtrati per decidere se mostrarla */}
                {sortedAutori.length > itemsPerPage && <PaginationControls />}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">
                  Nessun autore corrisponde alla ricerca.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Mostra tutti gli autori
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ListAutori;
