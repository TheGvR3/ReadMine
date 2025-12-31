import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import GenereCard from "../../../components/GenereCard";
import Pagination from "../../../components/Pagination";
import { secureFetch } from "../../../utils/secureFetch";

function ListGeneri() {
  const [generi, setGeneri] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nome");
  const [user, setUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const loadGeneri = async () => {
      setLoading(true);
      setError("");
      try {
        const resUser = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );
        if (resUser && resUser.ok) {
          const userData = await resUser.json();
          setUser(userData);
        }

        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/genere/`,
          { method: "GET" },
          navigate
        );

        if (response && response.ok) {
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

  // Filtro e Ordinamento
  const filteredGeneri = generi.filter((g) =>
    g.nome_genere?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedGeneri = [...filteredGeneri].sort((a, b) => {
    if (sortBy === "nome") return a.nome_genere.localeCompare(b.nome_genere);
    if (sortBy === "nome-desc")
      return b.nome_genere.localeCompare(a.nome_genere);
    return 0;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentGeneri = sortedGeneri.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedGeneri.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Esplora Generi
            </h1>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">
              {filteredGeneri.length} categorie disponibili
            </p>
          </div>
          {user?.editor && (
            <Link
              to="/creategenere"
              className="px-6 py-3 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95 text-sm uppercase tracking-wider"
            >
              + Nuovo Genere
            </Link>
          )}
        </div>

        {/* Barra di Ricerca e Filtri */}
        <div className="bg-white p-5 rounded-4xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cerca genere (es: Fantasy, Noir...)"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <svg
              className="absolute left-4 top-4 h-5 w-5 text-gray-400"
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

          <div className="md:w-64">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 appearance-none cursor-pointer"
            >
              <option value="nome">Ordine A-Z</option>
              <option value="nome-desc">Ordine Z-A</option>
            </select>
          </div>
        </div>

        {/* Contenuto */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-10 bg-red-50 rounded-3xl border border-red-100 text-red-600 font-bold">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {currentGeneri.map((genere) => (
                <GenereCard
                  key={genere.id_genere}
                  id={genere.id_genere}
                  nome={genere.nome_genere}
                />
              ))}
            </div>

            {filteredGeneri.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 mt-6">
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                  Nessun genere trovato
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-600 font-bold hover:underline"
                >
                  Resetta i filtri
                </button>
              </div>
            )}

            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ListGeneri;
