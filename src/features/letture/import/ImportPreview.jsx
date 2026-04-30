import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/ui/Button";
import { secureFetch } from "../../../utils/secureFetch";

const selectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    padding: "2px",
    borderColor: "#e5e7eb",
    "&:hover": { borderColor: "#3b82f6" },
  }),
};

function ImportPreview() {
  const { volumeId } = useParams();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  // Scelte admin
  const [attachMode, setAttachMode] = useState("new"); // "new" | "existing"
  const [selectedOpera, setSelectedOpera] = useState(null);
  const [existingOperaDetails, setExistingOperaDetails] = useState(null);
  const [completeEmpty, setCompleteEmpty] = useState(false);

  // Form opera (solo se nuova)
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [linguaOriginale, setLinguaOriginale] = useState("");
  const [tipoOpera, setTipoOpera] = useState("");
  const [selectedSerie, setSelectedSerie] = useState(null);
  const [numeroVolumeOpera, setNumeroVolumeOpera] = useState("");
  const [autori, setAutori] = useState([]);
  const [generi, setGeneri] = useState([]);

  // Edizione (sempre)
  const [traduttore, setTraduttore] = useState("");
  const [numeroVolumeEdizione, setNumeroVolumeEdizione] = useState("");

  // Fetch preview
  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/import/google/preview/${encodeURIComponent(volumeId)}`,
          { method: "GET" },
          navigate
        );
        if (!res?.ok) {
          const err = await res?.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res?.status}`);
        }
        const data = await res.json();
        setPreview(data);

        if (data.already_imported) {
          setLoading(false);
          return;
        }

        setTitolo(data.opera.titolo || "");
        setDescrizione(data.opera.descrizione_opera || "");
        setLinguaOriginale(data.opera.lingua_originale || "");
        setTipoOpera(data.opera.tipo_opera_inferito || "");
        setNumeroVolumeOpera(data.serie_suggerita?.numero_volume_parsato || "");
        setNumeroVolumeEdizione(data.serie_suggerita?.numero_volume_parsato || "");
        if (data.serie_suggerita?.matched) {
          setSelectedSerie({
            value: data.serie_suggerita.matched.id_serie,
            label: data.serie_suggerita.matched.nome_serie,
          });
        }
        setAutori(
          (data.autori || []).map((a) => ({
            google_name: a.google_name,
            matched: a.matched,
            include: true,
          }))
        );
        setGeneri(
          (data.generi || []).map((g) => ({
            google_name: g.google_name,
            alias_match: g.alias_match,
            exact_match: g.exact_match,
            azione: g.azione_default,
            id_genere_curato: null,
          }))
        );
      } catch (err) {
        setError(err.message || "Errore caricamento preview");
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [volumeId, navigate]);

  // Quando l'admin seleziona un'opera esistente, carica i suoi dati per il confronto
  useEffect(() => {
    if (attachMode !== "existing" || !selectedOpera?.value) {
      setExistingOperaDetails(null);
      return;
    }
    (async () => {
      const res = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/opere/${selectedOpera.value}/full`,
        { method: "GET" },
        navigate
      );
      if (res?.ok) setExistingOperaDetails(await res.json());
    })();
  }, [selectedOpera, attachMode, navigate]);

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

  const loadOpere = async (input) => {
    // Se vuoto e ho matching_opere dal preview, mostro quelli come default
    if (!input) {
      return preview?.opera?.matching_opere?.map((o) => ({
        value: o.id_opera, label: o.titolo,
      })) || [];
    }
    const res = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere/search?q=${encodeURIComponent(input)}&limit=15`,
      { method: "GET" },
      navigate
    );
    if (!res?.ok) return [];
    const data = await res.json();
    return (data.data || []).map((o) => ({ value: o.id_opera, label: o.titolo }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const body = {
        volumeId: preview.google_volume_id,
        traduttore: traduttore || null,
        numero_volume_edizione: numeroVolumeEdizione ? parseInt(numeroVolumeEdizione, 10) : null,
      };

      if (attachMode === "existing") {
        if (!selectedOpera?.value) {
          setError("Seleziona un'opera esistente");
          setSubmitting(false);
          return;
        }
        body.id_opera = selectedOpera.value;
        body.complete_empty_fields = completeEmpty;
      } else {
        if (!titolo) { setError("Titolo obbligatorio"); setSubmitting(false); return; }
        if (!tipoOpera) { setError("Tipo opera obbligatorio"); setSubmitting(false); return; }

        body.titolo = titolo;
        body.descrizione_opera = descrizione || null;
        body.lingua_originale = linguaOriginale || null;
        body.tipo_opera = parseInt(tipoOpera, 10);
        body.id_serie = selectedSerie?.value || null;
        body.numero_volume_opera = numeroVolumeOpera ? parseInt(numeroVolumeOpera, 10) : null;
        body.autori = autori
          .filter((a) => a.include)
          .map((a) => a.matched ? { id_autore: a.matched.id_autore } : { nome_autore: a.google_name });
        body.generi = generi.map((g) => {
          if (g.azione === "ignora") return { azione: "ignora" };
          if (g.azione === "alias") return { azione: "alias", google_name: g.google_name };
          if (g.azione === "esistente") return { azione: "esistente", id_genere: g.exact_match.id_genere };
          if (g.azione === "curato") return { azione: "curato", id_genere: g.id_genere_curato };
          if (g.azione === "importato") return { azione: "importato", google_name: g.google_name };
          return { azione: "ignora" };
        });
      }

      const res = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/import/google/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        navigate
      );

      const data = await res?.json().catch(() => ({}));
      if (!res?.ok) throw new Error(data?.error || `HTTP ${res?.status}`);

      setSuccess(data.duplicate
        ? "Edizione già presente — apertura opera"
        : `Importato! Opera ${data.id_opera}, Edizione ${data.id_edizione}`);
      setTimeout(() => navigate(`/opere/${data.id_opera}`), 1500);
    } catch (err) {
      setError(err.message || "Errore durante l'import");
    } finally {
      setSubmitting(false);
    }
  };

  const updateAutore = (i, patch) =>
    setAutori((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  const updateGenere = (i, patch) =>
    setGeneri((prev) => prev.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));

  const generiCurati = preview?.lookups?.generi_curati || [];
  const tipi = preview?.lookups?.tipi || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="font-black text-gray-400 uppercase tracking-widest animate-pulse">
          Caricamento preview...
        </p>
      </div>
    );
  }

  if (preview?.already_imported) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-black text-emerald-700 mb-2">
              ✓ Già nel tuo archivio
            </h1>
            <p className="text-emerald-600 font-bold mb-2">
              Questo volume è già presente come edizione di:
            </p>
            <p className="text-lg font-black text-gray-900 mb-6">
              {preview.titolo_opera}
            </p>
            {preview.match_via === "isbn" && (
              <p className="text-xs text-emerald-600 mb-4 italic">
                (riconosciuto via ISBN — aveva un Google Volume ID diverso)
              </p>
            )}
            <Button variant="primary" to={`/opere/${preview.id_opera}`}>
              Vai all'opera
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Anteprima import
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
              Verifica le scelte e conferma
            </p>
          </div>
          <Button variant="outlineBlue" onClick={() => navigate(-1)}>← Indietro</Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest">
            ✓ {success}
          </div>
        )}

        {/* Header con dati Google */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-4">
            {preview?.edizione?.copertina_url && (
              <img
                src={preview.edizione.copertina_url}
                alt="cover"
                className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded shadow-sm shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Volume Google
              </div>
              <h2 className="text-lg font-black text-gray-900 line-clamp-2">{preview?.opera?.titolo}</h2>
              {preview?.serie_suggerita?.nome_parsato && (
                <p className="text-xs text-purple-700 font-black mt-1">
                  🔗 Serie rilevata: {preview.serie_suggerita.nome_parsato}
                  {preview.serie_suggerita.numero_volume_parsato &&
                    ` (vol. ${preview.serie_suggerita.numero_volume_parsato})`}
                </p>
              )}
              {preview?.opera?.descrizione_opera && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                  {preview.opera.descrizione_opera}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Toggle: nuova / aggancia (SEMPRE disponibile) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Cosa vuoi fare?
          </p>
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              type="button"
              onClick={() => setAttachMode("new")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                attachMode === "new" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              ➕ Crea nuova opera
            </button>
            <button
              type="button"
              onClick={() => setAttachMode("existing")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                attachMode === "existing" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              🔗 Aggancia come edizione
            </button>
          </div>

          {attachMode === "existing" && (
            <div className="space-y-3 pt-2">
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={selectedOpera}
                loadOptions={loadOpere}
                onChange={setSelectedOpera}
                placeholder="Cerca un'opera nel tuo DB..."
                styles={selectStyles}
                isClearable
                noOptionsMessage={({ inputValue }) =>
                  inputValue ? "Nessuna opera trovata" : "Inizia a scrivere..."
                }
              />

              {/* Confronto con opera esistente */}
              {existingOperaDetails && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
                    Opera attuale nel DB
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <Field label="Titolo" value={existingOperaDetails.titolo} />
                    <Field label="Lingua originale" value={existingOperaDetails.lingua_originale} />
                    <Field label="Tipo" value={existingOperaDetails.tipo} />
                    <Field label="Edizioni esistenti" value={existingOperaDetails.edizioni_count} />
                  </div>
                  <div className="mt-3 text-xs">
                    <span className="text-blue-700 font-black">Descrizione: </span>
                    <span className="text-gray-700">
                      {existingOperaDetails.descrizione_opera || <em className="text-gray-400">vuota</em>}
                    </span>
                  </div>
                </div>
              )}

              {/* Toggle "completa campi vuoti" */}
              {existingOperaDetails && (
                <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completeEmpty}
                    onChange={(e) => setCompleteEmpty(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-blue-600"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-700">
                      Completa i campi vuoti dell'opera con i dati Google
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Riempie solo i campi attualmente NULL (descrizione, lingua originale).
                      Mai sovrascrive i valori esistenti.
                    </p>
                  </div>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Form opera (solo se nuova) */}
        {attachMode === "new" && (
          <>
            <Section title="📚 Opera">
              <FieldInput label="Titolo *" value={titolo} onChange={setTitolo} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldSelect
                  label="Tipo opera *"
                  value={tipoOpera}
                  onChange={setTipoOpera}
                  options={[{ value: "", label: "Seleziona tipo" }, ...tipi.map((t) => ({ value: t.id_tipo, label: t.nome_tipo }))]}
                />
                <FieldInput label="Lingua originale" value={linguaOriginale} onChange={setLinguaOriginale} placeholder="es. it, en" />
              </div>
              <div className="space-y-1">
                <Label>Descrizione</Label>
                <textarea
                  value={descrizione}
                  onChange={(e) => setDescrizione(e.target.value)}
                  rows={4}
                  className="input-base"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Serie</Label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    value={selectedSerie}
                    loadOptions={loadSerie}
                    onChange={setSelectedSerie}
                    placeholder={preview?.serie_suggerita?.nome_parsato || "Cerca serie..."}
                    styles={selectStyles}
                    isClearable
                  />
                </div>
                <FieldInput
                  label="N. volume nella serie"
                  type="number"
                  value={numeroVolumeOpera}
                  onChange={setNumeroVolumeOpera}
                />
              </div>
            </Section>

            <Section title="✍️ Autori">
              {autori.length === 0 && <p className="text-xs text-gray-400 italic">Nessun autore restituito da Google</p>}
              {autori.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    checked={a.include}
                    onChange={(e) => updateAutore(i, { include: e.target.checked })}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-700 text-sm">{a.google_name}</div>
                    {a.matched ? (
                      <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                        ✓ Esistente (ID {a.matched.id_autore})
                      </div>
                    ) : (
                      <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                        + Verrà creato come nuovo
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Section>

            <Section title="🏷️ Generi">
              {generi.length === 0 && <p className="text-xs text-gray-400 italic">Nessun genere restituito da Google</p>}
              {generi.map((g, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="font-bold text-gray-700 text-sm">{g.google_name}</div>
                  <select
                    value={g.azione}
                    onChange={(e) => updateGenere(i, { azione: e.target.value })}
                    className="input-base"
                  >
                    {g.alias_match && <option value="alias">→ Usa alias: {g.alias_match.nome_genere}</option>}
                    {g.exact_match && <option value="esistente">→ Riusa esistente: {g.exact_match.nome_genere}</option>}
                    <option value="curato">→ Mappa su un genere curato...</option>
                    <option value="importato">+ Crea nuovo (fonte: importato)</option>
                    <option value="ignora">✗ Ignora</option>
                  </select>
                  {g.azione === "curato" && (
                    <select
                      value={g.id_genere_curato || ""}
                      onChange={(e) => updateGenere(i, { id_genere_curato: parseInt(e.target.value, 10) || null })}
                      className="input-base"
                    >
                      <option value="">Scegli genere curato...</option>
                      {generiCurati.map((c) => (
                        <option key={c.id_genere} value={c.id_genere}>{c.nome_genere}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </Section>
          </>
        )}

        {/* Edizione (sempre) */}
        <Section title="📦 Edizione">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadOnly label="ISBN" value={preview?.edizione?.isbn_issn || "—"} />
            <ReadOnly label="Editore" value={preview?.edizione?.editore || "—"} />
            <ReadOnly label="Anno" value={preview?.edizione?.anno_pubblicazione || "—"} />
            <ReadOnly label="Pagine" value={preview?.edizione?.numero_pagine || "—"} />
            <ReadOnly label="Lingua" value={preview?.edizione?.lingua || "—"} />
            <FieldInput
              label="N. volume (manga)"
              type="number"
              value={numeroVolumeEdizione}
              onChange={setNumeroVolumeEdizione}
              placeholder="Solo per manga"
            />
          </div>
          <FieldInput
            label="Traduttore (opzionale)"
            value={traduttore}
            onChange={setTraduttore}
            placeholder="Compila se è una traduzione"
          />
        </Section>

        <div className="flex gap-3 mt-6">
          <Button variant="outlineBlue" onClick={() => navigate(-1)} className="flex-1">
            Annulla
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting} className="flex-2">
            {submitting ? "Importando..." : "Conferma import"}
          </Button>
        </div>
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

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
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

function FieldInput({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base"
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-base">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{label}: </span>
      <span className="text-gray-700 font-bold">{value || "—"}</span>
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="px-4 py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-600">{value}</div>
    </div>
  );
}

export default ImportPreview;
