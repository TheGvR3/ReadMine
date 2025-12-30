import { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { useNavigate, useLocation } from "react-router-dom"; 
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function CreateLettura() {
  const navigate = useNavigate();
  const location = useLocation();

  const preSelectedOpera = location.state;

  const [idUtente, setIdUtente] = useState(null);
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
      ? { value: preSelectedOpera.id_opera, label: `${preSelectedOpera.titolo} (${preSelectedOpera.editore || "N/A"})` }
      : null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- LOGICA AGGIUNTA ---
  // Variabile booleana per controllare se lo stato è "da_iniziare"
  const isDaIniziare = formData.stato === "da_iniziare";

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
          if (finalId) {
            setIdUtente(finalId);
          } else {
            setError("ID utente non trovato nella risposta del server.");
          }
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
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Reset automatico se si torna a "da_iniziare"
      if (name === "stato" && value === "da_iniziare") {
        updatedData.volume = "";
        updatedData.capitolo = "";
        updatedData.pagina = "";
      }
      
      return updatedData;
    });
  };

  const handleSelectOpera = (selectedOption) => {
    setSelectedOperaValue(selectedOption); 
    setFormData((prev) => ({
      ...prev,
      id_opera: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idUtente) {
      setError("Impossibile identificare l'utente. Riprova.");
      return;
    }

    if (!formData.id_opera) {
      setError("Seleziona un'opera dalla lista.");
      return;
    }

    setLoading(true);
    setError("");

    // --- LOGICA AGGIUNTA ---
    // Nel dataToSend forziamo null se lo stato è "da_iniziare"
    const dataToSend = {
      id_utente: parseInt(idUtente, 10),
      id_opera: formData.id_opera,
      data_lettura: formData.data_lettura || null,
      volume: isDaIniziare ? null : (formData.volume ? parseInt(formData.volume, 10) : null),
      capitolo: isDaIniziare ? null : (formData.capitolo ? parseInt(formData.capitolo, 10) : null),
      pagina: isDaIniziare ? null : (formData.pagina ? parseInt(formData.pagina, 10) : null),
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

 return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center items-center py-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-center text-indigo-800">
            📝 Aggiungi al Diario
          </h1>

          {/* Error & Success Messages... */}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* AsyncSelect... */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  name="data_lettura"
                  value={formData.data_lettura}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Stato</label>
                <select
                  name="stato"
                  value={formData.stato}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="da_iniziare">Da iniziare</option>
                  <option value="in_corso">In corso</option>
                  <option value="finito">Finito</option>
                  <option value="abbandonato">Abbandonato</option>
                </select>
              </div>
            </div>

            {/* SEZIONE PROGRESSO - CONTROLLO DIRETTO SUL VALORE */}
            <div className="grid grid-cols-3 gap-4">
              {["volume", "capitolo", "pagina"].map((field) => (
                <div key={field}>
                  <label className={`block text-xs font-bold uppercase ${formData.stato === "da_iniziare" ? 'text-gray-400' : 'text-gray-500'}`}>
                    {field === "volume" ? "Vol." : field === "capitolo" ? "Cap." : "Pag."}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    // Controllo diretto sullo stato nel form
                    disabled={formData.stato === "da_iniziare"} 
                    className={`w-full px-3 py-2 border rounded-md transition-all ${
                      formData.stato === "da_iniziare" 
                        ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60" 
                        : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Valutazione e Note... */}

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/listletture")}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-bold"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading || !idUtente}
                className="flex-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition font-bold shadow-lg"
              >
                {loading ? "Salvataggio..." : "Salva nel Diario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateLettura;