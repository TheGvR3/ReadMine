import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function CreateGenere() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nomeGenere, setNomeGenere] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (nomeGenere.trim().length < 3) {
      setError("Il nome del genere deve avere almeno 3 caratteri.");
      return;
    }

    if (nomeGenere.trim().length > 50) {
      setError("Il nome del genere non può superare i 50 caratteri.");
      return;
    }

    setLoading(true);

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/genere/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_genere: nomeGenere.trim() }),
      },
      navigate
    );

    if (!response) return;

    if (response.ok) {
      setSuccessMessage("Genere creato con successo!");
      setTimeout(() => navigate("/ListGeneri"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante la creazione del genere.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />

      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          
          {/* Header con accento Verde (Creazione) */}
          <div className="bg-green-50 p-8 border-b border-gray-100 text-center">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Nuovo Genere
            </h1>
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] mt-2">
              Classifica le tue opere con una nuova categoria
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
              <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-xs font-black uppercase tracking-widest border border-green-100 text-center">
                ✅ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Nome Genere */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nome Genere *
                </label>
                <input
                  type="text"
                  value={nomeGenere}
                  onChange={(e) => setNomeGenere(e.target.value)}
                  required
                  placeholder="Es: Cyberpunk, Slice of Life..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-bold text-gray-700 text-lg placeholder:text-gray-300"
                />
              </div>

              {/* Pulsanti Azione */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/listgeneri")}
                  className="flex-1 py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-4 px-6 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:bg-gray-300 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-green-100"
                >
                  {loading ? "Creazione..." : "Crea Genere"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          Evita duplicati per mantenere il database pulito
        </p>
      </div>
    </div>
  );
}

export default CreateGenere;