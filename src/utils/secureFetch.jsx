import { refreshAccessToken } from "./refreshTokenRequest";

/**
 * secureFetch()
 * -----------------------------------------------------------------------------
 * Wrapper attorno a fetch() che:
 * - aggiunge automaticamente il token nell'header
 * - intercetta errori 401/403 (token scaduto o non valido)
 * - prova a fare il refresh del token
 * - ritenta la richiesta con il nuovo token
 * - se il refresh fallisce → reindirizza al login
 * -----------------------------------------------------------------------------
 */
export async function secureFetch(url, options = {}, navigate) {
  // 1. Recupero del token attuale dal localStorage
  let token = localStorage.getItem("accessToken");
  try {
    // 2. Prima richiesta al server
    //    - Copiamo tutte le opzioni passate (method, headers, body, ecc.)
    //    - Aggiungiamo l'header Authorization con il token
    let response = await fetch(url, {
      ...options, // copia tutte le proprietà (method, body, ecc.)
      credentials: "include",
      headers: {
        ...options.headers, // mantiene eventuali header personalizzati
        Authorization: `Bearer ${token}`,
      },
    });

    // 3. Se il token è scaduto o non valido (401/403)
    //    → tentiamo il refresh del token
    if (response.status === 401 || response.status === 403) {
      // 3.1 Tentativo di ottenere un nuovo access token tramite refresh token
      const newToken = await refreshAccessToken();
      // 3.2 Se il refresh fallisce → l'utente deve rifare login
      if (!newToken) {
        console.warn("Refresh fallito o sessione scaduta. Redirect al login.");
        localStorage.removeItem("accessToken");
        navigate("/login");
        return null; // interrompo
      }
      // 3.3 Salviamo il nuovo token nel localStorage
      localStorage.setItem("accessToken", newToken);
      // 3.4 Ritentiamo la stessa richiesta, ma con il token aggiornato
      response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
    // 4. Ritorniamo la risposta finale (sia quella originale che quella ritentata)
    return response;
  } catch (error) {
    console.error("Errore di rete o connessione rifiutata:", error);

    // Se vuoi che l'utente venga sloggato anche se il server è irraggiungibile:
    // navigate("/login");

    // Oppure rilancia l'errore per gestirlo nel componente (es. alert "Server Offline")
    throw new Error("Impossibile connettersi al server. Riprova più tardi.");
  }
}
