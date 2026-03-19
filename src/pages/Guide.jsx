import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const sections = [
  {
    emoji: "🛠️",
    title: "Contribuisci al Database",
    color: "blue",
    accent: "border-blue-500/30 bg-blue-500/5",
    badge: "text-blue-400 bg-blue-400/10",
    items: [
      {
        label: "Inserire",
        labelColor: "text-emerald-400",
        text: 'Vai nella sezione desiderata e clicca su "Nuovo". Controlla sempre che non sia già presente per evitare duplicati.',
      },
      {
        label: "Modificare",
        labelColor: "text-blue-400",
        text: "In caso di errore nei dati, puoi correggere ogni elemento dal suo dettaglio.",
      },
      {
        label: "Eliminare",
        labelColor: "text-red-400",
        text: "Se un elemento è errato o non più necessario, puoi rimuoverlo definitivamente.",
      },
    ],
    note: "Titolo, Anno, Tipo, Stato, un Autore e un Genere sono obbligatori. Lingua, Editore e Serie sono opzionali.",
  },
  {
    emoji: "📚",
    title: "Gestisci la tua Biblioteca",
    color: "orange",
    accent: "border-orange-500/30 bg-orange-500/5",
    badge: "text-orange-400 bg-orange-400/10",
    items: [
      {
        label: "Filtri rapidi",
        labelColor: "text-yellow-400",
        text: "Scegli tra Libri, Manga & Fumetti o Riviste per vedere solo quel tipo di opere.",
      },
      {
        label: "Aggiungi al diario",
        labelColor: "text-emerald-400",
        text: 'Clicca su "Aggiungi" in Biblioteca, sul "+" in lista o su "+ Diario" nel dettaglio opera.',
      },
    ],
    note: 'Obbligatori: Nome e Stato. Opzionali: Data, Volume, Capitolo, Pagina, Valutazione e Note.',
  },
];

function GuidaSection({ section }) {
  return (
    <div className={`border ${section.accent} rounded-2xl p-6 mb-6`}>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{section.emoji}</span>
        <h2 className="text-base font-black text-white uppercase tracking-wider">
          {section.title}
        </h2>
      </div>

      <div className="space-y-4">
        {section.items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className={`text-[10px] font-black uppercase tracking-widest mt-0.5 shrink-0 ${item.labelColor}`}>
              {item.label}
            </span>
            <p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      {section.note && (
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <strong className="text-gray-400">Nota:</strong> {section.note}
          </p>
        </div>
      )}
    </div>
  );
}

function Guide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080d1a] text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm font-bold mb-8 transition-colors"
        >
          ← Torna indietro
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">
            ReadMine · Documentazione
          </p>
          <h1 className="text-3xl font-black text-white mb-2">
            📖 Guida all'utilizzo
          </h1>
          <p className="text-sm text-gray-400">
            Come usare ReadMine al meglio: archivio collaborativo e diario personale.
          </p>
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <GuidaSection key={i} section={s} />
        ))}

        {/* Badge beta */}
        <div className="text-center mt-8">
          <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full uppercase tracking-widest">
            Versione Beta · Nuove funzioni in arrivo
          </span>
        </div>
      </div>
    </div>
  );
}

export default Guide;