import { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function CreateLettura() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedOpera = location.state;
  const [user, setUser] = useState(null);
  const [idUtente, setIdUtente] = useState(null);
  const [selectedOperaDetails, setSelectedOperaDetails] = useState(
    preSelectedOpera || null
  );

  const [formData, setFormData] = useState({
    id_opera: preSelectedOpera?.id_opera || null,
    data_lettura: new Date().toISOString().split("T")[0],
    volume: "",
    capitolo: "",
    pagina: "",
    stato: "da_iniziare",
    valutazione: "",
    note: "",
  });

  const [selectedOperaValue, setSelectedOperaValue] = useState(
    preSelectedOpera
      ? {
          value: preSelectedOpera.id_opera,
          label: `${preSelectedOpera.titolo} (${
            preSelectedOpera.editore || "N/A"
          })`,
        }
      : null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );

        if (response && response.ok) {
          const data = await response.json();
          const finalId = data.id || data.id_utente;
          if (finalId) setIdUtente(finalId);
        }
      } catch (err) {
        setError("Errore durante il recupero dell'utente.");
      }
    };
    fetchUserId();
  }, [navigate]);

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
      label: `${o.titolo} (${o.editore || "N/A"})`,
      fullData: o,
    }));
  };

  const handleSelectOpera = (selectedOption) => {
    setSelectedOperaValue(selectedOption);
    const operaData = selectedOption ? selectedOption.fullData : null;
    setSelectedOperaDetails(operaData);

    setFormData((prev) => ({
      ...prev,
      id_opera: selectedOption ? selectedOption.value : null,
      volume:
        operaData?.id_tipo === 1 || operaData?.tipo === "Libro"
          ? ""
          : prev.volume,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      (selectedOperaDetails?.id_tipo === 1 ||
        selectedOperaDetails?.tipo === "Libro") &&
      name === "volume"
    ) {
      return;
    }

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      if (name === "stato" && value === "da_iniziare") {
        updatedData.volume = "";
        updatedData.capitolo = "";
        updatedData.pagina = "";
      }
      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idUtente || !formData.id_opera) {
      setError("Seleziona un'opera per continuare.");
      return;
    }

    setLoading(true);
    setError("");

    const isDaIniziare = formData.stato === "da_iniziare";
    const dataToSend = {
      id_utente: parseInt(idUtente, 10),
      id_opera: formData.id_opera,
      data_lettura: formData.data_lettura || null,
      volume: isDaIniziare ? null : formData.volume ? parseInt(formData.volume, 10) : null,
      capitolo: isDaIniziare ? null : formData.capitolo ? parseInt(formData.capitolo, 10) : null,
      pagina: isDaIniziare ? null : formData.pagina ? parseInt(formData.pagina, 10) : null,
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
      setSuccessMessage("Lettura aggiunta con successo!");
      setTimeout(() => navigate("/listletture"), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante il salvataggio.");
    }
    setLoading(false);
  };

  // Stili custom per React Select per integrarsi con Tailwind
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '1rem',
      padding: '0.2rem',
      border: '1px solid #e2e8f0',
      boxShadow: 'none',
      '&:hover': { border: '1px solid #3b82f6' }
    }),
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* CARD PRINCIPALE STILE BENTO */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
          
          {/* HEADER DELLA CARD */}
          <div className="bg-gray-900 p-8 text-center">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
              Nuovo Inserimento
            </span>
            <h1 className="text-3xl font-black text-white mt-2 tracking-tight">
              Aggiungi al Diario
            </h1>
          </div>

          <div className="p-8 md:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest text-center animate-shake">
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest text-center">
                ✅ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SELECT OPERA */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Cerca Opera nel Database
                </label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={loadOpereOptions}
                  onChange={handleSelectOpera}
                  value={selectedOperaValue}
                  placeholder="Inizia a scrivere il titolo..."
                  styles={customSelectStyles}
                  isClearable
                />
              </div>

              {/* DATA E STATO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Data Lettura
                  </label>
                  <input
                    type="date"
                    name="data_lettura"
                    value={formData.data_lettura}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Stato Avanzamento
                  </label>
                  <select
                    name="stato"
                    value={formData.stato}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700 appearance-none"
                  >
                    <option value="da_iniziare">⏳ Da iniziare</option>
                    <option value="in_corso">📖 In corso</option>
                    <option value="finito">✅ Finito</option>
                    <option value="abbandonato">❌ Abbandonato</option>
                  </select>
                </div>
              </div>

              {/* PROGRESSO (VOL, CAP, PAG) */}
              <div className="bg-gray-50 rounded-4xl p-6 grid grid-cols-3 gap-4 border border-gray-100">
                {["volume", "capitolo", "pagina"].map((field) => {
                  const isFieldVolume = field === "volume";
                  const isOperaLibro = selectedOperaDetails?.id_tipo === 1 || selectedOperaDetails?.tipo === "Libro";
                  const isDisabled = formData.stato === "da_iniziare" || (isOperaLibro && isFieldVolume);

                  return (
                    <div key={field} className="space-y-2 text-center">
                      <label className={`text-[13px] font-black uppercase tracking-tighter ${isDisabled ? "text-gray-300" : "text-gray-500"}`}>
                        {field === "volume" ? "Volume" : field === "capitolo" ? "Capitolo" : "Pagina"}
                      </label>
                      <input
                        type="number"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        disabled={isDisabled}
                        placeholder={isOperaLibro && isFieldVolume ? "N/A" : "0"}
                        className={`w-full text-center px-2 py-3 rounded-xl border transition-all font-black text-lg ${
                          isDisabled 
                            ? "bg-gray-100 border-transparent text-gray-300 cursor-not-allowed" 
                            : "bg-white border-gray-200 text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* VALUTAZIONE E NOTE */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Valutazione Personale
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleChange({ target: { name: 'valutazione', value: v }})}
                        className={`flex-1 py-3 rounded-xl font-black transition-all ${
                          formData.valutazione == v 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {v} ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Note e Pensieri
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                    placeholder="Cosa ne pensi di questa lettura?"
                  />
                </div>
              </div>

              {/* AZIONI - VERDE PER CREAZIONE */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/listletture")}
                  className="flex-1 py-5 px-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading || !idUtente}
                  className="flex-2 py-5 px-8 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:bg-emerald-200 transition-all transform active:scale-95"
                >
                  {loading ? "Inviando..." : "Conferma e Salva nel Diario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateLettura;