// -----------------------------------------------------------------------------
// registerService:
// - Effettua la chiamata POST all’endpoint /auth/register
// - Invia al backend tutti i dati raccolti dal form di registrazione
// - Gestisce eventuali errori restituiti dal server
// - Ritorna i dati della risposta in caso di successo
// -----------------------------------------------------------------------------
export async function registerService(registerData) {

  // ---------------------------------------------------------------------------
  // Chiamata al backend:
  // - method: "POST" → creazione nuovo utente
  // - headers: indica che stiamo inviando JSON
  // - body: contiene i dati del form convertiti in JSON
  // ---------------------------------------------------------------------------
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  });

  // Proviamo a leggere il JSON restituito dal server
  // Anche in caso di errore, il backend restituisce un JSON con { error: "..."}
  const data = await response.json();

  // Se la risposta NON è ok (es. 400, 409, 500):
  // - estraiamo il messaggio di errore dal backend
  // - lanciamo un errore che verrà catturato dal try/catch nel componente
  if (!response.ok) {
    throw new Error(data.error || "Registrazione fallita");
  }

  // Se tutto è andato bene → ritorniamo i dati della risposta
  // Il componente Register gestirà il messaggio di successo
  return data;
}
