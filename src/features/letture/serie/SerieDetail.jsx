import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Book from "../../../components/Book";
import { secureFetch } from "../../../utils/secureFetch";

function SerieDetail() {
  const { id_serie } = useParams();
  const navigate = useNavigate();

  const [opere, setOpere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serieName, setSerieName] = useState("");

  // ---------------------------------------------------------------------------
  // CARICA OPERE DELLA SERIE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const loadOpere = async () => {
      setLoading(true);

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/opere/serie/${id_serie}`,
        {},
        navigate
      );

      if (!response) return;

      if (!response.ok) {
        if (response.status === 404) {
          setOpere([]);
          setLoading(false);
          return;
        }

        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Impossibile caricare le opere.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setOpere(data);
      setSerieName(data[0]?.serie || "");
      setLoading(false);
    };

    if (id_serie) loadOpere();
  }, [id_serie, navigate]);

  // Naviga alla pagina di modifica
  const handleUpdate = () => {
    navigate(`/updateserie/${id_serie}`);
  };

  // ---------------------------------------------------------------------------
  // ELIMINA SERIE
  // ---------------------------------------------------------------------------
  const handleDeleteSerie = async () => {
    // Se ci sono opere collegate → blocca eliminazione
    if (opere.length > 0) {
      alert("Impossibile eliminare la serie: contiene opere collegate.");
      return;
    }

    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare questa serie? L'azione è irreversibile."
    );

    if (!confirmDelete) return;

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/serie/${id_serie}`,
      { method: "DELETE" },
      navigate
    );

    if (!response) return;

    if (response.ok) {
      alert("Serie eliminata con successo.");
      navigate("/ListSerie");
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'eliminazione della serie.");
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Opere nella serie: {serieName}
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold shadow-sm"
            >
              Modifica
            </button>
            <button
              onClick={handleDeleteSerie}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold shadow-sm"
            >
              Elimina
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-gray-600 text-lg">
            Caricamento opere...
          </p>
        )}

        {error && (
          <p className="text-center text-red-600 font-semibold">{error}</p>
        )}

        {/* Lista opere */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opere.map((opera) => (
            <Link key={opera.id_opera} to={`/opere/${opera.id_opera}`}>
              <Book
                title={opera.titolo}
                author={opera.autori}
                anno={opera.anno_pubblicazione}
                stato_opera={opera.stato_opera}
                tipo={opera.tipo}
              />
            </Link>
          ))}
          <br />
        </div>

        {/* Nessuna opera */}
        {!loading && opere.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
            <p className="text-gray-500 text-lg">
              Nessuna opera collegata a questa serie.
            </p>
          </div>
        )}
        {/* PULSANTE TORNA ALLA LISTA — SEMPRE MOSTRATO UNA SOLA VOLTA */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/listserie")}
            className="text-blue-600 hover:underline font-medium text-lg"
          >
            ← Torna alla lista
          </button>
        </div>
      </div>
    </div>
  );
}

export default SerieDetail;
