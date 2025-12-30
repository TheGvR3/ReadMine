import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function ListSerie() {
  /* ---------------------------------------------------------------------------
     1. STATI DELLA COMPONENTE (STATE MANAGEMENT)
     ---------------------------------------------------------------------------
     - user/setUser: Gestisce i dati dell'utente per la sessione corrente.
     - series/setSeries: L'array "master" che contiene tutti i dati dal database.
     - loading: Switch booleano per mostrare/nascondere lo spinner di caricamento.
     - error: Memorizza il testo dell'errore se la chiamata API fallisce.
     - currentPage: Tiene traccia della pagina attiva (fondamentale per la paginazione).
     - itemsPerPage: Definisce la dimensione del "chunk" di dati da mostrare.
  */
  const [user, setUser] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nome");

  const navigate = useNavigate();

  /* ---------------------------------------------------------------------------
     2. EFFETTI COLLATERALI (SIDE EFFECTS)
     ---------------------------------------------------------------------------
  */

  // Effetto UX: Ogni volta che l'utente cambia pagina, lo scroll torna in cima
  // in modo fluido, evitando che l'utente rimanga a fondo pagina dopo il click.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Caricamento Dati: Esegue la chiamata al server al montaggio della componente.
  // Utilizza secureFetch per gestire automaticamente i token di autenticazione.
  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      setError("");

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/serie`,
        { method: "GET" },
        navigate
      );

      if (!response) return; // Se secureFetch ha gestito un redirect, usciamo.

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore durante la richiesta.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setSeries(data); // Salviamo l'intera lista nello stato 'series'
      setLoading(false);
    };

    loadSeries();
  }, [navigate]);

  /* ---------------------------------------------------------------------------
   3. LOGICA DI FILTRO E ORDINAMENTO
   ---------------------------------------------------------------------------
*/
  const filteredSeries = series.filter((s) => {
    const nome = s.nome_serie ? s.nome_serie.toLowerCase() : "";
    return nome.includes(searchTerm.toLowerCase());
  });

  const sortedSeries = [...filteredSeries].sort((a, b) => {
    if (sortBy === "nome") {
      return (a.nome_serie || "").localeCompare(b.nome_serie || "");
    }
    if (sortBy === "nome-desc") {
      return (b.nome_serie || "").localeCompare(a.nome_serie || "");
    }
    return 0;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSeries = sortedSeries.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedSeries.length / itemsPerPage);

  // Genera un array di numeri [1, 2, 3, ...] per renderizzare i tasti numerici.
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  /* ---------------------------------------------------------------------------
     4. SOTTO-COMPONENTE: UI DEI CONTROLLI (RENDER HELPER)
     ---------------------------------------------------------------------------
     Definiamo qui l'interfaccia della paginazione per poterla riutilizzare
     sia sopra che sotto la griglia senza duplicare il codice HTML/Tailwind.
  */
  const PaginationControls = () => (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-8 mb-4">
      {/* Tasto Prima Pagina */}
      <button
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50 transition"
      >
        « Prima
      </button>

      {/* Tasto Pagina Precedente */}
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
      >
        ←
      </button>

      {/* Numeri di pagina dinamici: evidenzia la pagina attiva con il blu */}
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

      {/* Tasto Pagina Successiva */}
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
      >
        →
      </button>

      {/* Tasto Ultima Pagina */}
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
      {/* Navigazione superiore */}
      <Navbar setUser={setUser} setError={setError} />

      {/* Header Azioni */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lista Serie</h1>
        {user && user.editor === true && (
        <Link
          to="/createserie"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150"
        >
          + Nuova Serie
        </Link>
        )}
      </div>

      {/* BARRA DEI FILTRI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-end gap-4">
          {/* Ricerca */}
          <div className="flex-1 w-full relative">
            <label className="block text-xs text-gray-400 mb-1 ml-1">
              Cerca serie:
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
                placeholder="Scrivi il nome della serie..."
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

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Gestione stati condizionali: Caricamento ed Errore */}
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

        {/* Rendering della lista se ci sono dati e non ci sono errori */}
        {!loading && !error && series.length > 0 && (
          <>
            {/* Paginazione superiore: appare solo se non siamo in prima pagina e c'è bisogno di paginare */}
            {currentPage > 1 && series.length > itemsPerPage && (
              <PaginationControls />
            )}

            {/* Griglia Responsiva: 1 colonna mobile, 2 tablet, 3/4 desktop */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentSeries.map((serie) => (
                <Link
                  key={serie.id_serie}
                  to={`/serie/${serie.id_serie}`}
                  className="bg-white rounded-e-xl overflow-hidden shadow-md border-r-4 border-gray-300 hover:border-black hover:shadow-lg transition-all duration-200 block"
                >
                  <div className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <h2
                        className="text-xl font-extrabold text-gray-900 mb-2 truncate"
                        title={serie.nome_serie}
                      >
                        {serie.nome_serie}
                      </h2>
                      <p className="text-blue-500 text-xs font-semibold uppercase tracking-wider">
                        Vedi opere →
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Paginazione inferiore: sempre visibile se i dati eccedono il limite per pagina */}
            {sortedSeries.length > itemsPerPage && <PaginationControls />}
          </>
        )}

        {/* Fallback in caso di array vuoto dal database */}
        {!loading && sortedSeries.length === 0 && (
          <p className="text-center text-xl text-gray-500 mt-8">
            Nessuna serie trovata con questi filtri.
          </p>
        )}
      </div>
    </div>
  );
}

export default ListSerie;
