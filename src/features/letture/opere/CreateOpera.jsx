import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button";
import { secureFetch } from "../../../utils/secureFetch";

// Stile AsyncSelect coerente
const selectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    padding: "2px",
    borderColor: "#e5e7eb",
    "&:hover": { borderColor: "#3b82f6" },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#eff6ff",
    borderRadius: "0.5rem",
    color: "#1e40af",
    fontWeight: "700",
  }),
};

function CreateOpera() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tipi, setTipi] = useState([]);
  const [titolo, setTitolo] = useState("");
  const [tipoOpera, setTipoOpera] = useState("");
  const [statoOpera, setStatoOpera] = useState("finito");
  const [linguaOriginale, setLinguaOriginale] = useState("it");
  const [descrizione, setDescrizione] = useState("");
  const [numeroVolume, setNumeroVolume] = useState("");
  const [selectedSerie, setSelectedSerie] = useState(null);
  const [selectedAutori, setSelectedAutori] = useState([]);
  const [selectedGeneri, setSelectedGeneri] = useState([]);

  // Carica tipi al mount
  useEffect(() => {
    (async () => {
      const res = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/tipo`,
        { method: "GET" },
        navigate
      );
      if (res?.ok) setTipi(await res.json());
    })();
  }, [navigate]);

  const loadAutori = async (input) => {
    if (!input) return [];
    const res = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/autori/search/${encodeURIComponent(input)}`,
      { method: "GET" },
      navigate
    );
    if (!res?.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.data || [];
    return list.map((a) => ({ value: a.id_autore, label: a.nome_autore }));
  };

  const loadGeneri = async (input) => {
    if (!input) return [];
    const res = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/genere/search/${encodeURIComponent(input)}`,
      { method: "GET" },
      navigate
    );
    if (!res?.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.data || [];
    return list.map((g) => ({ value: g.id_genere, label: g.nome_genere }));
  };

  const loadSerie = async (input) => {
    if (!input) return [];
    const res = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/serie/search/${encodeURIComponent(input)}`,
      { method: "GET" },
      navigate
    );
    if (!res?.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.data || [];
    return list.map((s) => ({ value: s.id_serie, label: s.nome_serie }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!titolo.trim()) return setError("Titolo obbligatorio");
    if (!tipoOpera) return setError("Tipo opera obbligatorio");

    setLoading(true);
    try {
      const body = {
        titolo: titolo.trim(),
        tipo_opera: parseInt(tipoOpera, 10),
        stato_opera: statoOpera,
        lingua_originale: linguaOriginale || null,
        descrizione_opera: descrizione || null,
        numero_volume: numeroVolume ? parseInt(numeroVolume, 10) : null,
        id_serie: selectedSerie?.value || null,
        autori: selectedAutori.map((a) => a.value),
        generi: selectedGeneri.map((g) => g.value),
      };

      const res = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/opere`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        navigate
      );

      const data = await res?.json().catch(() => ({}));
      if (!res?.ok) {
        throw new Error(data?.error || `HTTP ${res?.status}`);
      }

      setSuccess("Opera creata. Aggiungi un'edizione dopo, se serve.");
      setTimeout(() => navigate(`/opere/${data.id_opera}`), 1500);
    } catch (err) {
      setError(err.message || "Errore creazione opera");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-10">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nuova Opera</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
              Solo dati opera-level (autori, generi, serie). Le edizioni si aggiungono dopo.
            </p>
          </div>
          <Button variant="outlineGreen" to="/import-google">
            🔍 Importa da Google Books
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest text-center">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest text-center">
            ✓ {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5"
        >
          <div className="space-y-1">
            <Label>Titolo *</Label>
            <input
              type="text"
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              required
              className="input-base"
              placeholder="Il nome dell'opera"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Tipo opera *</Label>
              <select
                value={tipoOpera}
                onChange={(e) => setTipoOpera(e.target.value)}
                required
                className="input-base"
              >
                <option value="">Seleziona tipo</option>
                {tipi.map((t) => (
                  <option key={t.id_tipo} value={t.id_tipo}>
                    {t.nome_tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Stato pubblicazione</Label>
              <select
                value={statoOpera}
                onChange={(e) => setStatoOpera(e.target.value)}
                className="input-base"
              >
                <option value="finito">✅ Conclusa</option>
                <option value="in_corso">⏳ In pubblicazione</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Lingua originale</Label>
              <input
                type="text"
                value={linguaOriginale}
                onChange={(e) => setLinguaOriginale(e.target.value)}
                placeholder="es. it, en, ja"
                className="input-base"
              />
            </div>

            <div className="space-y-1">
              <Label>N. volume nella serie</Label>
              <input
                type="number"
                min="1"
                value={numeroVolume}
                onChange={(e) => setNumeroVolume(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Descrizione</Label>
            <textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={4}
              className="input-base"
              placeholder="Trama, abstract, ecc."
            />
          </div>

          <div className="pt-4 border-t border-gray-50 space-y-4">
            <div className="space-y-1">
              <Label>Autori</Label>
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                value={selectedAutori}
                loadOptions={loadAutori}
                onChange={(sel) => setSelectedAutori(sel || [])}
                styles={selectStyles}
                placeholder="Cerca autori esistenti..."
              />
            </div>

            <div className="space-y-1">
              <Label>Generi</Label>
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                value={selectedGeneri}
                loadOptions={loadGeneri}
                onChange={(sel) => setSelectedGeneri(sel || [])}
                styles={selectStyles}
                placeholder="Cerca generi..."
              />
            </div>

            <div className="space-y-1">
              <Label>Serie</Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={selectedSerie}
                loadOptions={loadSerie}
                onChange={setSelectedSerie}
                isClearable
                styles={selectStyles}
                placeholder="Cerca serie..."
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
            ℹ️ Editore, ISBN, anno e copertina sono dati di <strong>edizione</strong> — li aggiungi
            dopo aver creato l'opera, oppure usa "Importa da Google Books" per fare tutto in un colpo.
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outlineBlue"
              onClick={() => navigate(-1)}
              className="flex-1 bg-white"
            >
              Annulla
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-2">
              {loading ? "Salvataggio..." : "Crea opera"}
            </Button>
          </div>
        </form>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          outline: none;
          font-weight: 700;
          color: #374151;
          font-size: 0.875rem;
        }
        .input-base:focus {
          background: white;
          box-shadow: 0 0 0 2px #3b82f6;
          border-color: transparent;
        }
      `}</style>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
      {children}
    </label>
  );
}

export default CreateOpera;
