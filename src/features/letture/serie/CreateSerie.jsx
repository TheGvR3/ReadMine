import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function CreateSerie() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nomeSerie, setNomeSerie] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomeSerie.trim()) {
      setError("Il nome della serie è obbligatorio.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/serie`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_serie: nomeSerie }),
      },
      navigate
    );

    if (!response) return;

    if (response.ok) {
      setSuccessMessage("Serie creata con successo!");
      setTimeout(() => navigate("/ListSerie"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante la creazione della serie.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          
          {/* Header con accento Verde (Creazione) */}
          <div className="bg-emerald-50 p-8 border-b border-gray-100 text-center">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Nuova Serie
            </h1>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-2">
              Organizza le tue opere sotto un unico nome
            </p>
          </div>

          <div className="p-8">
            {/* Messaggi di feedback */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-black uppercase tracking-widest border border-red-100 text-center">
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-xs font-black uppercase tracking-widest border border-emerald-100 text-center">
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
                  placeholder="Es: One Piece, Harry Potter..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-700 text-lg"
                />
              </div>

              {/* Azioni */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/listserie")}
                  className="flex-1 py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-4 px-6 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:bg-gray-300 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-100"
                >
                  {loading ? "Creazione..." : "Crea Serie"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Suggerimento info */}
        <p className="text-center mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          Le serie permettono di raggruppare volumi o capitoli diversi
        </p>
      </div>
    </div>
  );
}

export default CreateSerie;