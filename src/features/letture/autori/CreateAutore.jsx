import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function CreateAutore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [nomeAutore, setNomeAutore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ---------------------------------------------------------------------------
  // SUBMIT FORM
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (nomeAutore.trim().length < 3) {
      setError("Il nome dell'autore deve avere almeno 3 caratteri.");
      return;
    }

    if (nomeAutore.trim().length > 100) {
      setError("Il nome dell'autore non può superare i 100 caratteri.");
      return;
    }

    setLoading(true);

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/autori`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_autore: nomeAutore.trim() }),
      },
      navigate
    );

    if (!response) return;

    if (response.ok) {
      setSuccessMessage("Autore creato con successo!");
      setTimeout(() => navigate("/ListAutori"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante la creazione dell'autore.");
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
          <h1 className="text-2xl font-bold mb-6 text-center">
            Crea Nuovo Autore
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {successMessage && (
            <p className="text-green-600 text-center mb-4 font-bold">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NOME AUTORE */}
            <div>
              <label className="block text-sm font-medium">Nome Autore *</label>
              <input
                type="text"
                value={nomeAutore}
                onChange={(e) => setNomeAutore(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                placeholder="Es: Eiichiro Oda"
              />
            </div>

            {/* PULSANTI */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/listautori")}
                className="w-1/3 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold uppercase tracking-wide transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-bold uppercase tracking-wide transition-colors shadow-md"
              >
                {loading ? "Creazione in corso..." : "Crea Autore"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAutore;
