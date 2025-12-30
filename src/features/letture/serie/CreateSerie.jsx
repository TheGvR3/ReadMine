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

  // ---------------------------------------------------------------------------
  // SUBMIT FORM
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

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div>
      <Navbar setUser={setUser} setError={setError} />

      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Crea Nuova Serie
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {successMessage && (
            <p className="text-green-600 text-center mb-4 font-bold">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NOME SERIE */}
            <div>
              <label className="block text-sm font-medium">Nome Serie *</label>
              <input
                type="text"
                value={nomeSerie}
                onChange={(e) => setNomeSerie(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                placeholder="Es: One Piece"
              />
            </div>

            {/* PULSANTI */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/listserie")}
                className="w-1/3 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold uppercase tracking-wide transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-bold uppercase tracking-wide transition-colors shadow-md"
              >
                {loading ? "Creazione in corso..." : "Crea Serie"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateSerie;
