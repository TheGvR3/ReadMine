import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import GenereCard from "../../../components/GenereCard";
import Pagination from "../../../components/Pagination";
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext";

function ListGeneri() {
  const { user } = useAuth();
  const [generi, setGeneri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nome");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;
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

        const resGeneri = await secureFetch(
          `${baseUrl}/genere/`,
          { method: "GET" },
          navigate
        );

        if (resGeneri?.ok) {
          const payload = await resGeneri.json();
          setGeneri(Array.isArray(payload) ? payload : payload?.data ?? []);
        } else {
          throw new Error("Impossibile caricare i generi");
        }
      } catch (err) {
        setError("Errore di connessione o server non raggiungibile.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const sortedAndFilteredGeneri = useMemo(() => {
    const filtered = generi.filter((g) =>
      g.nome_genere?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "nome") return a.nome_genere.localeCompare(b.nome_genere);
      if (sortBy === "nome-desc") return b.nome_genere.localeCompare(a.nome_genere);
      return 0;
    });
  }, [generi, searchTerm, sortBy]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentGeneri = sortedAndFilteredGeneri.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedAndFilteredGeneri.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setError={setError} />

      {/* Padding laterale ridotto su mobile (px-3) e padding verticale ridotto (py-6) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-20 md:py-10">
        
        {/* HEADER: gap ridotto, margini inferiori ridotti */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-center md:text-left w-full">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
              Esplora Generi
            </h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">
              {sortedAndFilteredGeneri.length} categorie
            </p>
          </div>
          
          {user?.editor && (
            // BOTTONE NUOVO GENERE: padding molto ridotto, testo più piccolo, bordo invece di sfondo pieno
            <Link
              to="/creategenere"
              className="w-full md:w-auto text-center px-4 py-2 bg-green-50 text-green-700 border-2 border-green-200 font-bold rounded-xl hover:bg-green-100 transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              + Nuovo Genere
            </Link>
          )}
        </div>

        {/* BARRA RICERCA E FILTRI: p-3 invece di p-5, rounded-2xl invece di 4xl, gap-2 */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-2.5 mb-8">
          
          <div className="flex-1 relative">
            {/* INPUT RICERCA: py-2.5 invece di py-3.5, testo più piccolo */}
            <input
              type="text"
              placeholder="Cerca genere..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {/* ICONA LENTE: ridimensionata e riposizionata */}
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {searchTerm && (
              // ICONA X: ridimensionata e riposizionata
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none bg-gray-200/50 rounded-full p-0.5"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="md:w-48">
            {/* SELECT ORDINAMENTO: py-2.5, testo più piccolo, freccina nativa meno invadente */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 cursor-pointer"
            >
              <option value="nome">A-Z</option>
              <option value="nome-desc">Z-A</option>
            </select>
          </div>
        </div>

        {/* GRIGLIA GENERI: grid-cols-2 forzato su mobile, gap-3 (o gap-2 se vuoi ancora più stretto) */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold text-sm">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {currentGeneri.map((genere) => (
                <GenereCard
                  key={genere.id_genere}
                  id={genere.id_genere}
                  nome={genere.nome_genere}
                  // Attenzione: GenereCard ha bisogno di sapere se l'utente è editor per mostrare i tasti!
                  isEditor={user?.editor} 
                  // onEdit={...} onDelete={...} // Aggiungi queste se le gestisci qui
                />
              ))}
            </div>

            {sortedAndFilteredGeneri.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 mt-6">
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
                  Nessun genere trovato
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-blue-600 font-bold text-sm hover:underline"
                >
                  Resetta la ricerca
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8">
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

export default ListGeneri;