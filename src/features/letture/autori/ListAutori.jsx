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

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/autori`,
        { method: "GET" },
        navigate
      );

      if (!response) return;

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore durante il caricamento degli autori.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAutori(data);
      setLoading(false);
    };

    loadAutori();
  }, [navigate]);

  /* ---------------------------------------------------------------------------
     3. LOGICA DI CALCOLO PER LA PAGINAZIONE
     ---------------------------------------------------------------------------
  */
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAutori = autori.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(autori.length / itemsPerPage);

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
        <Link
          to="/createautore"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150"
        >
          + Nuovo Autore
        </Link>
      </div>

      <div className="container mx-auto px-4 py-6">

        {loading && <p>Caricamento autori...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && autori.length > 0 && (
          <>
            {/* Paginazione superiore */}
            {currentPage > 1 && autori.length > itemsPerPage && <PaginationControls />}

            {/* Griglia Autori con il tuo stile originale */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentAutori.map((autore) => (
                <Link
                  key={autore.id_autore}
                  to={`/autore/${autore.id_autore}`}
                  className="block p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition"
                >
                  <li>
                    <h2 className="text-xl font-semibold">
                      {autore.nome_autore}
                    </h2>
                  </li>
                </Link>
              ))}
            </ul>

            {/* Paginazione inferiore */}
            {autori.length > itemsPerPage && <PaginationControls />}
          </>
        )}

        {!loading && autori.length === 0 && (
          <p className="text-center text-xl text-gray-500 mt-8">Nessun autore trovato.</p>
        )}
      </div>
    </div>
  );
}

export default ListAutori;