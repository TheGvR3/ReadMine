import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Book from "../../../components/Book";
import { secureFetch } from "../../../utils/secureFetch";

function GenereDetails() {
  const { id_genere } = useParams();
  const navigate = useNavigate();

  const [opere, setOpere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [genereName, setGenereName] = useState("");

  // ---------------------------------------------------------------------------
  // CARICA DATI (OPERE E NOME GENERE)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      // 1. Carica Nome Genere
      const resGenere = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/genere/${id_genere}`,
        {},
        navigate
      );

      if (resGenere && resGenere.ok) {
        const dataGenere = await resGenere.json();
        setGenereName(dataGenere.nome_genere);
      } else {
        setError("Impossibile trovare il genere selezionato.");
        setLoading(false);
        return;
      }

      // 2. Carica Opere filtrate per Genere
      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/opere/genere/${id_genere}`,
        {},
        navigate
      );

      if (response) {
        if (response.ok) {
          const dataOpere = await response.json();
          setOpere(dataOpere);
        } else if (response.status === 404) {
          // Genere esistente ma senza opere associate
          setOpere([]);
        } else {
          setError("Errore tecnico durante il recupero delle opere.");
        }
      }

      setLoading(false);
    };

    if (id_genere) loadData();
  }, [id_genere, navigate]);

  // Naviga alla pagina di modifica
  const handleUpdate = () => {
    navigate(`/updategenere/${id_genere}`);
  };

  // ---------------------------------------------------------------------------
  // ELIMINA GENERE
  // ---------------------------------------------------------------------------
  const handleDeleteGenere = async () => {
    if (opere.length > 0) {
      alert("Impossibile eliminare il genere: sono presenti opere collegate.");
      return;
    }

    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare definitivamente questo genere?"
    );
    if (!confirmDelete) return;

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/genere/${id_genere}`,
      { method: "DELETE" },
      navigate
    );

    if (response && response.ok) {
      alert("Genere eliminato con successo.");
      navigate("/ListGeneri");
    } else {
      alert("Errore durante l'eliminazione.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {loading ? "Caricamento..." : `Genere: ${genereName}`}
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold shadow-sm"
            >
              Modifica
            </button>
            <button
              onClick={handleDeleteGenere}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold shadow-sm"
            >
              Elimina
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {/* TITOLO SEZIONE OPERE */}
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          📚 Opere di questo genere ({opere.length})
        </h2>

        {/* LISTA OPERE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {opere.map((opera) => (
            <Link key={opera.id_opera} to={`/opere/${opera.id_opera}`}>
              <Book
                title={opera.titolo}
                author={opera.autori}
                anno={opera.anno_pubblicazione}
                stato_opera={opera.stato_opera}
                serie={opera.serie}
              />
            </Link>
          ))}
        </div>

        {/* NESSUNA OPERA TROVATA */}
        {!loading && opere.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 mt-6">
            <p className="text-gray-400 text-lg">
              Al momento non ci sono opere associate a questo genere.
            </p>
          </div>
        )}

        {/* TORNA INDIETRO */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate("/ListGeneri")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-lg transition-colors"
          >
            ← Torna alla lista generi
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenereDetails;
