import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function UpdateLettura() {
  const { id_lettura } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    data_lettura: "",
    volume: "",
    capitolo: "",
    pagina: "",
    stato: "",
    valutazione: "",
    note: "",
  });

  const [obraInfo, setObraInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isLibro = obraInfo?.id_tipo === 1 || obraInfo?.tipo === "Libro";

  useEffect(() => {
    const fetchLetturaEOpera = async () => {
      setDataLoading(true);
      try {
        const resLettura = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/letture/lettura/${id_lettura}`,
          { method: "GET" },
          navigate
        );

        if (resLettura && resLettura.ok) {
          const letturaData = await resLettura.json();
          const idOpera = letturaData.id_opera || letturaData.opere?.id_opera;

          if (idOpera) {
            const resOpera = await secureFetch(
              `${import.meta.env.VITE_API_BASE_URL}/opere/${idOpera}`,
              { method: "GET" },
              navigate
            );

            if (resOpera && resOpera.ok) {
              const detailedOpera = await resOpera.json();
              setObraInfo(detailedOpera);

              const checkIsLibro = detailedOpera.id_tipo === 1;

              setFormData({
                data_lettura: letturaData.data_lettura || "",
                volume: checkIsLibro ? "" : letturaData.volume ?? "",
                capitolo: letturaData.capitolo ?? "",
                pagina: letturaData.pagina ?? "",
                stato: letturaData.stato || "da_iniziare",
                valutazione: letturaData.valutazione ?? "",
                note: letturaData.note || "",
              });
            }
          }
        } else {
          setError("Impossibile recuperare i dati della lettura.");
        }
      } catch (err) {
        setError("Errore durante il caricamento.");
      } finally {
        setDataLoading(false);
      }
    };

    if (id_lettura) fetchLetturaEOpera();
  }, [id_lettura, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isLibro && name === "volume") return;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "stato" && value === "da_iniziare") {
        newData.volume = "";
        newData.capitolo = "";
        newData.pagina = "";
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isActuallyDaIniziare = formData.stato === "da_iniziare";

    const dataToSend = {
      data_lettura: formData.data_lettura || null,
      volume: isActuallyDaIniziare || isLibro ? null : formData.volume !== "" ? parseInt(formData.volume, 10) : null,
      capitolo: isActuallyDaIniziare ? null : formData.capitolo !== "" ? parseInt(formData.capitolo, 10) : null,
      pagina: isActuallyDaIniziare ? null : formData.pagina !== "" ? parseInt(formData.pagina, 10) : null,
      stato: formData.stato || null,
      valutazione: formData.valutazione !== "" ? parseInt(formData.valutazione, 10) : null,
      note: formData.note || null,
    };

    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/letture/${id_lettura}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      },
      navigate
    );

    if (response && response.ok) {
      setSuccessMessage("Lettura aggiornata con successo!");
      setTimeout(() => navigate(`/lettura/${id_lettura}`), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }
    setLoading(false);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar setUser={setUser} setError={setError} />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
          
          {/* HEADER DELLA CARD (Modifica -> Blu) */}
          <div className="bg-blue-700 p-8 text-center">
            <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em]">
              Editing Session
            </span>
            <h1 className="text-3xl font-black text-white mt-2 tracking-tight">
              Modifica Lettura
            </h1>
            {obraInfo && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                <span className="text-white font-bold text-sm">{obraInfo.titolo}</span>
                {isLibro && (
                  <span className="bg-white text-blue-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                    Libro
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-8 md:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest text-center animate-shake">
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest text-center">
                🔄 Aggiornamento completato
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              {/* PROGRESSO */}
              <div className="bg-gray-50 rounded-4xl p-6 grid grid-cols-3 gap-4 border border-gray-100 shadow-inner">
                {["volume", "capitolo", "pagina"].map((field) => {
                  const isFieldVolume = field === "volume";
                  const isDisabled = formData.stato === "da_iniziare" || (isLibro && isFieldVolume);

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
                        placeholder={isLibro && isFieldVolume ? "N/A" : "0"}
                        className={`w-full text-center px-2 py-3 rounded-xl border transition-all font-black text-lg ${
                          isDisabled 
                            ? "bg-gray-200/50 border-transparent text-gray-300 cursor-not-allowed" 
                            : "bg-white border-gray-200 text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* VALUTAZIONE */}
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
                  Note e Commenti
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                  placeholder="Annota i tuoi progressi..."
                />
              </div>

              {/* AZIONI - BLU PER MODIFICA */}
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
                  disabled={loading}
                  className="flex-2 py-5 px-8 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:bg-blue-200 transition-all transform active:scale-95"
                >
                  {loading ? "Aggiornamento..." : "Salva Modifiche"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateLettura;