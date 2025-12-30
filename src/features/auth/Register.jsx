import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerService } from "../../services/auth/registerService";
import { Link } from "react-router-dom";

function Register() {
  // ---------------------------------------------------------------------------
  // Stati locali:
  // - error → messaggio di errore da mostrare all’utente
  // - loading → indica se la richiesta è in corso
  // - successMessage → messaggio di successo da mostrare all’utente
  // ---------------------------------------------------------------------------
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Se l’utente è già loggato → reindirizza alla Home
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      navigate("/home");
    }
  }, []);

  // ---------------------------------------------------------------------------
  // handleSubmit:
  // - intercetta il submit del form
  // - legge i campi del form
  // - chiama registerService
  // - mostra messaggio di successo o errore
  // ---------------------------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Recupero dei valori dal form
    const email = event.target.email.value;
    const password = event.target.password.value;
    const nome = event.target.nome.value;
    const cognome = event.target.cognome.value;
    const data_nascita = event.target.data_nascita.value;
    const indirizzo = event.target.indirizzo.value;
    const telefono = event.target.telefono.value;

    // -------------------------------------------------------------------------
    // VALIDAZIONE DEI CAMPI
    // -------------------------------------------------------------------------

    // Email valida
    if (!email.includes("@") || !email.includes(".")) {
      setError("Inserisci un'email valida");
      setLoading(false);
      return;
    } else if (email.length > 100) {
      setError("L'email non può superare i 100 caratteri");
      setLoading(false);
      return;
    }

    // Password valida
    if (password.trim().length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      setLoading(false);
      return;
    } else if (password.trim().length > 50) {
      setError("La password non può superare i 50 caratteri");
      setLoading(false);
      return;
    } else if (/\s/.test(password)) {
      setError("La password non può contenere spazi");
      setLoading(false);
      return;
    }

    // Nome e cognome opzionali → ma se presenti devono essere validi
    if (nome && nome.length > 50) {
      setError("Il nome non può superare i 50 caratteri");
      setLoading(false);
      return;
    }

    if (cognome && cognome.length > 50) {
      setError("Il cognome non può superare i 50 caratteri");
      setLoading(false);
      return;
    }

    // Telefono opzionale → se presente deve essere numerico
    if (telefono && !/^[0-9+\s-]+$/.test(telefono)) {
      setError("Il numero di telefono contiene caratteri non validi");
      setLoading(false);
      return;
    }

    const registerData = {
      email,
      password,
      nome,
      cognome,
      data_nascita,
      indirizzo,
      telefono,
    };

    try {
      // Chiamata al servizio di registrazione
      const data = await registerService(registerData);

      if (!data) {
        throw new Error("Registrazione fallita");
      }
      // Messaggio di successo
      setSuccessMessage("Registrazione avvenuta con successo!");
      // Redirect automatico dopo 1.5 secondi
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      // Errori lato server o eccezioni
      setError(error.message || "Registrazione fallita");
    } finally {
      // Fine del caricamento
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER DELLA PAGINA DI REGISTRAZIONE
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-8 justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center mb-2">
        <h1 className="text-5xl font-extrabold tracking-tighter">
          <span className="text-blue-600">READ</span>
          <span className="text-gray-800">MINE</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono">
          Explore your own library
        </p>
      </div>
      {/* -----------------------------------------------------------------------
        BOX FORM REGISTRAZIONE
      ------------------------------------------------------------------------ */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Registrati</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-semibold">
              Email:
            </label>
            <input
              type="text"
              id="email"
              name="email"
              required
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Password */}
          <div className="flex flex-col">
            <label
              htmlFor="password"
              name="password"
              className="text-sm font-semibold"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              title="La password deve contenere almeno 8 caratteri, una maiuscola, un numero e un carattere speciale."
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Testo dei requisiti */}
            <p className="mt-1 text-xs text-gray-500">
              Minimo 8 caratteri: 1 maiuscola, 1 numero e 1 simbolo (es. @, $,
              !).
            </p>
          </div>
          {/* Altri campi opzionali */}
          {/* Nome */}
          <div className="flex flex-col">
            <label htmlFor="nome" className="text-sm font-semibold">
              Nome:
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Cognome */}
          <div className="flex flex-col">
            <label htmlFor="cognome" className="text-sm font-semibold">
              Cognome:
            </label>
            <input
              type="text"
              id="cognome"
              name="cognome"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Data di Nascita */}
          <div className="flex flex-col">
            <label htmlFor="data_nascita" className="text-sm font-semibold">
              Data di Nascita:
            </label>
            <input
              type="date"
              id="data_nascita"
              name="data_nascita"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Indirizzo */}
          <div className="flex flex-col">
            <label htmlFor="indirizzo" className="text-sm font-semibold">
              Indirizzo:
            </label>
            <input
              type="text"
              id="indirizzo"
              name="indirizzo"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Telefono */}
          <div className="flex flex-col">
            <label htmlFor="telefono" className="text-sm font-semibold">
              Telefono:
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Bottone di Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Caricamento..." : "Registrati"}
            </button>
          </div>
        </form>
        {/* Messaggi di successo o errore */}
        {successMessage && (
          <p className="mt-4 text-green-500 text-sm text-center">
            {successMessage}
          </p>
        )}
        {error && (
          <p className="mt-4 bg-red-200 text-red-500 text-sm text-center">
            {error}
          </p>
        )}
      </div>

      {/* -----------------------------------------------------------------------
        BOX LOGIN
      ------------------------------------------------------------------------ */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Hai già un account?</h2>
        <p className="text-gray-600 mb-4">Accedi qui!</p>
        <Link
          to="/login"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Register;
