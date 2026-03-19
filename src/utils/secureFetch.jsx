import { refreshAccessToken } from "./refreshTokenRequest";

/**
 * secureFetch()
 * -----------------------------------------------------------------------------
 * Wrapper attorno a fetch() che:
 * - aggiunge automaticamente il token nell'header
 * - intercetta errori 401 (token scaduto o non valido)
 * - prova a fare il refresh del token
 * - ritenta la richiesta con il nuovo token
 * - se il refresh fallisce → reindirizza al login
 * -----------------------------------------------------------------------------
 */
export async function secureFetch(url, options = {}, navigate) {
  let token = localStorage.getItem("accessToken");

  // 1. SE IL TOKEN MANCA COMPLETAMENTE
  if (!token) {
    console.log("Token assente, provo il refresh silenzioso...");
    token = await refreshAccessToken();

    // Se fallisce anche il refresh iniziale, lo mandiamo via
    if (!token) {
      if (navigate) navigate("/login", { replace: true });
      return null;
    }
  }

  // Helper per generare dinamicamente le opzioni di fetch per non ripetere codice
  const getFetchOptions = (currentToken) => ({
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      Authorization: `Bearer ${currentToken}`,
    },
  });

  try {
    // 2. Prima richiesta al server
    let response = await fetch(url, getFetchOptions(token));

    // 3. SOLO 401: Token scaduto o manipolato (Non 403)
    if (response.status === 401) {
      console.log("Token scaduto, avvio refresh...");
      const newToken = await refreshAccessToken();

      // Se il refresh fallisce (es. refreshToken scaduto)
      if (!newToken) {
        console.warn("Refresh fallito o sessione scaduta. Redirect al login.");
        // refreshAccessToken ha già pulito il localStorage
        if (navigate) navigate("/login", { replace: true });
        return null; // Interrompiamo l'esecuzione
      }

      // Ritentiamo la chiamata con la configurazione aggiornata al nuovo token
      response = await fetch(url, getFetchOptions(newToken));
    }

    // 4. Ritorniamo la risposta (sia essa la prima andata a buon fine, o la ritentata, o eventuali errori 400/500/403)
    return response;

  } catch (error) {
    console.error("Errore di rete o connessione rifiutata:", error);
    // Rilanciamo l'errore in modo che il componente React possa fare un setError("Server offline")
    throw new Error("Impossibile connettersi al server. Riprova più tardi.");
  }
}