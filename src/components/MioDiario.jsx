import { Link, useNavigate } from "react-router-dom";
import AnimatedList from "./AnimatedList";

// ─── Componente Singola Riga del Diario (Senza Link interno) ─────────────────
function DiarioListItem({ l, isSelected }) {
  const statusMap = {
    in_corso: { label: "In lettura", dot: "bg-emerald-500" },
    da_iniziare: { label: "In coda", dot: "bg-blue-500" },
    finito: { label: "Completato", dot: "bg-gray-400" },
  };
  const s = statusMap[l.stato] ?? { label: l.stato, dot: "bg-red-500" };

  const stats = [];
  if (l.volume)
    stats.push(
      <span key="vol">
        <span className="text-gray-400 font-normal mr-1">Vol</span>
        {l.volume}
      </span>,
    );
  if (l.capitolo)
    stats.push(
      <span key="cap">
        <span className="text-gray-400 font-normal mr-1">Cap</span>
        {l.capitolo}
      </span>,
    );
  if (l.pagina)
    stats.push(
      <span key="pag">
        <span className="text-gray-400 font-normal mr-1">Pag</span>
        {l.pagina}
      </span>,
    );

  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border rounded-xl p-4 transition-all duration-200 ${
        isSelected
          ? "border-blue-400 shadow-md ring-2 ring-blue-50"
          : "border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md"
      }`}
    >
      {/* Colonna Sinistra */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            {s.label}
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {l.opere?.titolo ?? l.nome}
        </h3>
        {l.opere?.autori && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {l.opere.autori.nome} {l.opere.autori.cognome}
          </p>
        )}
      </div>

      {/* Colonna Destra */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
        {stats.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center">
                {stat}
                {index < stats.length - 1 && (
                  <span className="text-gray-300 mx-2">|</span>
                )}
              </div>
            ))}
          </div>
        )}
        {l.valutazione && (
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md ml-auto sm:ml-0 sm:mt-2">
            <span className="text-yellow-500 text-xs">★</span>
            <span className="text-xs font-black text-yellow-700">
              {l.valutazione}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente Principale MioDiario ─────────────────────────────────────────
export default function MioDiario({ ultimeLetture }) {
  const navigate = useNavigate();

  return (
    <section className="mb-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          📖 Il Mio Diario
        </h2>
        <Link
          to="/listletture"
          className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
        >
          Vedi tutto
        </Link>
      </div>

      {/* Lista Animata o Empty State */}
      {ultimeLetture && ultimeLetture.length > 0 ? (
        <>
          <Link
            to="/createlettura"
            className="mt-2 flex items-center justify-center gap-2 w-full bg-gray-50/50 border border-dashed border-gray-300 rounded-xl py-3.5 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] group"
          >
            <span className="text-lg font-light text-gray-400 group-hover:text-blue-500">
              +
            </span>
            <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600">
              Aggiungi nuova lettura
            </span>
          </Link>
          <AnimatedList
            items={ultimeLetture}
            // Passiamo a renderItem la nostra card. Riceve l'oggetto della lettura e se è selezionato da tastiera
            renderItem={(item, isSelected) => (
              <DiarioListItem l={item} isSelected={isSelected} />
            )}
            // Quando l'utente clicca (o preme invio), navighiamo alla pagina di dettaglio
            onItemSelect={(item) => navigate(`/lettura/${item.id_lettura}`)}
            showGradients={true}
            displayScrollbar={false}
          />
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-gray-500 text-sm mb-4">
            Non hai ancora aggiunto nessuna lettura.
          </p>
          <Link
            to="/createlettura"
            className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md"
          >
            + Inizia ora
          </Link>
        </div>
      )}
    </section>
  );
}
