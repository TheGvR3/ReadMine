import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function CreateLettura() {
  const navigate = useNavigate();

  // Recupero l'utente dal localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const id_utente = storedUser?.id;

  const [formData, setFormData] = useState({
    id_opera: null,
    data_lettura: new Date().toISOString().split('T')[0], // Default a oggi
    volume: "",
    capitolo: "",
    pagina: "",
    stato: "da_iniziare",
    valutazione: "",
    note: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ---------------------------------------------------------------------------
  // RICERCA OPERE (per selezionare cosa aggiungere al diario)
  // ---------------------------------------------------------------------------
  const loadOpereOptions = async (inputValue) => {
    if (!inputValue) return [];

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere/search/${inputValue}`,
      { method: "GET" },
      navigate
    );

    if (!response || !response.ok) return [];
    const data = await response.json();

    return data.map((o) => ({ 
      value: o.id_opera, 
      label: `${o.titolo} (${o.editore || 'N/A'})` 
    }));
  };

  // ---------------------------------------------------------------------------
  // GESTORI EVENTI
  // ---------------------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectOpera = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      id_opera: selectedOption ? selectedOption.value : null,
    }));
  };

  // ---------------------------------------------------------------------------
  // SUBMIT FORM
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id_utente) {
      setError("Devi aver effettuato il login.");
      return;
    }

    if (!formData.id_opera) {
      setError("Seleziona un'opera dalla lista.");
      return;
    }

    setLoading(true);
    setError("");

    const dataToSend = {
      id_utente: id_utente,
      id_opera: formData.id_opera,
      data_lettura: formData.data_lettura || null,
      volume: formData.volume ? parseInt(formData.volume, 10) : null,
      capitolo: formData.capitolo ? parseInt(formData.capitolo, 10) : null,
      pagina: formData.pagina ? parseInt(formData.pagina, 10) : null,
      stato: formData.stato,
      valutazione: formData.valutazione ? parseInt(formData.valutazione, 10) : null,
      note: formData.note || null,
    };

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/letture`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      },
      navigate
    );

    if (response && response.ok) {
      setSuccessMessage("Lettura aggiunta al diario!");
      setTimeout(() => navigate("/listletture"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante il salvataggio.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex justify-center items-center py-10 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Aggiungi al Diario
          </h1>

          {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}
          {successMessage && (
            <p className="text-green-600 text-center mb-4 font-bold">{successMessage}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* RICERCA OPERA */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Cerca Opera *</label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadOpereOptions}
                onChange={handleSelectOpera}
                placeholder="Digita il titolo dell'opera..."
                className="mt-1"
                isClearable
              />
            </div>

            {/* DATA E STATO */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Data Lettura</label>
                <input
                  type="date"
                  name="data_lettura"
                  value={formData.data_lettura}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Stato</label>
                <select
                  name="stato"
                  value={formData.stato}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                >
                  <option value="da_iniziare">Da iniziare</option>
                  <option value="in_corso">In corso</option>
                  <option value="finito">Finito</option>
                </select>
              </div>
            </div>

            {/* PROGRESSO (Volume, Capitolo, Pagina) */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Volume</label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  placeholder="Es: 1"
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Capitolo</label>
                <input
                  type="number"
                  name="capitolo"
                  value={formData.capitolo}
                  onChange={handleChange}
                  placeholder="Es: 12"
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Pagina</label>
                <input
                  type="number"
                  name="pagina"
                  value={formData.pagina}
                  onChange={handleChange}
                  placeholder="Es: 200"
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* VALUTAZIONE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Valutazione (1-5)</label>
              <select
                name="valutazione"
                value={formData.valutazione}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              >
                <option value="">Nessun voto</option>
                <option value="1">1 ⭐ (Scarso)</option>
                <option value="2">2 ⭐ (Sufficiente)</option>
                <option value="3">3 ⭐ (Buono)</option>
                <option value="4">4 ⭐ (Ottimo)</option>
                <option value="5">5 ⭐ (Capolavoro)</option>
              </select>
            </div>

            {/* NOTE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Note personali</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                placeholder="Cosa ne pensi?"
              ></textarea>
            </div>

            {/* PULSANTI */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/listletture")}
                className="w-1/3 py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500 font-bold transition-colors"
              >
                Indietro
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-bold shadow-md transition-colors"
              >
                {loading ? "Salvataggio..." : "Salva nel diario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateLettura;