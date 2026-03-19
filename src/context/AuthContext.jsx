import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { secureFetch } from "../utils/secureFetch"; // Adegua il percorso

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await secureFetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { method: "GET" },
          navigate
        );
        if (res?.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Errore fetch profilo:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizzato per usare il contesto facilmente
export const useAuth = () => useContext(AuthContext);