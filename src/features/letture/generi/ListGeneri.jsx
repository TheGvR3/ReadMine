import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function ListGeneri() {
  const [generi, setGeneri] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/genere/`, // Assicurati che l'endpoint sia corretto
        { method: "GET" },
        navigate
      );

      if (!response) return;

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore durante il caricamento dei generi.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setGeneri(data);
      setLoading(false);
    };

    loadGeneri();
  }, [navigate]);

  // Logica Paginazione
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentGeneri = generi.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(generi.length / itemsPerPage);

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
      <Navbar setError={setError} />

      {/* Header Azioni */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lista Generi</h1>
        <Link
          to="/creategenere"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150"
        >
          + Nuovo Genere
        </Link>
      </div>
      {currentPage > 1 && generi.length > itemsPerPage && <PaginationControls />}

      <div className="container mx-auto px-4 py-6">
        {loading && <p className="text-center text-gray-600">Caricamento in corso...</p>}
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

            {generi.length > itemsPerPage && <PaginationControls />}
          </>
        )}

        {!loading && generi.length === 0 && (
          <p className="text-center text-xl text-gray-500 mt-8">Nessun genere presente in archivio.</p>
        )}
      </div>
    </div>
  );
}

export default ListGeneri;