import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function UpdateSerie() {
  const { id_serie } = useParams(); // Prende l'id dall'URL
  const navigate = useNavigate();

  const [nomeSerie, setNomeSerie] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // Stato per il caricamento iniziale
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ---------------------------------------------------------------------------
  // 1. CARICAMENTO DATI ESISTENTI
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchSerie = async () => {
      setFetching(true);
      setError("");

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/serie/${id_serie}`,
        {},
        navigate
      );

      if (!response) return;

      if (response.ok) {
        const data = await response.json();
        // Assicurati che 'nome_serie' sia il nome corretto restituito dal tuo backend
        setNomeSerie(data.nome_serie || "");
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Errore nel caricamento della serie.");
      }
      setFetching(false);
    };

    if (id_serie) fetchSerie();
  }, [id_serie, navigate]);

  // ---------------------------------------------------------------------------
  // 2. SALVATAGGIO MODIFICHE (PUT)
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomeSerie.trim()) {
      setError("Il nome della serie è obbligatorio.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/serie/${id_serie}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_serie: nomeSerie.trim() }),
      },
      navigate
    );

    if (!response) return;

    if (response.ok) {
      setSuccessMessage("Serie aggiornata con successo!");
      // Reindirizza alla lista dopo un breve delay
      setTimeout(() => navigate(`/serie/${id_serie}`), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }

    setLoading(false);
  };

  if (fetching)
    return (
      <p className="text-center mt-10 text-gray-600">
        Caricamento dati in corso...
      </p>
    );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div>
      <Navbar setUser={setUser} setError={setError} />

      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
            Modifica Serie
          </h1>

          {error && (
            <p className="text-red-500 text-center mb-4 font-semibold">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-green-600 text-center mb-4 font-bold">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NOME SERIE */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome Serie *
              </label>
              <input
                type="text"
                value={nomeSerie}
                onChange={(e) => setNomeSerie(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* PULSANTI AZIONE */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/serie/${id_serie}`)}
                className="w-1/2 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold uppercase tracking-wide transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-bold uppercase tracking-wide transition-colors"
              >
                {loading ? "Salvataggio..." : "Salva"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateSerie;
