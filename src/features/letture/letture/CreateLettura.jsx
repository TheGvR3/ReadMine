import { useState } from "react";
import AsyncSelect from "react-select/async";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button"; // <-- Importiamo il Button
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext"; // <-- Importiamo l'Auth Context

function CreateLettura() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedOpera = location.state;
  
  // Niente più useEffect e fetch per recuperare l'utente!
  const { user } = useAuth();
  const idUtente = user?.id || user?.id_utente;

  const [selectedOperaDetails, setSelectedOperaDetails] = useState(preSelectedOpera || null);

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
          label: `${preSelectedOpera.titolo} (${preSelectedOpera.editore || "N/A"})`,
        }
      : null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      volume: operaData?.id_tipo === 1 || operaData?.tipo?.toLowerCase() === "libro" ? "" : prev.volume,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isOperaLibro = selectedOperaDetails?.id_tipo === 1 || selectedOperaDetails?.tipo?.toLowerCase() === "libro";
    
    if (isOperaLibro && name === "volume") return;

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

    try {
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
        setTimeout(() => navigate("/listletture"), 1000); // Ritorno più veloce (1 sec)
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore durante il salvataggio.");
      }
    } catch (err) {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  };

  // Stili custom per React Select: abbiamo aggiunto font-size 16px per evitare lo zoom su iOS!
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.75rem', // rounded-xl per coerenza
      padding: '0.25rem',
      border: '1px solid #f3f4f6', // border-gray-100
      boxShadow: 'none',
      backgroundColor: '#f9fafb', // bg-gray-50
      fontSize: '16px', // CRITICO: previene lo zoom su iOS
      '&:hover': { border: '1px solid #3b82f6' }
    }),
    input: (base) => ({ ...base, fontSize: '16px' }),
    option: (base) => ({ ...base, fontSize: '14px' })
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar /> {/* Via le props! */}
      
      {/* pb-24 aggiunto per la Bottom Nav mobile */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-10">
        
        {/* CARD PRINCIPALE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          
          {/* HEADER DELLA CARD (Scuro per contrastare con Modifica) */}
          <div className="bg-gray-900 p-6 sm:p-8 text-center">
            <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
              Nuovo Inserimento
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
              Aggiungi al Diario
            </h1>
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-center animate-shake">
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-center">
                ✅ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              
              {/* SELECT OPERA */}
              <div className="space-y-2">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
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
                  isDisabled={!!preSelectedOpera} // Blocca la select se l'opera è stata passata dal Dettaglio
                />
              </div>

              {/* DATA E STATO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Stato Avanzamento
                  </label>
                  <div className="relative">
                    <select
                      name="stato"
                      value={formData.stato}
                      onChange={handleChange}
                      // text-base previene l'auto-zoom su mobile
                      className="w-full pl-4 pr-10 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700 text-base sm:text-sm appearance-none"
                    >
                      <option value="da_iniziare">⏳ Da iniziare</option>
                      <option value="in_corso">📖 In corso</option>
                      <option value="finito">✅ Finito</option>
                      <option value="abbandonato">❌ Abbandonato</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Data Lettura
                  </label>
                  <input
                    type="date"
                    name="data_lettura"
                    value={formData.data_lettura}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* PROGRESSO (VOL, CAP, PAG) */}
              <div className="bg-gray-50/80 rounded-2xl p-4 sm:p-6 grid grid-cols-3 gap-2 sm:gap-4 border border-gray-100 shadow-inner">
                {["volume", "capitolo", "pagina"].map((field) => {
                  const isFieldVolume = field === "volume";
                  const isOperaLibro = selectedOperaDetails?.id_tipo === 1 || selectedOperaDetails?.tipo?.toLowerCase() === "libro";
                  const isDisabled = formData.stato === "da_iniziare" || (isOperaLibro && isFieldVolume);

                  return (
                    <div key={field} className="space-y-1.5 sm:space-y-2 text-center">
                      <label className={`text-[9px] sm:text-[11px] font-black uppercase tracking-widest ${isDisabled ? "text-gray-300" : "text-gray-500"}`}>
                        {field.substring(0,3)}
                        <span className="hidden sm:inline">{field.substring(3)}</span>
                      </label>
                      <input
                        type="number"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        disabled={isDisabled}
                        placeholder={isOperaLibro && isFieldVolume ? "-" : "0"}
                        className={`w-full text-center px-1 sm:px-2 py-2.5 sm:py-3 rounded-xl transition-all font-black text-base sm:text-lg outline-none ${
                          isDisabled 
                            ? "bg-gray-100 border-transparent text-gray-300 cursor-not-allowed" 
                            : "bg-white border border-gray-200 text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* VALUTAZIONE E NOTE */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Valutazione Personale
                  </label>
                  <div className="flex gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleChange({ target: { name: 'valutazione', value: v }})}
                        className={`flex-1 py-2.5 sm:py-3 rounded-xl font-black transition-all text-xs sm:text-sm ${
                          formData.valutazione >= v 
                            ? "bg-yellow-400 text-white shadow-sm shadow-yellow-200" 
                            : "bg-gray-50 border border-gray-100 text-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Note e Pensieri
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 text-base sm:text-sm resize-none"
                    placeholder="Annota i tuoi progressi..."
                  />
                </div>
              </div>

              {/* AZIONI: Usiamo il componente Button */}
              <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-gray-50">
                <Button
                  variant="outlineBlue"
                  onClick={() => navigate(-1)} // navigate(-1) torna esattamente alla pagina precedente in modo intelligente!
                  className="w-full md:flex-1 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="success" // Verde per la creazione!
                  disabled={loading || !idUtente}
                  className="w-full md:flex-2"
                >
                  {loading ? "Inviando..." : "Conferma e Salva"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateLettura;