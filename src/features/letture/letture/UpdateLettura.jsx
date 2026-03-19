import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button"; // <-- Importiamo il nostro Button
import { secureFetch } from "../../../utils/secureFetch";
import { useAuth } from "../../../context/AuthContext"; // <-- Importiamo l'Auth globale

function UpdateLettura() {
  const { id_lettura } = useParams();
  const navigate = useNavigate();
  
  // Non serve più scaricare l'utente manualmente, ce l'abbiamo nel context!
  // Ma in questa pagina non ci serve nemmeno usarlo direttamente per la UI,
  // basta che AuthContext garantisca che l'utente sia loggato.

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

  const isLibro = obraInfo?.id_tipo === 1 || obraInfo?.tipo?.toLowerCase() === "libro";

  useEffect(() => {
    // Scroll in alto
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchLetturaEOpera = async () => {
      setDataLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        
        // 1. Recupero la lettura
        const resLettura = await secureFetch(
          `${baseUrl}/letture/lettura/${id_lettura}`,
          { method: "GET" },
          navigate
        );

        if (resLettura && resLettura.ok) {
          const letturaData = await resLettura.json();
          const idOpera = letturaData.id_opera || letturaData.opere?.id_opera;

          if (idOpera) {
            // 2. Recupero i dettagli dell'opera
            const resOpera = await secureFetch(
              `${baseUrl}/opere/${idOpera}`,
              { method: "GET" },
              navigate
            );

            if (resOpera && resOpera.ok) {
              const detailedOpera = await resOpera.json();
              setObraInfo(detailedOpera);

              const checkIsLibro = detailedOpera.id_tipo === 1 || detailedOpera.tipo?.toLowerCase() === "libro";

              setFormData({
                // Se la data c'è, taglia la parte dell'orario per farla funzionare con l'input type="date"
                data_lettura: letturaData.data_lettura ? letturaData.data_lettura.split('T')[0] : "",
                volume: checkIsLibro ? "" : (letturaData.volume ?? ""),
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

      if (response && response.ok) {
        setSuccessMessage("Lettura aggiornata!");
        setTimeout(() => navigate(`/lettura/${id_lettura}`), 1000); // Rimandiamo indietro più velocemente
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
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-blue-600"></div>
          <p className="text-gray-400 font-black uppercase text-[10px] sm:text-xs tracking-widest">Caricamento in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar /> {/* Via le props! */}
      
      {/* pb-24 per la Bottom Nav mobile */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-10">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          
          {/* HEADER DELLA CARD */}
          <div className="bg-blue-600 p-6 sm:p-8 text-center">
            <span className="text-[9px] sm:text-[10px] font-black text-blue-200 uppercase tracking-[0.3em]">
              Editing Session
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
              Modifica Lettura
            </h1>
            {obraInfo && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <span className="text-white font-bold text-xs sm:text-sm line-clamp-1">{obraInfo.titolo}</span>
                {isLibro && (
                  <span className="bg-white text-blue-600 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-sm font-black uppercase tracking-widest shrink-0">
                    Libro
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            {/* MESSAGGI DI ERRORE/SUCCESSO */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-center animate-shake">
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-center">
                🔄 {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              
              {/* STATO E DATA */}
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
                      // text-base (16px) è CRITICO su mobile per evitare che l'iPhone faccia lo zoom sull'input
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
                    Ultimo Aggiornamento
                  </label>
                  <input
                    type="date"
                    name="data_lettura"
                    value={formData.data_lettura}
                    onChange={handleChange}
                    // text-base per prevenire auto-zoom
                    className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* PROGRESSO */}
              <div className="bg-gray-50/80 rounded-2xl p-4 sm:p-6 grid grid-cols-3 gap-2 sm:gap-4 border border-gray-100 shadow-inner">
                {["volume", "capitolo", "pagina"].map((field) => {
                  const isFieldVolume = field === "volume";
                  const isDisabled = formData.stato === "da_iniziare" || (isLibro && isFieldVolume);

                  return (
                    <div key={field} className="space-y-1.5 sm:space-y-2 text-center">
                      <label className={`text-[9px] sm:text-[11px] font-black uppercase tracking-widest ${isDisabled ? "text-gray-300" : "text-gray-500"}`}>
                        {field.substring(0,3)} {/* Tronchiamo l'etichetta su mobile per sicurezza (Vol / Cap / Pag) */}
                        <span className="hidden sm:inline">{field.substring(3)}</span>
                      </label>
                      <input
                        type="number"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        disabled={isDisabled}
                        placeholder={isLibro && isFieldVolume ? "-" : "0"}
                        // text-base anche qui
                        className={`w-full text-center px-1 sm:px-2 py-2.5 sm:py-3 rounded-xl transition-all font-black text-base sm:text-lg outline-none ${
                          isDisabled 
                            ? "bg-gray-200/50 border-transparent text-gray-300 cursor-not-allowed" 
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
                  Valutazione Personale
                </label>
                <div className="flex gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleChange({ target: { name: 'valutazione', value: v }})}
                      className={`flex-1 py-2.5 sm:py-3 rounded-xl font-black transition-all text-xs sm:text-sm ${
                        formData.valutazione >= v  // Cambiato == in >= così si colorano tutte le stelle precedenti!
                          ? "bg-yellow-400 text-white shadow-sm shadow-yellow-200" 
                          : "bg-gray-50 border border-gray-100 text-gray-300 hover:bg-gray-100"
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
                  Note e Commenti
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows="4"
                  // text-base per prevenire auto-zoom
                  className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 text-base sm:text-sm resize-none"
                  placeholder="Annota i tuoi pensieri su questa lettura..."
                />
              </div>

              {/* AZIONI: Usiamo il componente Button */}
              <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-gray-50">
                <Button
                  variant="outlineBlue"
                  onClick={() => navigate(`/lettura/${id_lettura}`)} // Torniamo al dettaglio invece che alla lista
                  className="w-full md:flex-1 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full md:flex-2" // Il bottone Salva è largo il doppio su desktop
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