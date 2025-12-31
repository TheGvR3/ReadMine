import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function CreateOpera() {
  const [user, setUser] = useState(null);
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

  // Stile personalizzato per gli AsyncSelect
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      padding: '2px',
      borderColor: '#e5e7eb',
      '&:hover': { borderColor: '#10b981' } // Verde in hover
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#ecfdf5',
      borderRadius: '0.5rem',
      color: '#065f46',
      fontWeight: '700'
    }),
  };

  useEffect(() => {
    const fetchTipi = async () => {
      setDataLoading(true);
      const response = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/tipo`, { method: "GET" }, navigate);
      if (response && response.ok) {
        setTipiList(await response.json());
      } else {
        setError("Errore nel caricamento dei tipi opera.");
      }
      setDataLoading(false);
    };
    fetchTipi();
  }, [navigate]);

  const loadAutoriOptions = async (inputValue) => {
    if (!inputValue) return [];
    const response = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/autori/search/${inputValue}`, { method: "GET" }, navigate);
    if (!response || !response.ok) return [];
    const data = await response.json();
    return data.map((a) => ({ value: a.id_autore, label: a.nome_autore }));
  };

  const loadGeneriOptions = async (inputValue) => {
    if (!inputValue) return [];
    const response = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/genere/search/${inputValue}`, { method: "GET" }, navigate);
    if (!response || !response.ok) return [];
    const data = await response.json();
    return data.map((g) => ({ value: g.id_genere, label: g.nome_genere }));
  };

  const loadSerieOptions = async (inputValue) => {
    if (!inputValue) return [];
    const response = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/serie/search/${inputValue}`, { method: "GET" }, navigate);
    if (!response || !response.ok) return [];
    const data = await response.json();
    return data.map((s) => ({ value: s.id_serie, label: s.nome_serie }));
  };

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
    setFormData((prev) => ({ ...prev, id_serie: selectedOption ? selectedOption.value : null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titolo || !formData.anno_pubblicazione || !formData.tipo_opera || formData.autori.length === 0 || formData.generi.length === 0) {
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

    const response = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/opere`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    }, navigate);

    if (response && response.ok) {
      setSuccessMessage("Opera creata con successo!");
      setTimeout(() => navigate("/ListOpere"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante la creazione.");
    }
    setLoading(false);
  };

  if (dataLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="font-black text-gray-400 uppercase tracking-widest animate-pulse">Inizializzazione modulo...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          
          {/* Header Form */}
          <div className="bg-green-200 p-8 border-b border-gray-100 text-center">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Nuova Opera
            </h1>
            <p className="text-xs font-bold text-green-500 uppercase tracking-widest mt-2">Aggiungi un titolo al database</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-black uppercase tracking-widest border border-red-100">
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-xs font-black uppercase tracking-widest border border-green-100">
                ✅ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titolo */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Titolo *</label>
                <input
                  type="text"
                  name="titolo"
                  value={formData.titolo}
                  onChange={handleChange}
                  required
                  placeholder="Inserisci il titolo dell'opera"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                />
              </div>

              {/* Anno e Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Anno Pubblicazione *</label>
                  <input
                    type="number"
                    name="anno_pubblicazione"
                    value={formData.anno_pubblicazione}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo Opera *</label>
                  <select
                    name="tipo_opera"
                    value={formData.tipo_opera}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700 appearance-none"
                  >
                    <option value="">Seleziona</option>
                    {tipiList.map((t) => (
                      <option key={t.id_tipo} value={t.id_tipo}>{t.nome_tipo}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stato e Lingua */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stato</label>
                  <select
                    name="stato_opera"
                    value={formData.stato_opera}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-black uppercase text-xs tracking-widest"
                  >
                    <option value="finito">Finito</option>
                    <option value="in corso">In corso</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lingua Originale</label>
                  <input
                    type="text"
                    name="lingua_originale"
                    value={formData.lingua_originale}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                  />
                </div>
              </div>

              {/* Editore */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Editore</label>
                <input
                  type="text"
                  name="editore"
                  value={formData.editore}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                />
              </div>

              {/* Multi-Selects Asincroni */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Autori *</label>
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    loadOptions={loadAutoriOptions}
                    onChange={(sel) => handleMultiSelectChange(sel, "autori")}
                    styles={customSelectStyles}
                    placeholder="Cerca e seleziona autori..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Generi *</label>
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    loadOptions={loadGeneriOptions}
                    onChange={(sel) => handleMultiSelectChange(sel, "generi")}
                    styles={customSelectStyles}
                    placeholder="Cerca e seleziona generi..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serie</label>
                  <AsyncSelect
                    cacheOptions
                    loadOptions={loadSerieOptions}
                    onChange={handleSingleSelectChange}
                    isClearable
                    styles={customSelectStyles}
                    placeholder="Collega a una serie (opzionale)..."
                  />
                </div>
              </div>

              {/* Pulsanti Azione */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/listopere")}
                  className="flex-1 py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-4 px-6 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:bg-gray-300 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-green-100"
                >
                  {loading ? "Creazione..." : "Crea Opera"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOpera;