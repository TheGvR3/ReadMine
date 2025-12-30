import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function CreateOpera() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titolo: "",
    tipo_opera: "",
    stato_opera: "finito",
    id_serie: null,
    anno_pubblicazione: "",
    editore: "",
    lingua_originale: "",
    autori: [],
    generi: [],
  });

  const [tipiList, setTipiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ---------------------------------------------------------------------------
  // FUNZIONI DI RICERCA (Autori, Generi, Serie)
  // ---------------------------------------------------------------------------

  const loadAutoriOptions = async (inputValue) => {
    if (!inputValue) return [];

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/autori/search/${inputValue}`,
      { method: "GET" },
      navigate
    );

    if (!response || !response.ok) return [];
    const data = await response.json();

    return data.map((a) => ({ value: a.id_autore, label: a.nome_autore }));
  };

  const loadGeneriOptions = async (inputValue) => {
    if (!inputValue) return [];

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/genere/search/${inputValue}`,
      { method: "GET" },
      navigate
    );

    if (!response || !response.ok) return [];
    const data = await response.json();

    return data.map((g) => ({ value: g.id_genere, label: g.nome_genere }));
  };

  const loadSerieOptions = async (inputValue) => {
    if (!inputValue) return [];

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/serie/search/${inputValue}`,
      { method: "GET" },
      navigate
    );

    if (!response || !response.ok) return [];
    const data = await response.json();

    return data.map((s) => ({ value: s.id_serie, label: s.nome_serie }));
  };

  // ---------------------------------------------------------------------------
  // CARICAMENTO TIPI OPERA
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fetchTipi = async () => {
      setDataLoading(true);

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/tipo`,
        { method: "GET" },
        navigate
      );

      if (response && response.ok) {
        setTipiList(await response.json());
      } else {
        setError("Errore nel caricamento dei tipi opera.");
      }

      setDataLoading(false);
    };

    fetchTipi();
  }, [navigate]);

  // ---------------------------------------------------------------------------
  // GESTORI EVENTI
  // ---------------------------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (selectedOptions, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selectedOptions ? selectedOptions.map((o) => o.value) : [],
    }));
  };

  const handleSingleSelectChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      id_serie: selectedOption ? selectedOption.value : null,
    }));
  };

  // ---------------------------------------------------------------------------
  // SUBMIT FORM
  // ---------------------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.titolo ||
      !formData.anno_pubblicazione ||
      !formData.tipo_opera ||
      formData.autori.length === 0 ||
      formData.generi.length === 0
    ) {
      setError("Compila i campi obbligatori (*).");
      return;
    }

    setLoading(true);
    setError("");

    const dataToSend = {
      ...formData,
      tipo_opera: parseInt(formData.tipo_opera, 10),
      anno_pubblicazione: parseInt(formData.anno_pubblicazione, 10),
      editore: formData.editore || null,
      lingua_originale: formData.lingua_originale || null,
    };

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      },
      navigate
    );

    if (response && response.ok) {
      setSuccessMessage("Opera creata con successo!");
      setTimeout(() => navigate("/ListOpere"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante la creazione.");
    }

    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // RENDER — stile richiesto
  // ---------------------------------------------------------------------------

  return (
    <div>
      <Navbar setUser={setUser} setError={setError} />

      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Crea Nuova Opera
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {successMessage && (
            <p className="text-green-600 text-center mb-4 font-bold">
              {successMessage}
            </p>
          )}

          {!dataLoading && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TITOLO */}
              <div>
                <label className="block text-sm font-medium">Titolo *</label>
                <input
                  type="text"
                  name="titolo"
                  value={formData.titolo}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* ANNO + TIPO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Anno Pubblicazione *
                  </label>
                  <input
                    type="number"
                    name="anno_pubblicazione"
                    value={formData.anno_pubblicazione}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Tipo *</label>
                  <select
                    name="tipo_opera"
                    value={formData.tipo_opera}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Seleziona</option>
                    {tipiList.map((t) => (
                      <option key={t.id_tipo} value={t.id_tipo}>
                        {t.nome_tipo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STATO + LINGUA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Stato</label>
                  <select
                    name="stato_opera"
                    value={formData.stato_opera}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  >
                    <option value="finito">Finito</option>
                    <option value="in corso">In corso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Lingua Originale
                  </label>
                  <input
                    type="text"
                    name="lingua_originale"
                    value={formData.lingua_originale}
                    onChange={handleChange}
                    placeholder="Es: Giapponese"
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* EDITORE */}
              <div>
                <label className="block text-sm font-medium">Editore</label>
                <input
                  type="text"
                  name="editore"
                  value={formData.editore}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* AUTORI */}
              <div>
                <label className="block text-sm font-medium">Autori *</label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  loadOptions={loadAutoriOptions}
                  onChange={(sel) => handleMultiSelectChange(sel, "autori")}
                  placeholder="Cerca autori..."
                  className="mt-1"
                />
              </div>

              {/* GENERI */}
              <div>
                <label className="block text-sm font-medium">Generi *</label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  loadOptions={loadGeneriOptions}
                  onChange={(sel) => handleMultiSelectChange(sel, "generi")}
                  placeholder="Cerca generi..."
                  className="mt-1"
                />
              </div>

              {/* SERIE */}
              <div>
                <label className="block text-sm font-medium">Serie</label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={loadSerieOptions}
                  onChange={handleSingleSelectChange}
                  isClearable
                  placeholder="Cerca serie..."
                  className="mt-1"
                />
              </div>

              {/* PULSANTI */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/listsopere")}
                className="w-1/3 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold uppercase tracking-wide transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-bold uppercase tracking-wide transition-colors shadow-md"
              >
                {loading ? "Creazione in corso..." : "Crea Opera"}
              </button>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateOpera;
