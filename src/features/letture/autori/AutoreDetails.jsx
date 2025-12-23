import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Book from "../../../components/Book";
import { secureFetch } from "../../../utils/secureFetch";

function AutoreDetails() {
  const { id_autore } = useParams();
  const navigate = useNavigate();

  const [opere, setOpere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoreName, setAutoreName] = useState("");

  // ---------------------------------------------------------------------------
  // CARICA DATI (OPERE E NOME AUTORE)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(""); // Resettiamo gli errori precedenti

      // 1. Carica Nome Autore (sempre prioritario)
      const resAutore = await secureFetch(
        `http://localhost:3000/autori/${id_autore}`,
        {},
        navigate
      );
      if (resAutore && resAutore.ok) {
        const dataAutore = await resAutore.json();
        setAutoreName(dataAutore.nome_autore);
      } else {
        setError("Impossibile trovare l'autore.");
        setLoading(false);
        return;
      }

      // 2. Carica Opere
      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/opere/autore/${id_autore}`,
        {},
        navigate
      );

      if (response) {
        if (response.ok) {
          const dataOpere = await response.json();
          setOpere(dataOpere);
        } else if (response.status === 404) {
          // Caso normale: l'autore esiste ma non ha ancora opere
          setOpere([]);
        } else {
          // Errore reale di database/connessione
          setError("Errore tecnico durante il caricamento della lista opere.");
        }
      }

      setLoading(false);
    };

    if (id_autore) loadData();
  }, [id_autore, navigate]);

  // Naviga alla pagina di modifica
  const handleUpdate = () => {
    navigate(`/updateautore/${id_autore}`); // Assicurati che la rotta in App.js sia corretta
  };

  // ---------------------------------------------------------------------------
  // ELIMINA AUTORE
  // ---------------------------------------------------------------------------
  const handleDeleteAutore = async () => {
    if (opere.length > 0) {
      alert("Impossibile eliminare l'autore: contiene opere collegate.");
      return;
    }

    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare questo autore?"
    );
    if (!confirmDelete) return;

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/autori/${id_autore}`,
      { method: "DELETE" },
      navigate
    );

    if (response && response.ok) {
      alert("Autore eliminato con successo.");
      navigate("/ListAutori");
    } else {
      alert("Errore durante l'eliminazione.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER AGGIORNATO CON TASTO MODIFICA */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {loading ? "Caricamento..." : `Autore: ${autoreName}`}
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold shadow-sm"
            >
              Modifica Nome
            </button>
            <button
              onClick={handleDeleteAutore}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold shadow-sm"
            >
              Elimina
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-red-600 font-semibold mb-4">{error}</p>
        )}

        {/* LISTA OPERE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opere.map((opera) => (
            <Link key={opera.id_opera} to={`/opere/${opera.id_opera}`}>
              <Book
                title={opera.titolo}
                author={opera.autori} // Mostra la stringa di tutti gli autori
                anno={opera.anno_pubblicazione}
                stato_opera={opera.stato_opera}
                tipo={opera.tipo}
              />
            </Link>
          ))}
        </div>

        {/* NESSUNA OPERA */}
        {!loading && opere.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed mt-6">
            <p className="text-gray-500 text-lg">
              Nessuna opera collegata a questo autore.
            </p>
          </div>
        )}

        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/listautori")}
            className="text-blue-600 hover:underline font-medium text-lg"
          >
            ← Torna alla lista
          </button>
        </div>
      </div>
    </div>
  );
}

export default AutoreDetails;
