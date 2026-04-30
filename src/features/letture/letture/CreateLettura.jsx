import { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button";
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext";

const today = () => new Date().toISOString().split("T")[0];

function CreateLettura() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedOpera = location.state;

  const { user } = useAuth();
  const idUtente = user?.id || user?.id_utente;

  const [selectedOperaDetails, setSelectedOperaDetails] = useState(preSelectedOpera || null);
  const [edizioniOpera, setEdizioniOpera] = useState([]);

  const [formData, setFormData] = useState({
    id_opera: preSelectedOpera?.id_opera || null,
    id_edizione: null,
    data_inizio: "",
    data_fine: "",
    volume: "",
    capitolo: "",
    pagina: "",
    stato: "da_iniziare",
    valutazione: "",
    note: "",
  });

  const [selectedOperaValue, setSelectedOperaValue] = useState(
    preSelectedOpera
      ? { value: preSelectedOpera.id_opera, label: preSelectedOpera.titolo }
      : null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Quando cambia opera, carica le edizioni
  useEffect(() => {
    const idOpera = formData.id_opera;
    if (!idOpera) {
      setEdizioniOpera([]);
      return;
    }
    (async () => {
      const res = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/edizioni/opera/${idOpera}`,
        { method: "GET" },
        navigate
      );
      if (res?.ok) {
        const list = await res.json();
        setEdizioniOpera(list);
        // Se c'è una sola edizione, pre-seleziona
        if (list.length === 1) {
          setFormData((prev) => ({ ...prev, id_edizione: list[0].id_edizione }));
        }
      }
    })();
  }, [formData.id_opera, navigate]);

  const loadOpereOptions = async (input) => {
    if (!input) return [];
    const res = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere/search/${encodeURIComponent(input)}`,
      { method: "GET" },
      navigate
    );
    if (!res?.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.data || [];
    return list.map((o) => ({
      value: o.id_opera,
      label: o.autori ? `${o.titolo} — ${o.autori}` : o.titolo,
      fullData: o,
    }));
  };

  const handleSelectOpera = (selectedOption) => {
    setSelectedOperaValue(selectedOption);
    const operaData = selectedOption?.fullData || null;
    setSelectedOperaDetails(operaData);
    setFormData((prev) => ({
      ...prev,
      id_opera: selectedOption?.value || null,
      id_edizione: null,
    }));
  };

  // Auto-fill date in base allo stato (l'utente può sovrascrivere)
  const handleStatoChange = (newStato) => {
    setFormData((prev) => {
      const upd = { stato: newStato };
      const t = today();
      if (newStato === "in_corso" && !prev.data_inizio) upd.data_inizio = t;
      if (newStato === "finito") {
        if (!prev.data_fine) upd.data_fine = t;
        if (!prev.data_inizio) upd.data_inizio = t;
      }
      if (newStato === "da_iniziare") {
        upd.volume = "";
        upd.capitolo = "";
        upd.pagina = "";
      }
      return { ...prev, ...upd };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "stato") return handleStatoChange(value);

    const isLibro =
      selectedOperaDetails?.id_tipo === 1 ||
      selectedOperaDetails?.tipo?.toLowerCase() === "libro";
    if (isLibro && name === "volume") return;

    setFormData((prev) => ({ ...prev, [name]: value }));
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
      id_edizione: formData.id_edizione || null,
      data_inizio: formData.data_inizio || null,
      data_fine: formData.data_fine || null,
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

      if (response?.ok) {
        setSuccessMessage("Lettura aggiunta con successo!");
        setTimeout(() => navigate("/listletture"), 1000);
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

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      padding: "0.25rem",
      border: "1px solid #f3f4f6",
      boxShadow: "none",
      backgroundColor: "#f9fafb",
      fontSize: "16px",
      "&:hover": { border: "1px solid #3b82f6" },
    }),
    input: (base) => ({ ...base, fontSize: "16px" }),
    option: (base) => ({ ...base, fontSize: "14px" }),
  };

  const isLibro =
    selectedOperaDetails?.id_tipo === 1 ||
    selectedOperaDetails?.tipo?.toLowerCase() === "libro";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
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
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-center">
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
                  isDisabled={!!preSelectedOpera}
                />
              </div>

              {/* SELECT EDIZIONE (se ci sono edizioni multiple) */}
              {edizioniOpera.length > 1 && (
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Edizione (opzionale)
                  </label>
                  <select
                    name="id_edizione"
                    value={formData.id_edizione || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        id_edizione: e.target.value ? parseInt(e.target.value, 10) : null,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 text-base sm:text-sm"
                  >
                    <option value="">Non specificare</option>
                    {edizioniOpera.map((e) => (
                      <option key={e.id_edizione} value={e.id_edizione}>
                        {e.editore || "Editore N/A"}
                        {e.anno_pubblicazione && ` (${e.anno_pubblicazione})`}
                        {e.lingua && ` — ${e.lingua}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* STATO E DATE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Stato
                  </label>
                  <select
                    name="stato"
                    value={formData.stato}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700 text-base sm:text-sm"
                  >
                    <option value="da_iniziare">⏳ Da iniziare</option>
                    <option value="in_corso">📖 In corso</option>
                    <option value="finito">✅ Finito</option>
                    <option value="abbandonato">❌ Abbandonato</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Inizio
                  </label>
                  <input
                    type="date"
                    name="data_inizio"
                    value={formData.data_inizio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 text-base sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Fine
                  </label>
                  <input
                    type="date"
                    name="data_fine"
                    value={formData.data_fine}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* PROGRESSO */}
              <div className="bg-gray-50/80 rounded-2xl p-4 sm:p-6 grid grid-cols-3 gap-2 sm:gap-4 border border-gray-100">
                {["volume", "capitolo", "pagina"].map((field) => {
                  const isFieldVolume = field === "volume";
                  const isDisabled =
                    formData.stato === "da_iniziare" || (isLibro && isFieldVolume);
                  return (
                    <div key={field} className="space-y-1.5 text-center">
                      <label
                        className={`text-[9px] sm:text-[11px] font-black uppercase tracking-widest ${
                          isDisabled ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {field.substring(0, 3)}
                        <span className="hidden sm:inline">{field.substring(3)}</span>
                      </label>
                      <input
                        type="number"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        disabled={isDisabled}
                        placeholder={isLibro && isFieldVolume ? "-" : "0"}
                        className={`w-full text-center px-1 sm:px-2 py-2.5 sm:py-3 rounded-xl font-black text-base sm:text-lg outline-none ${
                          isDisabled
                            ? "bg-gray-100 border-transparent text-gray-300 cursor-not-allowed"
                            : "bg-white border border-gray-200 text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* VALUTAZIONE */}
              <div className="space-y-2">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Valutazione
                </label>
                <div className="flex gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, valutazione: v }))
                      }
                      className={`flex-1 py-2.5 sm:py-3 rounded-xl font-black transition-all text-xs sm:text-sm ${
                        formData.valutazione >= v
                          ? "bg-yellow-400 text-white"
                          : "bg-gray-50 border border-gray-100 text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* NOTE */}
              <div className="space-y-2">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-700 text-base sm:text-sm resize-none"
                  placeholder="Annota i tuoi progressi..."
                />
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-gray-50">
                <Button
                  variant="outlineBlue"
                  onClick={() => navigate(-1)}
                  className="w-full md:flex-1 bg-white"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="success"
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
