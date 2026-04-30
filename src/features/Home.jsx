import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import Navbar from "../components/Navbar";
import { secureFetch } from "../utils/secureFetch";
import MioDiario from "../components/MioDiario";
import { useAuth } from "../context/AuthContext";

// ─── Tile statistica (numero grande + label) ─────────────────────────────────
function StatTile({ icon, value, label, accent = "blue" }) {
  const accents = {
    blue:    "from-blue-50 to-indigo-50 text-blue-700 border-blue-100",
    emerald: "from-emerald-50 to-teal-50 text-emerald-700 border-emerald-100",
    amber:   "from-amber-50 to-yellow-50 text-amber-700 border-amber-100",
    violet:  "from-violet-50 to-purple-50 text-violet-700 border-violet-100",
  };
  return (
    <div className={`bg-linear-to-br ${accents[accent]} border rounded-2xl p-3 sm:p-4 shadow-sm`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base sm:text-lg" aria-hidden="true">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 truncate">
          {label}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-black leading-none">
        {value}
      </div>
    </div>
  );
}

// ─── Tile categoria (Opere/Autori/Serie/Generi) ──────────────────────────────
function CategoryTile({ icon, label, count, linkTo, index = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.1, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={linkTo}
        className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.97] group min-h-16"
      >
        <span className="text-2xl shrink-0" aria-hidden="true">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-wider">
            {label}
          </div>
          <div className="text-[11px] font-bold text-gray-400">
            {count} {count === 1 ? "elemento" : "elementi"}
          </div>
        </div>
        <span className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all text-lg font-bold">→</span>
      </Link>
    </motion.div>
  );
}

// ─── Card Opera "poster" in griglia ──────────────────────────────────────────
function OperaCard({ book, index = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.1, triggerOnce: true });
  const [coverErrored, setCoverErrored] = useState(false);
  const cover = book.copertina_principale;
  const showImg = cover && !coverErrored;

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.92, opacity: 0, y: 10 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.92, opacity: 0, y: 10 }}
      transition={{ duration: 0.35, delay: index * 0.04, type: "spring", stiffness: 300, damping: 24 }}
      className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col overflow-hidden active:scale-[0.97]"
    >
      <Link to={`/opere/${book.id_opera}`} className="w-full h-full flex flex-col p-3">
        <div className="w-full aspect-2/3 bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl mb-3 overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform duration-300">
          {showImg ? (
            <img
              src={cover}
              alt={`Copertina di ${book.titolo}`}
              loading="lazy"
              onError={() => setCoverErrored(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-blue-300">
              <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 2v8l-3-2-3 2V4h6z" />
              </svg>
            </div>
          )}
        </div>
        <p className="text-[13px] sm:text-sm font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2 leading-snug mb-1 mt-auto">
          {book.titolo}
        </p>
        {book.autori && (
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide line-clamp-1">
            {book.autori}
          </p>
        )}
      </Link>
    </motion.div>
  );
}

// ─── Header sezione ──────────────────────────────────────────────────────────
function SectionHeader({ title, emoji, linkTo }) {
  return (
    <div className="flex items-center justify-between mb-3 px-4 sm:px-0">
      <h2 className="text-xs sm:text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
        <span className="text-base">{emoji}</span> {title}
      </h2>
      {linkTo && (
        <Link
          to={linkTo}
          aria-label={`Vedi tutti ${title}`}
          className="text-blue-600 hover:text-blue-800 text-lg font-black px-2 py-1 active:scale-90 transition-transform"
        >
          →
        </Link>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-8 px-4 sm:px-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-white border border-gray-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

function SkeletonCategories() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-8 px-4 sm:px-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-white border border-gray-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

function SkeletonOpereGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 sm:px-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-3">
          <div className="w-full aspect-2/3 bg-gray-100 rounded-xl mb-3 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded animate-pulse mb-2" />
          <div className="h-2 w-2/3 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [autori, setAutori] = useState([]);
  const [serie, setSerie] = useState([]);
  const [generi, setGeneri] = useState([]);
  const [tutteLetture, setTutteLetture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shuffle = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

  // Statistiche utente derivate dalle letture
  const stats = useMemo(() => {
    const inCorso     = tutteLetture.filter((l) => l.stato === "in_corso").length;
    const completate  = tutteLetture.filter((l) => l.stato === "finito").length;
    const inCoda      = tutteLetture.filter((l) => l.stato === "da_iniziare").length;
    const valutazioni = tutteLetture.map((l) => Number(l.valutazione)).filter((v) => v > 0);
    const media       = valutazioni.length
      ? (valutazioni.reduce((a, b) => a + b, 0) / valutazioni.length).toFixed(1)
      : "—";
    return { inCorso, completate, inCoda, media };
  }, [tutteLetture]);

  const ultimeLetture = useMemo(() => tutteLetture.slice(0, 3), [tutteLetture]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        const promises = [
          secureFetch(`${baseUrl}/opere`,  { method: "GET" }, navigate),
          secureFetch(`${baseUrl}/autori`, { method: "GET" }, navigate),
          secureFetch(`${baseUrl}/serie`,  { method: "GET" }, navigate),
          secureFetch(`${baseUrl}/genere`, { method: "GET" }, navigate),
        ];

        const currentUserId = user?.id || user?.id_utente;
        if (currentUserId) {
          promises.push(
            secureFetch(`${baseUrl}/letture/utente/${currentUserId}`, { method: "GET" }, navigate)
          );
        }

        const [resOpere, resAutori, resSerie, resGeneri, resLetture] = await Promise.all(promises);

        const unwrap = (j) => (Array.isArray(j) ? j : j?.data ?? []);

        if (resOpere?.ok)  setBooks(unwrap(await resOpere.json()));
        if (resAutori?.ok) setAutori(unwrap(await resAutori.json()));
        if (resSerie?.ok)  setSerie(unwrap(await resSerie.json()));
        if (resGeneri?.ok) setGeneri(unwrap(await resGeneri.json()));

        if (currentUserId && resLetture?.ok) {
          setTutteLetture(await resLetture.json());
        }
      } catch {
        setError("Errore di connessione al server.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, user]);

  const categories = [
    { icon: "📕", label: "Opere",  count: books.length,  linkTo: "/listopere"  },
    { icon: "✍️", label: "Autori", count: autori.length, linkTo: "/listautori" },
    { icon: "📚", label: "Serie",  count: serie.length,  linkTo: "/listserie"  },
    { icon: "🎭", label: "Generi", count: generi.length, linkTo: "/listgeneri" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-4 sm:pt-6 pb-24 md:py-10">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-0 mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight truncate">
            {user ? (
              <>Ciao, <span className="text-blue-600">{user.nome ?? user.username}</span> 👋</>
            ) : (
              "Dashboard"
            )}
          </h1>
          {user && !user.editor && (
            <button
              onClick={() => navigate("/profile")}
              aria-label="Diventa editor"
              className="shrink-0 inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-blue-700 bg-blue-100 border border-blue-200 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:bg-blue-200 hover:border-blue-300 transition-colors active:scale-95 shadow-sm uppercase tracking-widest"
            >
              <span aria-hidden="true">✨</span>
              <span>Editor</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mx-4 sm:mx-0 mb-6 bg-red-50 border border-red-100 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-red-600 text-xs font-black uppercase tracking-widest">⚠️ {error}</p>
          </div>
        )}

        {loading && (
          <>
            <div className="mb-8 px-4 sm:px-0">
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-28 w-full bg-white border border-gray-100 rounded-2xl animate-pulse" />
            </div>
            <SkeletonStats />
            <SkeletonCategories />
            <SkeletonOpereGrid />
          </>
        )}

        {!loading && !error && (
          <>
            {/* ── MIO DIARIO ─────────────────────────────────────────────── */}
            <div className="mb-8 px-4 sm:px-0">
              <MioDiario ultimeLetture={ultimeLetture} />
            </div>

            {/* ── STATISTICHE UTENTE ─────────────────────────────────────── */}
            {user && tutteLetture.length > 0 && (
              <section className="mb-8">
                <SectionHeader title="Le tue statistiche" emoji="📊" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 sm:px-0">
                  <StatTile icon="📖" label="In lettura"  value={stats.inCorso}    accent="emerald" />
                  <StatTile icon="✅" label="Completate"  value={stats.completate} accent="blue"    />
                  <StatTile icon="🕐" label="In coda"     value={stats.inCoda}     accent="violet"  />
                  <StatTile icon="⭐" label="Voto medio"  value={stats.media}      accent="amber"   />
                </div>
              </section>
            )}

            {/* ── ESPLORA (4 tile categoria) ─────────────────────────────── */}
            <section className="mb-8">
              <SectionHeader title="Esplora il catalogo" emoji="🧭" />
              <div className="grid grid-cols-2 gap-3 px-4 sm:px-0">
                {categories.map((c, i) => (
                  <CategoryTile key={c.label} {...c} index={i} />
                ))}
              </div>
            </section>

            {/* ── SUGGERITI PER TE (griglia verticale) ───────────────────── */}
            {books.length > 0 && (
              <section className="mb-8">
                <SectionHeader title="Suggeriti per te" emoji="✨" linkTo="/listopere" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 sm:px-0">
                  {shuffle(books, 6).map((b, i) => (
                    <OperaCard key={b.id_opera} book={b} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* ── GUIDA ──────────────────────────────────────────────────── */}
            <div className="mx-4 sm:mx-0 mt-8">
              <Link
                to="/guide"
                className="flex items-center justify-between px-5 py-4 sm:p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-300 hover:bg-blue-50/50 transition-all group active:scale-[0.98]"
              >
                <span className="text-xs sm:text-sm font-black text-gray-700 group-hover:text-blue-700 transition-colors flex items-center gap-3 uppercase tracking-widest">
                  <span className="text-xl">❓</span> Guida all'utilizzo
                </span>
                <span className="text-gray-300 group-hover:text-blue-600 text-xl transition-transform transform group-hover:translate-x-1 font-bold">→</span>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ── FAB Aggiungi lettura (mobile) ─────────────────────────────────── */}
      {user && (
        <Link
          to="/createlettura"
          aria-label="Aggiungi nuova lettura"
          className="md:hidden fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/40 ring-4 ring-white/60 flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export default Home;
