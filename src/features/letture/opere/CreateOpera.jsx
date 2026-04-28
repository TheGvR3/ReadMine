import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button";
import { secureFetch } from "../../../utils/secureFetch";

function CreateOpera() {
  const navigate = useNavigate();

  // --- STATI DELLA UI ---
  const [activeTab, setActiveTab] = useState("manual"); // "manual" o "google"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- STATI GOOGLE BOOKS ---
  const [googleQuery, setGoogleQuery] = useState("");
  const [googleResults, setGoogleResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- STATI FORM (Allineati al tuo backend Node.js) ---
  const [formData, setFormData] = useState({
    titolo: "",
    tipo_opera: 1, // ID di default per "Libro" (aggiusta in base al tuo DB)
    anno_pubblicazione: "",
    editore: "",
    lingua_originale: "it",
    stato_opera: "finito",
    id_serie: "",
    autori: [], // Qui andranno gli ID
    generi: [], // Qui andranno gli ID
    descrizione: "", // Aggiunto in caso tu voglia salvare la trama in futuro
  });

  // Gestione Input del Form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── 1. MOTORE DI RICERCA GOOGLE BOOKS ──────────────────────────────────────
  const searchGoogleBooks = async (e) => {
    e.preventDefault();
    if (!googleQuery.trim()) return;

    setIsSearching(true);
    setError(""); // Puliamo eventuali vecchi errori
    setGoogleResults([]); // Puliamo i vecchi risultati

    try {
      console.log("Sto cercando su Google Books:", googleQuery); // <-- SPIA CONSOLE

      // Prendi la chiave dall'ambiente
      const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

      // Aggiungi &key=${apiKey} alla fine dell'URL
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleQuery)}&maxResults=10&key=${apiKey}`,
      );
      
      if (!res.ok) {
        throw new Error(`Google ha risposto con errore: ${res.status}`);
      }

      const data = await res.json();
      console.log("Risposta di Google:", data); // <-- SPIA CONSOLE

      if (data.items && data.items.length > 0) {
        setGoogleResults(data.items);
      } else {
        // Se l'array è vuoto, avvisiamo l'utente
        setError(
          `Nessun libro trovato per "${googleQuery}". Prova a cambiare i termini di ricerca.`,
        );
      }
    } catch (err) {
      console.error("Errore Fetch Google:", err);
      setError(
        "Errore di rete durante la ricerca su Google Books. Controlla la console (F12).",
      );
    } finally {
      setIsSearching(false);
    }
  };

  // ─── 2. IMPORTAZIONE DATI DA GOOGLE AL FORM ────────────────────────────────
  const importFromGoogle = (book) => {
    const info = book.volumeInfo;

    // Estrapoliamo l'anno dalla data (Google dà formati tipo "1997" o "1997-06-26")
    const anno = info.publishedDate ? info.publishedDate.substring(0, 4) : "";

    // Aggiorniamo il form con i dati di Google
    setFormData((prev) => ({
      ...prev,
      titolo: info.title || "",
      editore: info.publisher || "",
      anno_pubblicazione: anno,
      lingua_originale: info.language || "",
      descrizione: info.description || "",
    }));

    // Avvisiamo l'utente di collegare gli autori e torniamo al form
    alert(
      `Importato: ${info.title}!\nRicordati di selezionare manualmente l'Autore e il Genere dal tuo database.`,
    );
    setActiveTab("manual");
  };

  // ─── 3. SALVATAGGIO NEL TUO DATABASE NODE.JS ───────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titolo) {
      setError("Il titolo è obbligatorio.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepariamo i dati convertendo i numeri come si aspetta il backend
      const dataToSend = {
        ...formData,
        tipo_opera: parseInt(formData.tipo_opera),
        anno_pubblicazione: formData.anno_pubblicazione
          ? parseInt(formData.anno_pubblicazione)
          : null,
        id_serie: formData.id_serie ? parseInt(formData.id_serie) : null,
      };

      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/opere`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        },
        navigate,
      );

      if (response?.ok) {
        setSuccessMessage("Opera creata con successo nel tuo database!");
        setTimeout(() => navigate("/listopere"), 1500);
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err.error || "Errore durante la creazione dell'opera.");
      }
    } catch (err) {
      setError("Errore di connessione al server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:py-10">
        {/* Intestazione */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Nuova Opera
          </h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
            Aggiungi al catalogo
          </p>
        </div>

        {/* TABS di Navigazione */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl sm:rounded-2xl mb-8 w-full sm:w-max">
          <button
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === "manual" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("manual")}
          >
            ✍️ Compila Form
          </button>
          <button
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === "google" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("google")}
          >
            🔍 Importa da Google
          </button>
        </div>

        {/* MESSAGGI DI STATO */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest text-center animate-shake">
            ⚠️ {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest text-center">
            ✅ {successMessage}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* ───────────────────────────────────────────────────────────────── */}
          {/* TAB 1: RICERCA GOOGLE BOOKS */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === "google" && (
            <div className="p-6 md:p-8 bg-blue-50/30">
              <form
                onSubmit={searchGoogleBooks}
                className="flex flex-col sm:flex-row gap-3 mb-8"
              >
                <input
                  type="text"
                  placeholder="Es. Il Signore degli Anelli, J.R.R. Tolkien..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-700"
                  value={googleQuery}
                  onChange={(e) => setGoogleQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSearching}
                  className="py-3"
                >
                  {isSearching ? "Cercando..." : "Cerca online"}
                </Button>
              </form>

              {/* RISULTATI GOOGLE */}
              <div className="space-y-3">
                {googleResults.length > 0 && (
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Risultati da Google:
                  </p>
                )}

                {googleResults.map((book) => {
                  const info = book.volumeInfo;
                  // Google a volte usa http invece di https per le immagini, forziamo l'https per sicurezza
                  let thumb =
                    info.imageLinks?.smallThumbnail ||
                    "https://via.placeholder.com/80x120?text=No+Cover";
                  thumb = thumb.replace("http:", "https:");

                  return (
                    <div
                      key={book.id}
                      className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm items-center"
                    >
                      <img
                        src={thumb}
                        alt="Cover"
                        className="w-12 h-16 sm:w-16 sm:h-24 object-cover rounded shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-900 text-sm sm:text-base line-clamp-1">
                          {info.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider line-clamp-1">
                          {info.authors?.join(", ") || "Autore sconosciuto"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {info.publisher || "Editore N/A"} •{" "}
                          {info.publishedDate?.substring(0, 4) || "Anno N/A"}
                        </p>
                      </div>
                      <Button
                        variant="success"
                        onClick={() => importFromGoogle(book)}
                        className="text-[10px] sm:text-xs shrink-0"
                      >
                        Importa
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* TAB 2: INSERIMENTO MANUALE (Form del tuo DB) */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === "manual" && (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TITOLO */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Titolo *
                  </label>
                  <input
                    type="text"
                    name="titolo"
                    required
                    value={formData.titolo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-black text-gray-800 text-lg"
                    placeholder="Il nome dell'opera"
                  />
                </div>

                {/* EDITORE */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Editore
                  </label>
                  <input
                    type="text"
                    name="editore"
                    value={formData.editore}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 text-sm sm:text-base"
                  />
                </div>

                {/* ANNO */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Anno Pubblicazione
                  </label>
                  <input
                    type="number"
                    name="anno_pubblicazione"
                    value={formData.anno_pubblicazione}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 text-sm sm:text-base"
                  />
                </div>

                {/* STATO */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Stato Opera
                  </label>
                  <select
                    name="stato_opera"
                    value={formData.stato_opera}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 text-base sm:text-sm"
                  >
                    <option value="finito">✅ Concluso</option>
                    <option value="in_corso">⏳ In corso</option>
                  </select>
                </div>

                {/* LINGUA */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Lingua Originale
                  </label>
                  <input
                    type="text"
                    name="lingua_originale"
                    value={formData.lingua_originale}
                    onChange={handleChange}
                    placeholder="es. it, en, jp..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 text-sm sm:text-base"
                  />
                </div>

                {/* TIPO OPERA E COLLEGAMENTI (Mockup: Qui dovresti mettere i tuoi Select o AsyncSelect per Autori, Generi, Tipo) */}
                <div className="md:col-span-2 p-5 bg-yellow-50 border border-yellow-100 rounded-xl">
                  <p className="text-yellow-700 text-xs font-black uppercase tracking-widest mb-1">
                    🔗 Dati Relazionali
                  </p>
                  <p className="text-yellow-600 text-sm">
                    Qui dovrai inserire i tuoi componenti{" "}
                    <code>AsyncSelect</code> per mappare gli ID di: <br />
                    <strong>Autori, Generi, Tipo Opera e Serie.</strong>
                  </p>
                </div>
              </div>

              {/* AZIONI */}
              <div className="flex gap-3 pt-6 border-t border-gray-50">
                <Button
                  variant="outlineBlue"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-white border-gray-200"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-2"
                >
                  {loading ? "Salvataggio..." : "Crea nel Database"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateOpera;
