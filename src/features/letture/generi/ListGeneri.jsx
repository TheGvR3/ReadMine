import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function ListGeneri() {
  const [generi, setGeneri] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nome");
  const [user, setUser] = useState(null);

  // Stati Paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 28;

  const navigate = useNavigate();

  // Scroll in alto al cambio pagina
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Caricamento dati dal server (Endpoint Generi)
  useEffect(() => {
    const loadGeneri = async () => {
      setLoading(true);
      setError("");

      try {
        // --- NUOVO: Recupera dati utente per permessi Editor ---
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );
        if (resUser && resUser.ok) {
          const userData = await resUser.json();
          setUser(userData);
        }

        // --- Caricamento Lista Generi ---
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/genere/`,
          { method: "GET" },
          navigate
        );

        if (!response) return;

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          setError(err.error || "Errore durante il caricamento dei generi.");
        } else {
          const data = await response.json();
          setGeneri(data);
        }
      } catch (err) {
        setError("Errore di connessione.");
      } finally {
        setLoading(false);
      }
    };

    loadGeneri();
  }, [navigate]);

  /* ---------------------------------------------------------------------------
   3. LOGICA DI FILTRO E ORDINAMENTO
   ---------------------------------------------------------------------------
*/
  const filteredGeneri = generi.filter((g) => {
    const nome = g.nome_genere ? g.nome_genere.toLowerCase() : "";
    return nome.includes(searchTerm.toLowerCase());
  });

  const sortedGeneri = [...filteredGeneri].sort((a, b) => {
    if (sortBy === "nome") {
      return (a.nome_genere || "").localeCompare(b.nome_genere || "");
    }
    if (sortBy === "nome-desc") {
      return (b.nome_genere || "").localeCompare(a.nome_genere || "");
    }
    return 0;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentGeneri = sortedGeneri.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedGeneri.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  const PaginationControls = () => (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-8 mb-4">
      <button
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50 transition"
      >
        « Prima
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
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50 transition"
      >
        Ultima »
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
<Navbar setUser={setUser} setError={setError} />
      {/* Header Azioni */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lista Generi</h1>
        {user && user.editor === true && (
          <Link
            to="/creategenere"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150"
          >
            + Nuovo Genere
          </Link>
        )}
      </div>
      {currentPage > 1 && generi.length > itemsPerPage && (
        <PaginationControls />
      )}

      {/* BARRA DEI FILTRI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-end gap-4">
          {/* Ricerca */}
          <div className="flex-1 w-full relative">
            <label className="block text-xs text-gray-400 mb-1 ml-1">
              Cerca genere:
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
                placeholder="Fantasy, Thriller, Saggistica..."
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
          <p className="text-center text-gray-600">Caricamento in corso...</p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && generi.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentGeneri.map((genere) => (
                <div key={genere.id_genere} className="relative group">
                  <Link
                    to={`/genere/${genere.id_genere}`}
                    className="block p-5 bg-white rounded-xl shadow-sm border border-gray-200 min-h-25 hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <h2 className="text-lg font-bold text-gray-700 group-hover:text-blue-700">
                      {genere.nome_genere}
                    </h2>
                  </Link>
                </div>
              ))}
            </div>

            {sortedGeneri.length > itemsPerPage && <PaginationControls />}
          </>
        )}

        {!loading && sortedGeneri.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500">
              Nessun genere trovato con questo nome.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-500 hover:underline mt-2"
            >
              Resetta ricerca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListGeneri;
