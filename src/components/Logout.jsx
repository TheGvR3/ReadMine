import { useNavigate } from "react-router-dom";
import { secureFetch } from "../utils/secureFetch";

const Logout = ({ setUser, setError }) => {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Funzione principale di logout
  // - Chiede conferma
  // - Usa secureFetch per chiamare /auth/logout
  // - Pulisce token e stato utente
  // - Reindirizza al login
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    // 1. Conferma dell’utente
    const confirmed = window.confirm(
      "Sei sicuro di voler effettuare il logout?"
    );
    if (!confirmed) return; // Se l'utente annulla, esci dalla funzione
    setError(""); // Reset dell'errore

    try {
      // 2. Chiamata al backend tramite secureFetch
      const response = await secureFetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include", // serve per inviare il refresh token nel cookie
        },
        navigate
      );
      if (!response) return; // Se secureFetch ha già reindirizzato → interrompi
      // 3. Se il server risponde con errore
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Errore durante il logout");
      }
    } catch (error) {
      
      console.error("Errore server durante logout:", error);
    }finally {
        // 4. Logout locale: pulizia garantita
        localStorage.removeItem("accessToken");
        if (setUser) setUser(null); // Resetta lo stato utente se presente
        navigate("/login");
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER DEL BOTTONE DI LOGOUT
  // ---------------------------------------------------------------------------
  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-sm"
    >
      Logout
    </button>
  );
};

export default Logout;
