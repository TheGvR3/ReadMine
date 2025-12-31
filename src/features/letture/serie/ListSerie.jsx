import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import SerieCard from "../../../components/SerieCard";
import Pagination from "../../../components/Pagination";
import { secureFetch } from "../../../utils/secureFetch";

function ListSerie() {
  const [user, setUser] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nome");

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const loadSeries = async () => {
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
          `${import.meta.env.VITE_API_BASE_URL}/serie`,
          { method: "GET" },
          navigate
        );

        if (response && response.ok) {
          const data = await response.json();
          setSeries(data);
        } else {
          setError("Impossibile caricare le serie.");
        }
      } catch (err) {
        setError("Errore di connessione al server.");
      } finally {
        setLoading(false);
      }
    };
    loadSeries();
  }, [navigate]);

  const filteredSeries = series.filter((s) =>
    (s.nome_serie || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSeries = [...filteredSeries].sort((a, b) => {
    return sortBy === "nome"
      ? (a.nome_serie || "").localeCompare(b.nome_serie || "")
      : (b.nome_serie || "").localeCompare(a.nome_serie || "");
  });

  const totalPages = Math.ceil(sortedSeries.length / itemsPerPage);
  const currentSeries = sortedSeries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar setUser={setUser} setError={setError} />

      {/* HEADER DINAMICO */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                📺 Archivio Serie
              </h1>
              <p className="text-gray-500 mt-1">
                Gestisci e sfoglia le collezioni del database.
              </p>
            </div>

            {user?.editor && (
              <Link
                to="/createserie"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all active:scale-95 gap-2"
              >
                <span>+</span> Nuova Serie
              </Link>
            )}
          </div>

          {/* BARRA RICERCA INTEGRATA NELL'HEADER */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cerca una serie..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="nome">A-Z (Crescente)</option>
              <option value="nome-desc">Z-A (Decrescente)</option>
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center font-bold border border-red-100">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentSeries.map((s) => (
                <SerieCard
                  key={s.id_serie}
                  id={s.id_serie}
                  nome={s.nome_serie}
                />
              ))}
            </div>

            {sortedSeries.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-lg">
                  Nessuna serie trovata con questi criteri.
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ListSerie;
