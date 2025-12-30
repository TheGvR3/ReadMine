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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
    const loadBooks = async () => {
      setLoading(true);
      setError("");

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/opere/`,
        { method: "GET" },
        navigate
      );

      if (!response) return;

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore durante la richiesta.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setBooks(data);
      setLoading(false);
    };

    loadBooks();
  }, [navigate]);

  /* ---------------------------------------------------------------------------
     3. LOGICA DI CALCOLO PER LA PAGINAZIONE
     ---------------------------------------------------------------------------
  */
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBooks = books.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(books.length / itemsPerPage);

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

      {/* Header Azioni */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lista Opere</h1>
        <Link
          to="/createopera"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150"
        >
          + Nuova Opera
        </Link>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {loading && (
          <p className="text-center text-lg text-gray-700">
            Caricamento in corso...
          </p>
        )}
        {error && (
          <p className="text-center text-xl text-red-600 font-medium my-4">
            {error}
          </p>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            {/* Paginazione superiore */}
            {currentPage > 1 && books.length > itemsPerPage && (
              <PaginationControls />
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentBooks.map((book) => (
                <div key={book.id_opera} className="relative group">
                  {/* Link principale alla card */}
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

                  {/* Pulsante "+" rapido per creare la lettura */}
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Impedisce al Link di attivarsi
                      e.stopPropagation(); // Impedisce l'evento di bubbling
                      navigate("/createlettura", {
                        state: {
                          id_opera: book.id_opera,
                          titolo: book.titolo,
                          editore: book.editore,
                        },
                      });
                    }}
                    className="absolute top-2 right-2 z-10 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    title="Aggiungi al diario"
                  >
                    <span className="text-xl font-bold leading-none">+</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Paginazione inferiore */}
            {books.length > itemsPerPage && <PaginationControls />}
          </>
        )}

        {!loading && books.length === 0 && (
          <p className="text-center text-xl text-gray-500 mt-8">
            Nessuna opera trovata.
          </p>
        )}
      </div>
    </div>
  );
}

export default ListOpere;
