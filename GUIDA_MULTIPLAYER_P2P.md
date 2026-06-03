# 🌐 Guida Multiplayer P2P - Battaglia Navale

## ✅ Modifiche Implementate

Il gioco ora utilizza **PeerJS** per il multiplayer online invece di WebSocket, permettendo connessioni **peer-to-peer dirette** senza bisogno di un server backend.

### Cosa è Cambiato

1. **Rimosso**: Sistema WebSocket che richiedeva server backend
2. **Aggiunto**: Sistema PeerJS per connessioni P2P dirette
3. **Funziona**: Sia in locale che su GitHub Pages senza server

## 🎮 Come Giocare Online

### Opzione 1: Partita Rapida

1. **Giocatore 1** (Host):
   - Clicca su "⚡ Partita Rapida"
   - Riceverai un **codice stanza** (es: `abc12345`)
   - Condividi questo codice con l'avversario
   - Attendi che si connetta

2. **Giocatore 2** (Guest):
   - Clicca su "🔒 Stanza Privata"
   - Inserisci il **codice stanza** ricevuto
   - Clicca "Continua"
   - Verrai connesso all'host

3. **Entrambi i giocatori**:
   - Posizionate le vostre navi
   - Cliccate "Inizia Partita"
   - Giocate a turni!

### Opzione 2: Stanza Privata

1. **Creare una stanza**:
   - Clicca su "🔒 Stanza Privata"
   - Lascia vuoto il campo codice
   - Clicca "Continua"
   - Riceverai un codice da condividere

2. **Unirsi a una stanza**:
   - Clicca su "🔒 Stanza Privata"
   - Inserisci il codice ricevuto
   - Clicca "Continua"

## 🔧 Dettagli Tecnici

### Sistema PeerJS

- **Libreria**: PeerJS 1.5.4 (caricata da CDN)
- **Server STUN**: Google STUN servers (pubblici e gratuiti)
- **Connessione**: WebRTC peer-to-peer diretta
- **Latenza**: Monitorata con sistema ping-pong (ogni 5 secondi)

### Vantaggi

✅ **Nessun server richiesto** - Funziona ovunque
✅ **Bassa latenza** - Connessione diretta tra giocatori
✅ **Gratuito** - Usa server STUN pubblici
✅ **Sicuro** - Connessione crittografata WebRTC
✅ **Compatibile** - Funziona su GitHub Pages

### Limitazioni

⚠️ **Entrambi i giocatori devono essere online** contemporaneamente
⚠️ **Firewall/NAT** potrebbero bloccare alcune connessioni
⚠️ **Nessun matchmaking automatico** - Serve condividere il codice manualmente

## 🐛 Risoluzione Problemi

### "Errore di connessione"

**Causa**: Firewall o NAT restrittivo

**Soluzione**:
1. Prova a invertire i ruoli (chi era host diventa guest)
2. Usa una rete diversa (es: hotspot mobile)
3. Disabilita temporaneamente firewall/VPN

### "Timeout connessione"

**Causa**: L'altro giocatore non è online o codice errato

**Soluzione**:
1. Verifica che il codice sia corretto
2. Assicurati che l'host sia ancora connesso
3. Riprova dopo qualche secondo

### "Avversario disconnesso"

**Causa**: Perdita di connessione internet o chiusura browser

**Soluzione**:
- Riconnettiti e crea una nuova partita

## 📝 Modifiche al Codice

### File Modificati

- **`frontend/js/app.js`**: 
  - Rimossi metodi WebSocket
  - Aggiunti metodi PeerJS
  - Implementata logica P2P per attacchi e chat

### Nuovi Metodi

```javascript
// Inizializzazione PeerJS
initializePeerMultiplayer(isQuickMatch)

// Setup event handlers
setupPeerEventHandlers()

// Gestione partita P2P
startPeerGame()
setupPeerAttackHandler()

// Gestione attacchi P2P
handlePeerOpponentAttack(data)
handlePeerAttackResult(data)
```

## 🚀 Deploy su GitHub Pages

Il gioco funziona perfettamente su GitHub Pages:

1. Carica la cartella `frontend/` su GitHub
2. Abilita GitHub Pages nelle impostazioni
3. Il gioco sarà accessibile a `https://username.github.io/repo-name/`
4. Il multiplayer P2P funzionerà senza configurazioni aggiuntive!

## 💡 Suggerimenti

- **Condividi il codice stanza** via WhatsApp, Telegram, Discord, ecc.
- **Usa nomi brevi** per facilitare la condivisione
- **Testa la connessione** prima di iniziare una partita importante
- **Usa la chat in-game** per comunicare durante la partita

## 🎯 Prossimi Passi (Opzionali)

Per migliorare ulteriormente il multiplayer:

1. **Matchmaking automatico**: Implementare un server di signaling leggero
2. **Lista stanze pubbliche**: Mostrare stanze disponibili
3. **Statistiche online**: Salvare record e classifiche
4. **Riconnessione automatica**: Gestire disconnessioni temporanee

---

**Buon divertimento con il multiplayer P2P! ⚓🎮**