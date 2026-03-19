// -----------------------------------------------------------------------------
// loginService:
// - Effettua la chiamata POST a /auth/login
// - Invia username + password
// - Riceve accessToken + eventuali dati utente
// - Gestisce in modo sicuro errori di rete e risposte anomale
// -----------------------------------------------------------------------------
export async function loginService(identifier, password) {
  let response;

  // 1. Gestione errori di rete (Server down, no internet, CORS)
  try {
    response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include", // Fondamentale per ricevere i cookie (es. refreshToken)
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });
  } catch (networkError) {
    throw new Error("Impossibile contattare il server. Verifica la tua connessione.");
  }

  let data;

  // 2. Gestione sicura del parsing della risposta
  try {
    // Cerchiamo di estrarre il JSON solo se c'è una risposta dal server
    data = await response.json();
  } catch (parseError) {
    // Se fallisce, il server ha risposto con HTML o testo semplice (es. errore 502)
    throw new Error(`Errore anomalo del server (Status: ${response.status}). Riprova più tardi.`);
  }

  // 3. Gestione degli errori HTTP previsti (401, 403, 404, 400, ecc.)
  if (!response.ok) {
    // Cerchiamo l'errore in varie chiavi comuni, con un fallback di sicurezza
    const errorMessage = data?.error || data?.message || "Credenziali non valide o login fallito.";
    throw new Error(errorMessage);
  }

  // Login riuscito → ritorniamo i dati al componente
  return data;
}