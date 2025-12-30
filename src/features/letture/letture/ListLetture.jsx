import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function ListLetture() {
  const [user, setUser] = useState(null);
  const [letture, setLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // 1. Recupero dell'ID utente dal localStorage (o dove lo salvi)
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const id_user = storedUser?.id;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // 2. Caricamento Dati Letture
  useEffect(() => {
    const loadLetture = async () => {
      if (!id_user) {
        setError("Effettua il login per vedere le tue letture.");
        return;
      }

      setLoading(true);
      setError("");

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/letture/${id_user}`,
        { method: "GET" },
        navigate
      );

      if (!response) return;

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore durante il recupero delle letture.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setLetture(data);
      setLoading(false);
    };

    loadLetture();
  }, [id_user, navigate]);

  // 3. Logica Paginazione
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLetture = letture.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(letture.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  const PaginationControls = () => (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-8 mb-4">
      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded disabled:opacity-50">«</button>
      {getPageNumbers().map((num) => (
        <button key={num} onClick={() => setCurrentPage(num)} className={`px-3 py-1 rounded border ${currentPage === num ? "bg-blue-600 text-white font-bold" : "bg-white"}`}>
          {num}
        </button>
      ))}
      <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 bg-white border rounded disabled:opacity-50">»</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Il Mio Diario di Lettura</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 pb-16">
        {loading && <p className="text-center">Caricamento...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && letture.length > 0 && (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opera</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progresso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voto</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentLetture.map((lettura) => (
                    <tr key={lettura.id_lettura} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{lettura.opere?.titolo}</div>
                        <div className="text-sm text-gray-500">{lettura.opere?.editore}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          lettura.stato === 'finito' ? 'bg-green-100 text-green-800' :
                          lettura.stato === 'in_corso' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lettura.stato.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Vol. {lettura.volume || '-'} | Cap. {lettura.capitolo || '-'}
                      </td>
                      <td className="px-6 py-4 text-yellow-500 font-bold">
                        {lettura.valutazione ? "⭐".repeat(lettura.valutazione) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/letture/${lettura.id_lettura}`} className="text-blue-600 hover:text-blue-900 font-medium">
                          Dettagli
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {letture.length > itemsPerPage && <PaginationControls />}
          </>
        )}

        {!loading && letture.length === 0 && !error && (
          <div className="text-center mt-12">
            <p className="text-xl text-gray-500">Non hai ancora registrato nessuna lettura.</p>
            <Link to="/opere" className="text-blue-600 underline mt-2 block">Esplora le opere per iniziare</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListLetture;