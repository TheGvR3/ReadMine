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

  const isLibro = selectedOperaDetails?.id_tipo === 1;

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
      fullData: o, // Conserviamo l'intero oggetto (incluso id_tipo)
    }));
  };

  const handleSelectOpera = (selectedOption) => {
    setSelectedOperaValue(selectedOption);
    const operaData = selectedOption ? selectedOption.fullData : null;
    setSelectedOperaDetails(operaData);

    setFormData((prev) => ({
      ...prev,
      id_opera: selectedOption ? selectedOption.value : null,
      // Reset immediato del volume se l'opera selezionata è un libro
      volume:
        operaData?.id_tipo === 1 || operaData?.tipo === "Libro"
          ? ""
          : prev.volume,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // BLOCCO DI SICUREZZA: Impedisce l'aggiornamento dello stato se è un libro e si tenta di modificare il volume
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
      setError("Dati mancanti (utente o opera).");
      return;
    }

    setLoading(true);
    setError("");

    // Controllo lo stato corrente per decidere se inviare i numeri o null
    const isDaIniziare = formData.stato === "da_iniziare";

    const dataToSend = {
      id_utente: parseInt(idUtente, 10),
      id_opera: formData.id_opera,
      data_lettura: formData.data_lettura || null,
      volume: isDaIniziare
        ? null
        : formData.volume
        ? parseInt(formData.volume, 10)
        : null,
      capitolo: isDaIniziare
        ? null
        : formData.capitolo
        ? parseInt(formData.capitolo, 10)
        : null,
      pagina: isDaIniziare
        ? null
        : formData.pagina
        ? parseInt(formData.pagina, 10)
        : null,
      stato: formData.stato,
      valutazione: formData.valutazione
        ? parseInt(formData.valutazione, 10)
        : null,
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
      <Navbar setUser={setUser} setError={setError} />
      <div className="flex justify-center items-center py-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-800">
            📝 Aggiungi al Diario
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-center mb-4 border border-red-100">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-center mb-4 border border-green-100 font-bold">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Cerca Opera *
              </label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadOpereOptions}
                onChange={handleSelectOpera}
                value={selectedOperaValue}
                placeholder="Esempio: Naruto..."
                isClearable
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  name="data_lettura"
                  value={formData.data_lettura}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Stato
                </label>
                <select
                  name="stato"
                  value={formData.stato}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="da_iniziare">Da iniziare</option>
                  <option value="in_corso">In corso</option>
                  <option value="finito">Finito</option>
                  <option value="abbandonato">Abbandonato</option>
                </select>
              </div>
            </div>

            {/* SEZIONE PROGRESSO */}
            <div className="grid grid-cols-3 gap-4">
              {["volume", "capitolo", "pagina"].map((field) => {
                // LOGICA DI DISABILITAZIONE:
                // Il volume è disabilitato se lo stato è "da_iniziare" OPPURE se l'opera è un libro
                const isFieldVolume = field === "volume";
                const isOperaLibro =
                  selectedOperaDetails?.id_tipo === 1 ||
                  selectedOperaDetails?.tipo === "Libro";

                const isDisabled =
                  formData.stato === "da_iniziare" ||
                  (isOperaLibro && isFieldVolume);

                return (
                  <div key={field}>
                    <label
                      className={`block text-xs font-bold uppercase ${
                        isDisabled ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {field === "volume"
                        ? "Vol."
                        : field === "capitolo"
                        ? "Cap."
                        : "Pag."}
                    </label>
                    <input
                      type="number"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      disabled={isDisabled}
                      readOnly={isDisabled}
                      placeholder={isOperaLibro && isFieldVolume ? "N/A" : ""}
                      className={`w-full px-3 py-2 border rounded-md transition-all ${
                        isDisabled
                          ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400 shadow-inner pointer-events-none"
                          : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Valutazione
              </label>
              <select
                name="valutazione"
                value={formData.valutazione}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Nessun voto</option>
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v} ⭐
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Note
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Aggiungi un commento..."
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/listletture")}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-bold"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading || !idUtente}
                className="flex-2 py-3 px-8 bg-green-600 text-white rounded-lg font-bold shadow-lg hover:bg-green-700 disabled:bg-green-300 transition-all transform active:scale-95"
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
