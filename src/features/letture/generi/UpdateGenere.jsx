import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function UpdateGenere() {
  const { id_genere } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nomeGenere, setNomeGenere] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // Caricamento iniziale
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1. CARICA IL NOME ATTUALE DEL GENERE
  useEffect(() => {
    const fetchGenere = async () => {
      setFetching(true);
      setError("");

      const response = await secureFetch(
        `https://read-mine-api.vercel.app/genere/${id_genere}`,
        {},
        navigate
      );

      if (!response) return;

      if (response.ok) {
        const data = await response.json();
        // Gestisce sia 'nome_genere' che 'generi' in base alla risposta del DB
        setNomeGenere(data.nome_genere || data.generi || "");
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(
          errData.error || "Errore nel caricamento dei dati del genere."
        );
      }
      setFetching(false);
    };

    if (id_genere) fetchGenere();
  }, [id_genere, navigate]);

  // 2. GESTISCI IL SALVATAGGIO (UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (nomeGenere.trim().length < 3) {
      setError("Il nome del genere deve avere almeno 3 caratteri.");
      return;
    }

    setLoading(true);

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/genere/${id_genere}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_genere: nomeGenere.trim() }),
      },
      navigate
    );

    if (!response) return;

    if (response.ok) {
      setSuccessMessage("Genere aggiornato con successo!");
      // Reindirizza ai dettagli del genere o alla lista dopo 1.5s
      setTimeout(() => navigate(`/genere/${id_genere}`), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }

    setLoading(false);
  };

  if (fetching)
    return <p className="text-center mt-10">Caricamento in corso...</p>;

  return (
    <div>
      <Navbar setUser={setUser} setError={setError} />{" "}
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg border-t-4 border-blue-600">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Modifica Genere
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-center mb-4 border border-red-200">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-center mb-4 border border-green-200 font-bold">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome Genere *
              </label>
              <input
                type="text"
                value={nomeGenere}
                onChange={(e) => setNomeGenere(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/genere/${id_genere}`)}
                className="w-1/2 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold uppercase tracking-wide transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-bold uppercase tracking-wide transition-colors shadow-md"
              >
                {loading ? "Salvataggio..." : "Salva Modifiche"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateGenere;
