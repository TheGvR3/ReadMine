import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import AutoreCard from "../../../components/AutoreCard"; // Import corretto
import Pagination from "../../../components/Pagination";
import { secureFetch } from "../../../utils/secureFetch";

function ListAutori() {
  const [user, setUser] = useState(null);
  const [autori, setAutori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nome");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; 
  const navigate = useNavigate();

  // Reset pagina 1 quando cerchi qualcosa
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const loadAutori = async () => {
      setLoading(true);
      setError("");
      try {
        const resUser = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, { method: "GET" }, navigate);
        if (resUser && resUser.ok) {
          setUser(await resUser.json());
        }

        const response = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/autori`, { method: "GET" }, navigate);
        if (response && response.ok) {
          const data = await response.json();
          setAutori(data);
        }
      } catch (err) {
        setError("Errore di connessione al server.");
      } finally {
        setLoading(false);
        // Scroll in alto solo dopo che il caricamento è finito o la pagina cambia
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    loadAutori();
  }, [navigate]); // Rimosso currentPage da qui per evitare loop, lo scroll lo gestiamo al cambio pagina o fine loading

  // Effetto dedicato solo allo scroll quando cambia la pagina (opzionale se già nel loadAutori)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const filteredAutori = autori.filter((a) => 
    a.nome_autore?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAutori = [...filteredAutori].sort((a, b) => {
    const nameA = a.nome_autore || "";
    const nameB = b.nome_autore || "";
    return sortBy === "nome" 
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAutori = sortedAutori.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedAutori.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Esplora Autori</h1>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">
              {filteredAutori.length} menti creative nel database
            </p>
          </div>
          {/* Usiamo l'optional chaining per sicurezza */}
          {user?.editor === true && (
            <Link
              to="/createautore"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 text-sm"
            >
              + AGGIUNGI AUTORE
            </Link>
          )}
        </div>

        {/* --- FILTRI --- */}
        <div className="bg-white p-4 rounded-4xl border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cerca un autore per nome..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="md:w-64">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer font-bold text-gray-600 shadow-none outline-none"
            >
              <option value="nome">Ordine Alfabetico (A-Z)</option>
              <option value="nome-desc">Ordine Alfabetico (Z-A)</option>
            </select>
          </div>
        </div>

        {/* --- CONTENT --- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200/50 rounded-4xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-8 rounded-4xl text-center border border-red-100">
            <p className="text-red-600 font-black uppercase tracking-widest text-sm">{error}</p>
          </div>
        ) : (
          <>
            {currentAutori.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentAutori.map((autore) => (
                  <AutoreCard key={autore.id_autore} autore={autore} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-4xl border border-dashed border-gray-200 shadow-sm">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Nessun autore trovato</p>
                <button 
                  onClick={() => { setSearchTerm(""); setCurrentPage(1); }} 
                  className="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-800 transition-colors"
                >
                  Resetta Filtri
                </button>
              </div>
            )}

            {/* --- PAGINAZIONE --- */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
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

export default ListAutori;