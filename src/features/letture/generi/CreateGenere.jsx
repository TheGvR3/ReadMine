import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function CreateGenere() {
  const navigate = useNavigate();

  const [nomeGenere, setNomeGenere] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ---------------------------------------------------------------------------
  // SUBMIT FORM
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validazione base (almeno 3 caratteri)
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
      `${import.meta.env.VITE_API_BASE_URL}/genere/`, // Endpoint per i generi
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
      // Reindirizza alla lista generi dopo 1.5 secondi
      setTimeout(() => navigate("/ListGeneri"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante la creazione del genere.");
    }

    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // RENDER 
  // ---------------------------------------------------------------------------
  return (
    <div>
<Navbar setUser={setUser} setError={setError} />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
            Crea Nuovo Genere
          </h1>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-center">
              {error}
            </div>
          )}
          
          {successMessage && (
            <p className="text-green-600 text-center mb-4 font-bold">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NOME GENERE */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome Genere *</label>
              <input
                type="text"
                value={nomeGenere}
                onChange={(e) => setNomeGenere(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Es: Shonen, Seinen, Fantasy..."
              />
            </div>

            {/* PULSANTI */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/listgeneri")}
                className="w-1/3 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold uppercase tracking-wide transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-bold uppercase tracking-wide transition-colors shadow-md"
              >
                {loading ? "Creazione in corso..." : "Crea Genere"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateGenere;