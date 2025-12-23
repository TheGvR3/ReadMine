import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function UpdateAutore() {
  const { id_autore } = useParams();
  const navigate = useNavigate();

  const [nomeAutore, setNomeAutore] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // Per il caricamento iniziale del dato
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1. CARICA IL NOME ATTUALE DELL'AUTORE DIRETTAMENTE
  useEffect(() => {
    const fetchAutore = async () => {
      setFetching(true);
      setError("");

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/autori/${id_autore}`,
        {},
        navigate
      );

      if (!response) return;

      if (response.ok) {
        const data = await response.json();
        // Assicurati che 'nome_autore' sia il nome corretto del campo nel tuo database
        setNomeAutore(data.nome_autore || "");
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(
          errData.error || "Errore nel caricamento dei dati dell'autore."
        );
      }
      setFetching(false);
    };

    if (id_autore) fetchAutore();
  }, [id_autore, navigate]);

  // 2. GESTISCI IL SALVATAGGIO (UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (nomeAutore.trim().length < 3) {
      setError("Il nome dell'autore deve avere almeno 3 caratteri.");
      return;
    }

    setLoading(true);

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/autori/${id_autore}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_autore: nomeAutore.trim() }),
      },
      navigate
    );

    if (!response) return;

    if (response.ok) {
      setSuccessMessage("Autore aggiornato con successo!");
      setTimeout(() => navigate(`/autore/${id_autore}`), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }

    setLoading(false);
  };

  if (fetching) return <p className="text-center mt-10">Caricamento...</p>;

  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Modifica Autore
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {successMessage && (
            <p className="text-green-600 text-center mb-4 font-bold">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nome Autore *</label>
              <input
                type="text"
                value={nomeAutore}
                onChange={(e) => setNomeAutore(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/autore/${id_autore}`)}
                className="w-1/2 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-bold"
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

export default UpdateAutore;
