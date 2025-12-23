/**
 * refreshAccessToken()
 * -----------------------------------------------------------------------------
 * Funzione che richiede un nuovo access token usando il refresh token.
 *
 * Funziona così:
 * 1. Invia una richiesta POST a /auth/refresh
 * 2. Il server legge il refresh token dai cookie (credentials: "include")
 * 3. Se valido → restituisce un nuovo access token
 * 4. Se NON valido → lancia un errore (l'utente deve rifare login)
 * -----------------------------------------------------------------------------
 */
export const refreshAccessToken = async () => {
  try {
    // 1. Richiesta al backend per ottenere un nuovo access token
    //    - method: "POST" → il refresh si fa sempre in POST
    //    - credentials: "include" → invia automaticamente i cookie (refresh token)
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // manda i cookie al server
    });

    // 2. Proviamo a leggere il JSON della risposta
    //    (può contenere accessToken o un messaggio di errore)
    const data = await response.json();

    // 3. Se la risposta NON è ok → il refresh token è scaduto o non valido
    //    → l'utente deve rifare login (throw)
    if (!response.ok) {
      throw new Error(data.error || "Errore nel refresh del token");
    }
    // 4. Se tutto ok → salviamo il nuovo access token nel localStorage
    localStorage.setItem("accessToken", data.accessToken);
    // 5. Ritorniamo il nuovo token al chiamante (secureFetch)
    return data.accessToken;
  } catch (error) {
    // 6. Se qualcosa va storto (server offline, refresh scaduto, ecc.)
    //    → logghiamo l'errore e lo rilanciamo
    console.error("Errore durante il refresh:", error.message);
    throw error; // verrà gestito da secureFetch
  }
};
