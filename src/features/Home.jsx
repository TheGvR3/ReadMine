import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import Navbar from "../components/Navbar";
import { secureFetch } from "../utils/secureFetch";
import MioDiario from "../components/MioDiario";
import { useAuth } from "../context/AuthContext"; // Importiamo l'Auth globale!

// ─── Card Opera (Animata) ─────────────────────────────────────────────────────
function OperaCard({ book, index = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.1, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.8, opacity: 0, y: 15 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 15 }}
      transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 300, damping: 24 }}
      // Aggiunto active:scale-[0.97] per il feedback tattile su mobile
      className="group w-[calc(50%-0.375rem)] sm:w-[130px] bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col overflow-hidden active:scale-[0.97]"
    >
      <Link to={`/opere/${book.id_opera}`} className="w-full h-full flex flex-col p-3">
        {/* Corretto bg-linear in bg-gradient */}
        <div className="w-full aspect-square bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl mb-3 flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform duration-300">
          <span className="text-3xl drop-shadow-sm">📕</span>
        </div>
        <p className="text-[13px] sm:text-sm font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2 leading-snug mb-1 mt-auto">
          {book.titolo}
        </p>
        {book.autori && (
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide line-clamp-1">
            {book.autori.nome} {book.autori.cognome}
          </p>
        )}
      </Link>
    </motion.div>
  );
}

// ─── Componente Pillola Generico (per Autori, Serie, Generi) ──────────────────
// Ho unificato le pillole per evitare di ripetere lo stesso codice tre volte!
function AnimatedPill({ item, linkTo, label, index = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.1, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.8, opacity: 0, y: 10 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.05, type: "spring", stiffness: 300, damping: 24 }}
    >
      <Link
        to={linkTo}
        className="block px-4 py-2 bg-white border border-gray-100 rounded-xl text-[13px] sm:text-sm font-bold text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm active:scale-95 line-clamp-1"
      >
        {label}
      </Link>
    </motion.div>
  );
}

// ─── Row section ──────────────────────────────────────────────────────────────
function Row({ title, emoji, linkTo, linkLabel, children }) {
  return (
    <section className="mb-10 px-4 sm:px-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm sm:text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
          <span className="text-lg">{emoji}</span> {title}
        </h2>
        <Link
          to={linkTo}
          className="text-[10px] sm:text-xs font-black text-blue-600 hover:text-blue-800 hover:underline uppercase tracking-widest px-2 py-1"
        >
          {linkLabel}
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {children}
      </div>
    </section>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Recuperiamo l'utente dal Context globale

  const [books, setBooks] = useState([]);
  const [autori, setAutori] = useState([]);
  const [serie, setSerie] = useState([]);
  const [generi, setGeneri] = useState([]);
  const [ultimeLetture, setUltimeLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shuffle = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        
        // Fetch dei cataloghi pubblici
        const promises = [
          secureFetch(`${baseUrl}/opere`, { method: "GET" }, navigate),
          secureFetch(`${baseUrl}/autori`, { method: "GET" }, navigate),
          secureFetch(`${baseUrl}/serie`, { method: "GET" }, navigate),
          secureFetch(`${baseUrl}/genere`, { method: "GET" }, navigate),
        ];

        // Se l'utente è loggato, fetch delle letture
        const currentUserId = user?.id || user?.id_utente;
        if (currentUserId) {
          promises.push(
            secureFetch(`${baseUrl}/letture/utente/${currentUserId}`, { method: "GET" }, navigate)
          );
        }

        const [resOpere, resAutori, resSerie, resGeneri, resLetture] = await Promise.all(promises);
        
        if (resOpere?.ok) setBooks(await resOpere.json());
        if (resAutori?.ok) setAutori(await resAutori.json());
        if (resSerie?.ok) setSerie(await resSerie.json());
        if (resGeneri?.ok) setGeneri(await resGeneri.json());
        
        if (currentUserId && resLetture?.ok) {
          const datiLetture = await resLetture.json();
          setUltimeLetture(datiLetture.slice(0, 3));
        }
      } catch {
        setError("Errore di connessione al server.");
      } finally {
        setLoading(false);
      }
    };
    
    // Ricarica se l'utente cambia
    load();
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <Navbar /> {/* Niente props! */}

      {/* Spazio inferiore per la Bottom Nav (pb-24) */}
      <div className="max-w-4xl mx-auto px-0 sm:px-6 pt-6 pb-24 md:py-10">
        
        {/* ── INTESTAZIONE MINIMAL ────────────────────────────────────────── */}
        <div className="px-4 sm:px-0 mb-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-black mb-1">
              ReadMine
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {user ? `Ciao, ${user.nome ?? user.username} 👋` : "Dashboard"}
            </h1>
          </div>
          {user && !user.editor && (
            <button
              onClick={() => navigate("/profile")}
              className="text-[10px] sm:text-xs font-black text-blue-700 bg-blue-100 border border-blue-200 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:bg-blue-200 hover:border-blue-300 transition-colors active:scale-95 shadow-sm uppercase tracking-widest"
            >
              Diventa Editor
            </button>
          )}
        </div>

        {/* ── LOADING / ERROR ─────────────────────────────────────────────── */}
        {loading && (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              Caricamento in corso...
            </p>
          </div>
        )}
        
        {error && (
          <div className="mx-4 sm:mx-0 mb-6 bg-red-50 border border-red-100 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-red-600 text-xs font-black uppercase tracking-widest">
              ⚠️ {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Componente esterno (sperando che anche lui sia responsive!) */}
            <div className="mb-10 px-4 sm:px-0">
               <MioDiario ultimeLetture={ultimeLetture} />
            </div>
            
            {/* ── OPERE ───────────────────────────────────────────────────── */}
            <Row title="Scopri Opere" emoji="🎲" linkTo="/listopere" linkLabel="Tutte">
              {shuffle(books, 6).map((b, i) => (
                <OperaCard key={b.id_opera} book={b} index={i} />
              ))}
            </Row>

            {/* ── AUTORI ──────────────────────────────────────────────────── */}
            <Row title="Autori" emoji="✍️" linkTo="/listautori" linkLabel="Tutti">
              {shuffle(autori, 6).map((a, i) => (
                <AnimatedPill 
                  key={a.id_autore} 
                  linkTo={`/autore/${a.id_autore}`} // Corretto al singolare come in App.js
                  label={a.nome_autore} 
                  index={i} 
                />
              ))}
            </Row>

            {/* ── SERIE ───────────────────────────────────────────── */}
            <Row title="Serie" emoji="📚" linkTo="/listserie" linkLabel="Tutte">
              {shuffle(serie, 6).map((s, i) => (
                <AnimatedPill 
                  key={s.id_serie} 
                  linkTo={`/serie/${s.id_serie}`} 
                  label={s.nome_serie} 
                  index={i} 
                />
              ))}
            </Row>

            {/* ── GENERI ───────────────────────────────────────────── */}
            <Row title="Generi" emoji="🎭" linkTo="/listgeneri" linkLabel="Tutti">
              {shuffle(generi, 6).map((g, i) => (
                <AnimatedPill 
                  key={g.id_genere} 
                  linkTo={`/genere/${g.id_genere}`} 
                  label={g.nome_genere} 
                  index={i} 
                />
              ))}
            </Row>

            {/* ── GUIDA ───────────────────────────────────────────────────── */}
            <div className="mx-4 sm:mx-0 mt-8">
              <Link
                to="/guide"
                className="flex items-center justify-between px-5 py-4 sm:p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-300 hover:bg-blue-50/50 transition-all group active:scale-[0.98]"
              >
                <span className="text-xs sm:text-sm font-black text-gray-700 group-hover:text-blue-700 transition-colors flex items-center gap-3 uppercase tracking-widest">
                  <span className="text-xl">❓</span> Guida all'utilizzo
                </span>
                <span className="text-gray-300 group-hover:text-blue-600 text-xl transition-transform transform group-hover:translate-x-1 font-bold">
                  →
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;