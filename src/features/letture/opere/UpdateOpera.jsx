import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AsyncSelect from "react-select/async";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function UpdateOpera() {
  const [user, setUser] = useState(null);
  const { id_opera } = useParams();
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

  const [selectedAutori, setSelectedAutori] = useState([]);
  const [selectedGeneri, setSelectedGeneri] = useState([]);
  const [selectedSerie, setSelectedSerie] = useState(null);
  const [tipiList, setTipiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Stile personalizzato per gli AsyncSelect per armonizzarli con Tailwind
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      padding: '2px',
      borderColor: '#e5e7eb',
      '&:hover': { borderColor: '#3b82f6' }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#eff6ff',
      borderRadius: '0.5rem',
      color: '#1e40af',
      fontWeight: '700'
    }),
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setDataLoading(true);
      setError("");
      try {
        const resTipi = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/tipo`, { method: "GET" }, navigate);
        if (resTipi.ok) setTipiList(await resTipi.json());

        const resOpera = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`, { method: "GET" }, navigate);

        if (resOpera.ok) {
          const data = await resOpera.json();
          setFormData({
            titolo: data.titolo || "",
            tipo_opera: data.id_tipo || "",
            stato_opera: data.stato_opera || "finito",
            id_serie: data.id_serie || null,
            anno_pubblicazione: data.anno_pubblicazione || "",
            editore: data.editore || "",
            lingua_originale: data.lingua_originale || "",
            autori: data.autori_ids || [],
            generi: data.generi_ids || [],
          });

          if (data.autori_ids && data.autori) {
            const nomiAutori = data.autori.split(", ");
            setSelectedAutori(data.autori_ids.map((id, i) => ({ value: id, label: nomiAutori[i] || `Autore #${id}` })));
          }
          if (data.generi_ids && data.generi) {
            const nomiGeneri = data.generi.split(", ");
            setSelectedGeneri(data.generi_ids.map((id, i) => ({ value: id, label: nomiGeneri[i] || `Genere #${id}` })));
          }
          if (data.id_serie && data.serie) {
            setSelectedSerie({ value: data.id_serie, label: data.serie });
          }
        } else {
          setError("Impossibile recuperare i dati dell'opera.");
        }
      } catch (err) {
        setError("Errore di connessione al server.");
      } finally {
        setDataLoading(false);
      }
    };
    if (id_opera) fetchInitialData();
  }, [id_opera, navigate]);

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
    const values = selectedOptions ? selectedOptions.map((o) => o.value) : [];
    setFormData((prev) => ({ ...prev, [fieldName]: values }));
    if (fieldName === "autori") setSelectedAutori(selectedOptions || []);
    if (fieldName === "generi") setSelectedGeneri(selectedOptions || []);
  };

  const handleSingleSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, id_serie: selectedOption ? selectedOption.value : null }));
    setSelectedSerie(selectedOption);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const dataToSend = {
      ...formData,
      tipo_opera: parseInt(formData.tipo_opera, 10),
      anno_pubblicazione: parseInt(formData.anno_pubblicazione, 10),
    };

    const response = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    }, navigate);

    if (response && response.ok) {
      setSuccessMessage("Opera aggiornata con successo!");
      setTimeout(() => navigate(`/opere/${id_opera}`), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }
    setLoading(false);
  };

  if (dataLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="font-black text-gray-400 uppercase tracking-widest animate-pulse">Caricamento dati opera...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-4xl] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          
          {/* Header Form */}
          <div className="bg-indigo-50 p-8 border-b border-gray-100 text-center">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Modifica Opera
            </h1>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-2">ID: {id_opera}</p>
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Titolo dell'opera *</label>
                <input
                  type="text"
                  name="titolo"
                  value={formData.titolo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo Opera *</label>
                  <select
                    name="tipo_opera"
                    value={formData.tipo_opera}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 appearance-none"
                  >
                    <option value="">Seleziona tipo</option>
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
                    className={`w-full px-4 py-3 border rounded-xl outline-none font-black uppercase text-xs tracking-widest transition-colors ${
                      formData.stato_opera === 'finito' ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-green-50 border-green-200 text-green-600'
                    }`}
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                />
              </div>

              {/* Multi-Selects */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Autori *</label>
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    defaultOptions
                    value={selectedAutori}
                    loadOptions={loadAutoriOptions}
                    onChange={(sel) => handleMultiSelectChange(sel, "autori")}
                    styles={customSelectStyles}
                    placeholder="Cerca autori..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Generi *</label>
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    defaultOptions
                    value={selectedGeneri}
                    loadOptions={loadGeneriOptions}
                    onChange={(sel) => handleMultiSelectChange(sel, "generi")}
                    styles={customSelectStyles}
                    placeholder="Cerca generi..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serie</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    value={selectedSerie}
                    loadOptions={loadSerieOptions}
                    onChange={handleSingleSelectChange}
                    isClearable
                    styles={customSelectStyles}
                    placeholder="Cerca serie..."
                  />
                </div>
              </div>

              {/* Pulsanti Azione */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/opere/${id_opera}`)}
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
      </div>
    </div>
  );
}

export default UpdateOpera;