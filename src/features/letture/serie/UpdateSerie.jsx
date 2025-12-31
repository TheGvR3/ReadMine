import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function UpdateSerie() {
  const { id_serie } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nomeSerie, setNomeSerie] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        setNomeSerie(data.nome_serie || "");
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Errore nel caricamento della serie.");
      }
      setFetching(false);
    };

    if (id_serie) fetchSerie();
  }, [id_serie, navigate]);

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
      setTimeout(() => navigate(`/serie/${id_serie}`), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }
    setLoading(false);
  };

  if (fetching) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="font-black text-gray-400 uppercase tracking-widest animate-pulse">Recupero dati serie...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          
          {/* Header con accento Blu (Modifica) */}
          <div className="bg-blue-50 p-8 border-b border-gray-100 text-center">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Modifica Serie
            </h1>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-2">
              Aggiorna le informazioni della serie
            </p>
          </div>

          <div className="p-8">
            {/* Feedback Visivo */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-black uppercase tracking-widest border border-red-100 text-center">
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-blue-50 text-blue-600 p-4 rounded-xl mb-6 text-xs font-black uppercase tracking-widest border border-blue-100 text-center">
                ✅ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Input Nome Serie */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nome della Serie *
                </label>
                <input
                  type="text"
                  value={nomeSerie}
                  onChange={(e) => setNomeSerie(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700 text-lg"
                />
              </div>

              {/* Pulsanti Azione */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/serie/${id_serie}`)}
                  className="flex-1 py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-4 px-6 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:bg-gray-300 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-100"
                >
                  {loading ? "Salvataggio..." : "Salva Modifiche"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          Le modifiche verranno applicate a tutte le opere collegate
        </p>
      </div>
    </div>
  );
}

export default UpdateSerie;