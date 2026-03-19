// Variabile globale (fuori dalla funzione) per memorizzare la Promise del refresh in corso.
// Questo previene richieste multiple simultanee se più componenti falliscono insieme (errore 401).
let refreshPromise = null;

export const refreshAccessToken = async () => {
  // Se c'è già una richiesta di refresh in volo, ritorniamo quella in attesa
  if (refreshPromise) {
    return refreshPromise;
  }

  // Altrimenti, avviamo il processo e lo salviamo nella variabile globale
  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include", // Invia i cookie (Refresh Token)
        },
      );

      // Se il server rifiuta il refresh (es. token scaduto, non valido, o utente bannato)
      if (!response.ok) {
        localStorage.removeItem("accessToken"); // Forza il logout pulendo lo storage
        return null;
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Errore nel parsing della risposta di refresh");
        localStorage.removeItem("accessToken");
        return null;
      }

      // Se il server ha risposto correttamente ma manca il token nel body
      if (!data || !data.accessToken) {
        localStorage.removeItem("accessToken");
        return null;
      }

      // Tutto perfetto: salviamo il nuovo token
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    } catch (error) {
      // Errori di rete (server offline, no internet)
      console.error("Errore di rete durante il refresh:", error.message);
      // In caso di errore di rete NON eliminiamo il token, perché il server
      // potrebbe tornare online e il token potrebbe essere ancora valido.
      return null;
    } finally {
      // Qualunque cosa accada (successo o fallimento), a fine operazione
      // svuotiamo la variabile così le future richieste potranno fare un nuovo tentativo
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
