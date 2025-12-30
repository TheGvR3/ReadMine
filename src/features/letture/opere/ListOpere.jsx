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
              `${import.meta.env.VITE_API_BASE_URL}/letture/utente/${currentUserId}`,
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
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentBooks.map((book) => {
                const inDiario = isAlreadyInDiario(book.id_opera);

                return (
                  <div key={book.id_opera} className="relative group">
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

                    {/* BOTTONE DINAMICO: + (Verde) o V (Blu) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (inDiario) {
                          // Se è già nel diario, potresti voler navigare alla lista letture
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
                      className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-200 border-2 ${
                        inDiario
                          ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                          : "bg-white border-gray-100 text-green-600 hover:border-green-200 hover:scale-110"
                      }`}
                      title={inDiario ? "Già nel diario" : "Aggiungi al diario"}
                    >
                      {inDiario ? (
                        // Icona Check (V)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
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
                        // Icona Plus (+)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
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
            {books.length > itemsPerPage && <PaginationControls />}
          </>
        )}
      </div>
    </div>
  );
}

export default ListOpere;
