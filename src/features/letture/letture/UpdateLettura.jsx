import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button";
import { secureFetch } from "../../../utils/secureFetch";

const today = () => new Date().toISOString().split("T")[0];

function UpdateLettura() {
  const { id_lettura } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    data_inizio: "",
    data_fine: "",
    volume: "",
    capitolo: "",
    pagina: "",
    stato: "",
    valutazione: "",
    note: "",
    id_edizione: null,
  });

  const [obraInfo, setObraInfo] = useState(null);
  const [edizioniOpera, setEdizioniOpera] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isLibro =
    obraInfo?.id_tipo === 1 || obraInfo?.tipo?.toLowerCase() === "libro";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchAll = async () => {
      setDataLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        const resLettura = await secureFetch(
          `${baseUrl}/letture/lettura/${id_lettura}`,
          { method: "GET" },
          navigate
        );
        if (!resLettura?.ok) throw new Error("Lettura non trovata");
        const letturaData = await resLettura.json();

        const idOpera = letturaData.id_opera || letturaData.opere?.id_opera;
        if (idOpera) {
          // Opera (per sapere se è "Libro" → disabilita volume)
          const resOpera = await secureFetch(
            `${baseUrl}/opere/${idOpera}`,
            { method: "GET" },
            navigate
          );
          if (resOpera?.ok) setObraInfo(await resOpera.json());

          // Edizioni dell'opera per il dropdown
          const resEdz = await secureFetch(
            `${baseUrl}/edizioni/opera/${idOpera}`,
            { method: "GET" },
            navigate
          );
          if (resEdz?.ok) setEdizioniOpera(await resEdz.json());
        }

        setFormData({
          data_inizio: letturaData.data_inizio
            ? letturaData.data_inizio.split("T")[0]
            : "",
          data_fine: letturaData.data_fine
            ? letturaData.data_fine.split("T")[0]
            : "",
          volume: letturaData.volume ?? "",
          capitolo: letturaData.capitolo ?? "",
          pagina: letturaData.pagina ?? "",
          stato: letturaData.stato || "da_iniziare",
          valutazione: letturaData.valutazione ?? "",
          note: letturaData.note || "",
          id_edizione: letturaData.id_edizione || null,
        });
      } catch (err) {
        setError(err.message || "Errore durante il caricamento.");
      } finally {
        setDataLoading(false);
      }
    };

    if (id_lettura) fetchAll();
  }, [id_lettura, navigate]);

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
    if (isLibro && name === "volume") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isDaIniziare = formData.stato === "da_iniziare";
    const dataToSend = {
      data_inizio: formData.data_inizio || null,
      data_fine: formData.data_fine || null,
      volume:
        isDaIniziare || isLibro
          ? null
          : formData.volume !== "" ? parseInt(formData.volume, 10) : null,
      capitolo: isDaIniziare ? null : formData.capitolo !== "" ? parseInt(formData.capitolo, 10) : null,
      pagina: isDaIniziare ? null : formData.pagina !== "" ? parseInt(formData.pagina, 10) : null,
      stato: formData.stato || null,
      valutazione: formData.valutazione !== "" ? parseInt(formData.valutazione, 10) : null,
      note: formData.note || null,
      id_edizione: formData.id_edizione || null,
    };

    try {
      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/letture/${id_lettura}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        },
        navigate
      );

      if (response?.ok) {
        setSuccessMessage("Lettura aggiornata!");
        setTimeout(() => navigate(`/lettura/${id_lettura}`), 1000);
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore durante l'aggiornamento.");
      }
    } catch (err) {
      setError("Errore di rete.");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
          <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
            Caricamento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="bg-blue-600 p-6 sm:p-8 text-center">
            <span className="text-[9px] sm:text-[10px] font-black text-blue-200 uppercase tracking-[0.3em]">
              Editing Session
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
              Modifica Lettura
            </h1>
            {obraInfo && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <span className="text-white font-bold text-xs sm:text-sm line-clamp-1">
                  {obraInfo.titolo}
                </span>
                {isLibro && (
                  <span className="bg-white text-blue-600 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-sm font-black uppercase tracking-widest shrink-0">
                    Libro
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest text-center">
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest text-center">
                🔄 {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* EDIZIONE (se ce ne sono multiple) */}
              {edizioniOpera.length > 1 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
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
                    {edizioniOpera.map((ed) => (
                      <option key={ed.id_edizione} value={ed.id_edizione}>
                        {ed.editore || "Editore N/A"}
                        {ed.anno_pubblicazione && ` (${ed.anno_pubblicazione})`}
                        {ed.lingua && ` — ${ed.lingua}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* STATO E DATE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Stato
                  </label>
                  <select
                    name="stato"
                    value={formData.stato}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 text-base sm:text-sm"
                  >
                    <option value="da_iniziare">⏳ Da iniziare</option>
                    <option value="in_corso">📖 In corso</option>
                    <option value="finito">✅ Finito</option>
                    <option value="abbandonato">❌ Abbandonato</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
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
                        className={`w-full text-center px-1 py-2.5 rounded-xl font-black text-base sm:text-lg outline-none ${
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Valutazione
                </label>
                <div className="flex gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, valutazione: v }))}
                      className={`flex-1 py-2.5 rounded-xl font-black transition-all text-xs sm:text-sm ${
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-700 text-base sm:text-sm resize-none"
                  placeholder="Annota i tuoi pensieri..."
                />
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-gray-50">
                <Button
                  variant="outlineBlue"
                  onClick={() => navigate(`/lettura/${id_lettura}`)}
                  className="w-full md:flex-1 bg-white"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full md:flex-2"
                >
                  {loading ? "Salvataggio..." : "Salva Modifiche"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateLettura;
