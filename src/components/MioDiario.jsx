import { Link, useNavigate } from "react-router-dom";
import AnimatedList from "./AnimatedList";

// ─── Mappa stato lettura ─────────────────────────────────────────────────────
const STATUS_MAP = {
  in_corso:    { label: "In lettura",  dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  da_iniziare: { label: "In coda",     dot: "bg-blue-500",    chip: "bg-blue-50 text-blue-700 border-blue-100" },
  finito:      { label: "Completato",  dot: "bg-gray-400",    chip: "bg-gray-50 text-gray-600 border-gray-100" },
};

// ─── Helper: stats inline (Vol/Cap/Pag) ──────────────────────────────────────
function PositionStats({ l, compact = false }) {
  const parts = [];
  if (l.volume)   parts.push({ k: "Vol", v: l.volume });
  if (l.capitolo) parts.push({ k: "Cap", v: l.capitolo });
  if (l.pagina)   parts.push({ k: "Pag", v: l.pagina });
  if (!parts.length) return null;

  return (
    <div className={`flex items-center gap-2 font-bold text-gray-700 ${compact ? "text-[11px]" : "text-xs"}`}>
      {parts.map((p, i) => (
        <span key={p.k} className="flex items-center gap-1">
          <span className="text-gray-400 font-normal">{p.k}</span>
          <span>{p.v}</span>
          {i < parts.length - 1 && <span className="text-gray-300 ml-1">·</span>}
        </span>
      ))}
    </div>
  );
}

// ─── Hero: lettura "in corso" in evidenza ────────────────────────────────────
function HeroCard({ l }) {
  const s = STATUS_MAP[l.stato] ?? { label: l.stato, dot: "bg-red-500", chip: "bg-red-50 text-red-700 border-red-100" };

  return (
    <Link
      to={`/lettura/${l.id_lettura}`}
      className="block bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all active:scale-[0.99] overflow-hidden mb-3"
    >
      <div className="flex gap-4 p-4">
        {/* Cover */}
        <div className="shrink-0 w-20 h-28 sm:w-24 sm:h-32 bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center border border-gray-100">
          <span className="text-3xl sm:text-4xl drop-shadow-sm">📕</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${s.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
            {l.valutazione && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-md">
                ★ {l.valutazione}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight line-clamp-2 mb-0.5">
            {l.opere?.titolo ?? l.nome}
          </h3>
          {l.opere?.autori && (
            <p className="text-xs text-gray-500 truncate mb-2">
              {l.opere.autori.nome} {l.opere.autori.cognome}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2">
            <PositionStats l={l} />
            <span className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-1 shrink-0">
              Continua <span className="text-base leading-none">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Riga compatta (per le letture sotto l'hero) ─────────────────────────────
function DiarioListItem({ l, isSelected }) {
  const s = STATUS_MAP[l.stato] ?? { label: l.stato, dot: "bg-red-500", chip: "bg-red-50 text-red-700 border-red-100" };

  return (
    <div
      className={`group flex items-center gap-3 bg-white border rounded-xl p-3 transition-all duration-200 min-h-16 ${
        isSelected
          ? "border-blue-400 shadow-md ring-2 ring-blue-50"
          : "border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md"
      }`}
    >
      {/* Indicatore stato */}
      <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${s.dot}`} aria-label={s.label} />

      {/* Titolo + autore */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {l.opere?.titolo ?? l.nome}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {l.opere?.autori && (
            <p className="text-[11px] text-gray-500 truncate">
              {l.opere.autori.nome} {l.opere.autori.cognome}
            </p>
          )}
          <PositionStats l={l} compact />
        </div>
      </div>

      {/* Rating */}
      {l.valutazione && (
        <span className="shrink-0 inline-flex items-center gap-0.5 text-[11px] font-black text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-md">
          ★ {l.valutazione}
        </span>
      )}
    </div>
  );
}

// ─── MioDiario ────────────────────────────────────────────────────────────────
export default function MioDiario({ ultimeLetture }) {
  const navigate = useNavigate();
  const items = ultimeLetture ?? [];
  const hasItems = items.length > 0;

  // L'hero è la prima lettura "in_corso", altrimenti la prima della lista
  const heroIndex = Math.max(0, items.findIndex((l) => l.stato === "in_corso"));
  const hero = hasItems ? items[heroIndex] : null;
  const rest = hasItems ? items.filter((_, i) => i !== heroIndex) : [];

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
          <span aria-hidden="true">📖</span> Il Mio Diario
        </h2>
        <Link
          to="/listletture"
          className="text-[11px] sm:text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors uppercase tracking-wider"
        >
          Vedi tutto
        </Link>
      </div>

      {hasItems ? (
        <>
          <HeroCard l={hero} />

          {rest.length > 0 && (
            <AnimatedList
              items={rest}
              renderItem={(item, isSelected) => (
                <DiarioListItem l={item} isSelected={isSelected} />
              )}
              onItemSelect={(item) => navigate(`/lettura/${item.id_lettura}`)}
              showGradients={true}
              displayScrollbar={false}
            />
          )}

          {/* Aggiungi: visibile solo da md in su (su mobile c'è il FAB) */}
          <Link
            to="/createlettura"
            className="hidden md:flex mt-2 items-center justify-center gap-2 w-full bg-gray-50/50 border border-dashed border-gray-300 rounded-xl py-3.5 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] group"
          >
            <span className="text-lg font-light text-gray-400 group-hover:text-blue-500">+</span>
            <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600">
              Aggiungi nuova lettura
            </span>
          </Link>
        </>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          <div className="text-5xl mb-3" aria-hidden="true">📚</div>
          <h3 className="text-base font-black text-gray-900 mb-1">Inizia il tuo diario</h3>
          <p className="text-gray-500 text-sm mb-5">
            Tieni traccia delle tue letture, segna i progressi e aggiungi una valutazione.
          </p>
          <Link
            to="/createlettura"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-black rounded-xl shadow-md active:scale-95 transition-all uppercase tracking-widest"
          >
            <span className="text-base">＋</span> Aggiungi lettura
          </Link>
        </div>
      )}
    </section>
  );
}
