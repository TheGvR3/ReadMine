import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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

// Stati per ogni item: "new" | "attach" | "skip"
function ImportBulk() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialItems = location.state?.items || [];

  // Per ogni volumeId: { action, id_opera, numero_volume_edizione, complete_empty_fields, tipo_opera }
  const [choices, setChoices] = useState(() => {
    const map = {};
    for (const it of initialItems) {
      map[it.google_volume_id] = {
        action: "new",
        id_opera: null,
        numero_volume_edizione: it.serie_parsata?.numero || "",
        complete_empty_fields: false,
        tipo_opera: 1, // default Libro, l'admin overrida
      };
    }
    return map;
  });

  const [bulkOpera, setBulkOpera] = useState(null); // { value, label } per "aggancia tutti a"
  const [tipi, setTipi] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null); // { total, successCount, errorCount, successes, errors }
  const [error, setError] = useState("");

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

  if (initialItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 font-bold">Nessun volume selezionato.</p>
          <Link to="/import-google" className="text-blue-600 font-black mt-4 inline-block">
            ← Torna alla ricerca
          </Link>
        </div>
      </div>
    );
  }

  const loadOpere = async (input) => {
    if (!input) return [];
    const res = await secureFetch(
      `${import.meta.env.VITE_API_BASE_URL}/opere/search?q=${encodeURIComponent(input)}&limit=20`,
      { method: "GET" },
      navigate
    );
    if (!res?.ok) return [];
    const data = await res.json();
    return (data.data || []).map((o) => ({ value: o.id_opera, label: o.titolo }));
  };

  const updateChoice = (volumeId, patch) => {
    setChoices((prev) => ({ ...prev, [volumeId]: { ...prev[volumeId], ...patch } }));
  };

  // "Aggancia tutti a [opera]": applica id_opera=bulkOpera a tutti gli item
  // e mette action="attach" per ognuno. Gli item che hanno già "skip" restano skip.
  const applyBulkAttach = () => {
    if (!bulkOpera?.value) return;
    setChoices((prev) => {
      const next = { ...prev };
      for (const vid of Object.keys(next)) {
        if (next[vid].action !== "skip") {
          next[vid] = { ...next[vid], action: "attach", id_opera: bulkOpera.value };
        }
      }
      return next;
    });
  };

  const setAllAction = (action) => {
    setChoices((prev) => {
      const next = { ...prev };
      for (const vid of Object.keys(next)) {
        next[vid] = { ...next[vid], action };
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setResults(null);

    // Costruzione body items
    const items = initialItems
      .filter((it) => choices[it.google_volume_id]?.action !== "skip")
      .map((it) => {
        const c = choices[it.google_volume_id];
        const base = {
          volumeId: it.google_volume_id,
          numero_volume_edizione: c.numero_volume_edizione
            ? parseInt(c.numero_volume_edizione, 10) : null,
        };
        if (c.action === "attach") {
          if (!c.id_opera) {
            // Skipperemo lato client, ma segnalo
            return { ...base, _invalid: true };
          }
          return {
            ...base,
            id_opera: c.id_opera,
            complete_empty_fields: !!c.complete_empty_fields,
          };
        }
        // action === "new": serve almeno tipo_opera. Lasciamo che il backend
        // costruisca autori/generi auto dalle scelte di default Google.
        // Per il bulk semplifichiamo: si accetta ciò che Google manda + tipo scelto.
        return {
          ...base,
          tipo_opera: c.tipo_opera,
          // Niente autori/generi qui — il backend non li genera automaticamente,
          // quindi l'opera nasce senza link. Per scelta esplicita usare l'anteprima.
        };
      });

    const invalid = items.filter((i) => i._invalid);
    if (invalid.length > 0) {
      setError(
        `${invalid.length} item ha azione "Aggancia" ma nessuna opera selezionata. Sceglile o cambia in "Salta".`
      );
      setSubmitting(false);
      return;
    }
    if (items.length === 0) {
      setError("Nessun item da importare (tutti su 'Salta').");
      setSubmitting(false);
      return;
    }

    try {
      const res = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/import/google/import-bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: items.map(({ _invalid, ...rest }) => rest) }),
        },
        navigate
      );

      if (!res?.ok) {
        const err = await res?.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res?.status}`);
      }
      setResults(await res.json());
    } catch (err) {
      setError(err.message || "Errore durante l'import bulk");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  if (results) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Import completato
            </h1>
            <div className="flex gap-4 my-6">
              <div className="flex-1 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <p className="text-3xl font-black text-emerald-700">{results.successCount}</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Successi</p>
              </div>
              <div className="flex-1 p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                <p className="text-3xl font-black text-red-700">{results.errorCount}</p>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Errori</p>
              </div>
            </div>

            {results.errors?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-2">
                  Falliti
                </p>
                <ul className="space-y-1 text-xs">
                  {results.errors.map((e, i) => {
                    const item = initialItems.find((x) => x.google_volume_id === e.volumeId);
                    return (
                      <li key={i} className="p-2 bg-red-50 rounded-lg">
                        <span className="font-black text-red-700">
                          {item?.titolo || e.volumeId}
                        </span>{" "}
                        — {e.error}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="outlineBlue" to="/import-google" className="flex-1">
                Nuova ricerca
              </Button>
              <Button variant="primary" to="/listopere" className="flex-1">
                Vai al catalogo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Import multiplo
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
              {initialItems.length} volumi selezionati
            </p>
          </div>
          <Button variant="outlineBlue" onClick={() => navigate(-1)}>← Indietro</Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest">
            ⚠️ {error}
          </div>
        )}

        {/* Azioni rapide */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Aggancia tutti a un'opera (utile per i manga)
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <AsyncSelect
                  cacheOptions
                  value={bulkOpera}
                  loadOptions={loadOpere}
                  onChange={setBulkOpera}
                  placeholder="Cerca opera (es. 'One Piece')..."
                  styles={selectStyles}
                  isClearable
                />
              </div>
              <Button
                variant="primary"
                onClick={applyBulkAttach}
                disabled={!bulkOpera?.value}
              >
                Applica a tutti
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest self-center mr-1">
              Azione di massa:
            </p>
            <button
              type="button"
              onClick={() => setAllAction("new")}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200"
            >
              Tutti come nuova opera
            </button>
            <button
              type="button"
              onClick={() => setAllAction("skip")}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200"
            >
              Salta tutti
            </button>
          </div>
        </div>

        {/* Lista item */}
        <div className="space-y-2">
          {initialItems.map((it) => {
            const c = choices[it.google_volume_id];
            const cover = it.copertina_url || "https://via.placeholder.com/64x96?text=No+Cover";

            return (
              <div
                key={it.google_volume_id}
                className={`flex gap-3 p-3 bg-white border rounded-xl shadow-sm items-start ${
                  c.action === "skip" ? "opacity-50" : "border-gray-100"
                }`}
              >
                <img
                  src={cover}
                  alt="cover"
                  className="w-12 h-16 object-cover rounded shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h4 className="font-black text-gray-900 text-sm line-clamp-1">
                      {it.titolo}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider line-clamp-1">
                      {it.autori?.join(", ") || "—"}
                      {it.editore && ` • ${it.editore}`}
                      {it.anno_pubblicazione && ` • ${it.anno_pubblicazione}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      value={c.action}
                      onChange={(e) => updateChoice(it.google_volume_id, { action: e.target.value })}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700"
                    >
                      <option value="new">➕ Nuova opera</option>
                      <option value="attach">🔗 Aggancia a...</option>
                      <option value="skip">✗ Salta</option>
                    </select>

                    {c.action === "new" && (
                      <select
                        value={c.tipo_opera}
                        onChange={(e) => updateChoice(it.google_volume_id, { tipo_opera: parseInt(e.target.value, 10) })}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700"
                      >
                        {tipi.map((t) => (
                          <option key={t.id_tipo} value={t.id_tipo}>
                            Tipo: {t.nome_tipo}
                          </option>
                        ))}
                      </select>
                    )}

                    {c.action === "attach" && (
                      <>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          → Opera:
                        </span>
                        <span className={`text-xs font-bold ${c.id_opera ? "text-blue-600" : "text-amber-600"}`}>
                          {c.id_opera ? `#${c.id_opera}` : "non scelta!"}
                        </span>
                      </>
                    )}

                    {c.action !== "skip" && (
                      <input
                        type="number"
                        value={c.numero_volume_edizione}
                        onChange={(e) => updateChoice(it.google_volume_id, { numero_volume_edizione: e.target.value })}
                        placeholder="Vol N"
                        className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700"
                      />
                    )}

                    {c.action === "attach" && (
                      <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-600 uppercase tracking-widest cursor-pointer">
                        <input
                          type="checkbox"
                          checked={c.complete_empty_fields}
                          onChange={(e) => updateChoice(it.google_volume_id, { complete_empty_fields: e.target.checked })}
                          className="w-3.5 h-3.5 accent-blue-600"
                        />
                        Completa campi vuoti
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra fissa */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <p className="text-sm font-black text-gray-800">
            📥 Pronti:{" "}
            <span className="text-blue-600">
              {Object.values(choices).filter((c) => c.action !== "skip").length}
            </span>
            <span className="text-gray-400">/{initialItems.length}</span>
          </p>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Importando..." : "Importa tutti →"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ImportBulk;
