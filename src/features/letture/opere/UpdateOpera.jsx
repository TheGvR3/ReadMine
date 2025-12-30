import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// AsyncSelect è un componente esterno per menu a tendina con ricerca remota (es. cerco "Mario" e il server risponde)
import AsyncSelect from "react-select/async";
import Navbar from "../../../components/Navbar";
import { secureFetch } from "../../../utils/secureFetch";

function UpdateOpera() {
  // --- 1. HOOKS E VARIABILI DI ROUTING ---
  // Estraiamo l'ID dell'opera dall'URL (es. /update-opera/15 -> id_opera = 15)
  const { id_opera } = useParams();
  const navigate = useNavigate();

  // --- 2. STATO DEL FORM (Dati da inviare al Server) ---
  // Questo stato contiene solo i valori "grezzi" (ID e stringhe) che il database si aspetta.
  const [formData, setFormData] = useState({
    titolo: "",
    tipo_opera: "", // Sarà un ID numerico
    stato_opera: "finito",
    id_serie: null, // ID numerico o null
    anno_pubblicazione: "",
    editore: "",
    lingua_originale: "",
    autori: [], // Array di ID (es: [1, 5, 9])
    generi: [], // Array di ID
  });

  // --- 3. STATO VISIVO (Per AsyncSelect) ---
  // React-Select ha bisogno di oggetti { value: id, label: "Nome" } per visualizzare le etichette.
  // Manteniamo questi stati separati da formData per gestire la visualizzazione UI.
  const [selectedAutori, setSelectedAutori] = useState([]);
  const [selectedGeneri, setSelectedGeneri] = useState([]);
  const [selectedSerie, setSelectedSerie] = useState(null);

  // --- 4. STATI DI UTILITÀ ---
  const [tipiList, setTipiList] = useState([]); // Lista statica per il tipo (Manga, Romanzo, ecc.)
  const [loading, setLoading] = useState(false); // Spinner durante il salvataggio
  const [dataLoading, setDataLoading] = useState(true); // Spinner durante il caricamento iniziale
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- 5. USE EFFECT: CARICAMENTO INIZIALE ---
  // Questo blocco viene eseguito appena la pagina si apre.
  useEffect(() => {
    const fetchInitialData = async () => {
      setDataLoading(true);
      setError("");
      try {
        // A. Carichiamo la lista dei "Tipi" per popolare la select classica HTML
        const resTipi = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/tipo`,
          { method: "GET" },
          navigate // Passiamo navigate per gestire eventuali logout se il token è scaduto
        );
        if (resTipi.ok) setTipiList(await resTipi.json());

        // B. Carichiamo i dati dell'opera attuale per pre-compilare i campi
        const resOpera = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`,
          { method: "GET" },
          navigate
        );

        if (resOpera.ok) {
          const data = await resOpera.json();

          // C. Sincronizzazione Dati -> formData (Logica di Business)
          // Riempiamo lo stato con i dati ricevuti dal DB
          setFormData({
            titolo: data.titolo || "",
            tipo_opera: data.id_tipo || "",
            stato_opera: data.stato_opera || "finito",
            id_serie: data.id_serie || null,
            anno_pubblicazione: data.anno_pubblicazione || "",
            editore: data.editore || "",
            lingua_originale: data.lingua_originale || "",
            autori: data.autori_ids || [], // Il backend deve restituire un array di ID [1, 2]
            generi: data.generi_ids || [],
          });

          // D. Sincronizzazione Visuale -> AsyncSelect (Logica UI)
          // Il DB potrebbe restituire una stringa unica "Autore A, Autore B" o array separati.
          // Qui ricostruiamo gli oggetti { value, label } per far vedere i nomi nelle caselle.

          // Gestione Autori
          if (data.autori_ids && data.autori) {
            const nomiAutori = data.autori.split(", "); // Divide la stringa dei nomi
            setSelectedAutori(
              data.autori_ids.map((id, i) => ({
                value: id,
                // Se c'è un nome corrispondente all'indice lo usa, altrimenti mette un fallback
                label: nomiAutori[i] || `Autore #${id}`,
              }))
            );
          }

          // Gestione Generi
          if (data.generi_ids && data.generi) {
            const nomiGeneri = data.generi.split(", ");
            setSelectedGeneri(
              data.generi_ids.map((id, i) => ({
                value: id,
                label: nomiGeneri[i] || `Genere #${id}`,
              }))
            );
          }

          // Gestione Serie (Singola selezione)
          if (data.id_serie && data.serie) {
            setSelectedSerie({ value: data.id_serie, label: data.serie });
          }
        } else {
          setError("Impossibile recuperare i dati dell'opera.");
        }
      } catch (err) {
        setError("Errore di connessione al server.");
      } finally {
        setDataLoading(false); // Spegne lo spinner di caricamento
      }
    };

    if (id_opera) fetchInitialData();
  }, [id_opera, navigate]);

  // --- 6. FUNZIONI DI RICERCA (ASYNC SELECT) ---
  // Queste funzioni vengono chiamate automaticamente da AsyncSelect quando l'utente scrive
  const loadAutoriOptions = async (inputValue) => {
    if (!inputValue) return []; // Non cercare se la casella è vuota
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/autori/search/${inputValue}`,
      { method: "GET" },
      navigate
    );
    if (!response || !response.ok) return [];
    const data = await response.json();
    // Mappa la risposta del server nel formato { value, label } richiesto dalla libreria
    return data.map((a) => ({ value: a.id_autore, label: a.nome_autore }));
  };

  const loadGeneriOptions = async (inputValue) => {
    if (!inputValue) return [];
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/genere/search/${inputValue}`,
      { method: "GET" },
      navigate
    );
    if (!response || !response.ok) return [];
    const data = await response.json();
    return data.map((g) => ({ value: g.id_genere, label: g.nome_genere }));
  };

  const loadSerieOptions = async (inputValue) => {
    if (!inputValue) return [];
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/serie/search/${inputValue}`,
      { method: "GET" },
      navigate
    );
    if (!response || !response.ok) return [];
    const data = await response.json();
    return data.map((s) => ({ value: s.id_serie, label: s.nome_serie }));
  };

  // --- 7. GESTORI EVENTI (HANDLERS) ---

  // Per input semplici (testo, numeri, select HTML standard)
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Aggiorna solo il campo specifico mantenendo gli altri inalterati (...prev)
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Per Select Multiple (Autori, Generi)
  const handleMultiSelectChange = (selectedOptions, fieldName) => {
    // 1. Estrae solo gli ID per il formData (es: [1, 2]) da inviare al server
    const values = selectedOptions ? selectedOptions.map((o) => o.value) : [];
    setFormData((prev) => ({ ...prev, [fieldName]: values }));

    // 2. Aggiorna lo stato visuale (es: [{value:1, label:"Pippo"}]) per la UI
    if (fieldName === "autori") setSelectedAutori(selectedOptions || []);
    if (fieldName === "generi") setSelectedGeneri(selectedOptions || []);
  };

  // Per Select Singola Asincrona (Serie)
  const handleSingleSelectChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      // Se c'è una selezione prendi l'ID, altrimenti null
      id_serie: selectedOption ? selectedOption.value : null,
    }));
    setSelectedSerie(selectedOption);
  };

  // --- 8. SUBMIT DEL FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita il refresh della pagina
    setLoading(true);
    setError("");

    // Conversione dei tipi: i form HTML restituiscono stringhe, ma il DB vuole numeri
    const dataToSend = {
      ...formData,
      tipo_opera: parseInt(formData.tipo_opera, 10),
      anno_pubblicazione: parseInt(formData.anno_pubblicazione, 10),
    };

    // Chiamata PUT per aggiornare
    const response = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere/${id_opera}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      },
      navigate
    );

    if (response && response.ok) {
      setSuccessMessage("Opera aggiornata con successo!");
      // Redirect alla lista dopo 1.5 secondi per far leggere il messaggio
      setTimeout(() => navigate(`/opere/${id_opera}`), 1500);
    } else {
      const err = await response.json().catch(() => ({}));
      setError(err.error || "Errore durante l'aggiornamento.");
    }
    setLoading(false);
  };

  // --- 9. RENDER CONDIZIONALE ---
  // Se stiamo ancora scaricando i dati iniziali, mostra solo un messaggio
  if (dataLoading)
    return (
      <div className="text-center mt-10 font-bold">
        Caricamento dati dell'opera...
      </div>
    );

  // --- 10. RENDER DEL FORM ---
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar setUser={setUser} setError={setError} />
      <div className="flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mt-10">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Modifica Opera
          </h1>

          {/* Messaggi di feedback (Errore o Successo) */}
          {error && (
            <p className="bg-red-100 text-red-600 p-3 rounded mb-4 text-center">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="bg-green-100 text-green-600 p-3 rounded mb-4 text-center font-bold">
              {successMessage}
            </p>
          )}

          {/* Input Titolo */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Titolo *
              </label>
              <input
                type="text"
                name="titolo"
                value={formData.titolo}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Anno Pubblicazione e Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Anno Pubblicazione *
                </label>
                <input
                  type="number"
                  name="anno_pubblicazione"
                  value={formData.anno_pubblicazione}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Tipo *
                </label>
                <select
                  name="tipo_opera"
                  value={formData.tipo_opera}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleziona</option>
                  {tipiList.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>
                      {t.nome_tipo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stato e Lingua Originale */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Stato
                </label>
                <select
                  name="stato_opera"
                  value={formData.stato_opera}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                >
                  <option value="finito">Finito</option>
                  <option value="in corso">In corso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Lingua Originale
                </label>
                <input
                  type="text"
                  name="lingua_originale"
                  value={formData.lingua_originale}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* Editore */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Editore
              </label>
              <input
                type="text"
                name="editore"
                value={formData.editore}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* AsyncSelect per Autori, Generi, Serie */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Autori *
              </label>
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                value={selectedAutori}
                loadOptions={loadAutoriOptions}
                onChange={(sel) => handleMultiSelectChange(sel, "autori")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Generi *
              </label>
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                value={selectedGeneri}
                loadOptions={loadGeneriOptions}
                onChange={(sel) => handleMultiSelectChange(sel, "generi")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Serie
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={selectedSerie}
                loadOptions={loadSerieOptions}
                onChange={handleSingleSelectChange}
                isClearable
                className="mt-1"
                placeholder="Cerca serie..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/opere/${id_opera}`)}
                className="w-1/2 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-bold"
              >
                {loading ? "Salvataggio..." : "Salva Modifiche"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateOpera;
