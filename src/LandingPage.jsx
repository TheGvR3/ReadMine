import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <nav className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold tracking-tighter">
            <span className="text-blue-600">READ</span>
            <span className="text-gray-800">MINE</span>
          </h1>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
            Accedi
          </Link>
          <Link 
            to="/register" 
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            Registrati
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="grow">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
            Versione Beta v1.0
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-4">
            <span className="text-blue-600">READ</span>
            <span className="text-gray-800">MINE</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl mt-1 uppercase tracking-widest font-mono">
            Explore your own library
          </p>
          <h2 className="mt-8 max-w-3xl mx-auto text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            L'universo delle tue letture, <br />organizzato in un unico posto.
          </h2>
        </div>

        {/* Descrizione Dettagliata */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              
              {/* Colonna Editor: Il Database */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="p-2 bg-indigo-100 rounded-lg">🌍</span> Il Database Aperto
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Esplora un catalogo vastissimo di <strong>opere</strong> che include 
                  <span className="font-semibold text-gray-800"> libri, manga, fumetti, riviste</span> e molto altro. 
                  Ogni opera è catalogata per <strong>autore, serie e genere</strong>.
                </p>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <strong>Diventa Editor:</strong> Se vuoi contribuire, puoi richiedere i permessi per 
                    <span className="text-green-700 font-bold"> inserire</span>, 
                    <span className="text-blue-700 font-bold"> modificare</span> o 
                    <span className="text-red-700 font-bold"> ampliare</span> ogni dettaglio del database.
                  </p>
                </div>
              </div>

              {/* Colonna Utente: La Libreria */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="p-2 bg-orange-100 rounded-lg">📚</span> Libreria Personale
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Crea il tuo diario di lettura personalizzato. Tieni traccia dei libri che 
                  <span className="text-gray-800 font-medium"> hai letto</span>, che 
                  <span className="text-gray-800 font-medium"> vuoi leggere</span> o che 
                  <span className="text-gray-800 font-medium"> stai leggendo</span> proprio ora.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">✅ Precisione al singolo <strong>capitolo</strong></li>
                  <li className="flex items-center gap-2">✅ Gestione dei <strong>volumi</strong></li>
                  <li className="flex items-center gap-2">✅ Segnalibro automatico per la <strong>pagina</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sezione Roadmap / Futuro */}
        <div className="py-20 max-w-5xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12 italic">
            "Siamo solo all'inizio..."
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-bold text-gray-800">Statistiche & Valutazioni</h4>
              <p className="text-sm text-gray-500 mt-2 text-balance">Usa i tuoi voti per generare grafici e statistiche avanzate sulle tue abitudini di lettura.</p>
            </div>
            <div className="border-l-4 border-purple-400 pl-4">
              <h4 className="font-bold text-gray-800">Suggerimenti AI</h4>
              <p className="text-sm text-gray-500 mt-2 text-balance">Ricevi consigli personalizzati basati sui titoli che hai amato di più nella tua biblioteca.</p>
            </div>
            <div className="border-l-4 border-green-400 pl-4">
              <h4 className="font-bold text-gray-800">Chatbot Assistant (Alpha)</h4>
              <p className="text-sm text-gray-500 mt-2 text-balance">Un assistente intelligente, attualmente in fase di test, pronto ad aiutarti a scoprire la tua prossima lettura.</p>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Finale */}
      <section className="bg-blue-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-6">Pronto a esplorare la tua miniera di carta?</h2>
        <Link 
          to="/register" 
          className="inline-block px-10 py-4 bg-white text-blue-600 text-xl font-bold rounded-xl hover:bg-gray-100 transition-transform hover:scale-105 shadow-2xl"
        >
          Inizia ora la tua avventura
        </Link>
      </section>

      <footer className="py-8 bg-gray-900 text-gray-400 text-center text-xs">
        &copy; 2025 READMINE - Explore your own library. All rights reserved.
      </footer>
    </div>
  );
}

export default LandingPage;