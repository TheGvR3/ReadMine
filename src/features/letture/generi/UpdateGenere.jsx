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
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        setNomeGenere(data.nome_genere || data.generi || "");
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Errore nel caricamento dei dati del genere.");
      }
      setFetching(false);
    };

    if (id_genere) fetchGenere();
  }, [id_genere, navigate]);

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
      setTimeout(() => navigate(`/genere/${id_genere}`), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }

    setLoading(false);
  };

  if (fetching) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="font-black text-gray-400 uppercase tracking-widest animate-pulse">Recupero categoria...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          
          {/* Header Bento con accento Blu (Modifica) */}
          <div className="bg-blue-50 p-8 border-b border-gray-100 text-center">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Modifica Genere
            </h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mt-2">
              Rinomina o correggi la categoria selezionata
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
              {/* Input Nome Genere */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Etichetta Genere *
                </label>
                <input
                  type="text"
                  value={nomeGenere}
                  onChange={(e) => setNomeGenere(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700 text-lg"
                />
              </div>

              {/* Pulsanti Azione */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/genere/${id_genere}`)}
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
          La modifica influirà su tutte le opere catalogate in questo genere
        </p>
      </div>
    </div>
  );
}

export default UpdateGenere;