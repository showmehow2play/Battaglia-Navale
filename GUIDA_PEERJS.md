# Guida PeerJS - Multiplayer Peer-to-Peer

## 🎯 Cos'è PeerJS?

PeerJS è una libreria JavaScript che semplifica l'uso di WebRTC per creare connessioni peer-to-peer dirette tra browser, senza bisogno di un server backend.

## ✅ Vantaggi

- **Zero configurazione server** - Tutto funziona da GitHub Pages
- **Completamente gratuito** - Nessun costo
- **Bassa latenza** - Connessione diretta tra i due giocatori
- **Privacy** - I dati non passano per server esterni (solo per il signaling iniziale)
- **Semplice** - Basta aggiungere una libreria JavaScript

## 📦 Cosa è Già Stato Fatto

Ho già creato:
1. ✅ **`frontend/js/peer-multiplayer.js`** - Classe completa per gestire PeerJS
2. ✅ **Aggiunto PeerJS** all'HTML (`index.html`)
3. ✅ **Preparato app.js** con la proprietà `peerMultiplayer`

## 🚀 Come Funziona

### Flusso di Gioco P2P

```
Giocatore 1 (Host)                    Giocatore 2 (Guest)
─────────────────                     ──────────────────
1. Inizializza PeerJS
2. Ottiene ID univoco (es: "abc123")
3. Condivide ID con Giocatore 2  ──>  4. Riceve ID
                                      5. Si connette a "abc123"
6. Accetta connessione            <──  
7. Entrambi posizionano navi
8. Giocano a turni alternati
```

### Esempio di Utilizzo

```javascript
// 1. Inizializza PeerJS
const peer = new PeerMultiplayer();
await peer.initialize();

// 2. GIOCATORE 1: Crea partita (Host)
const roomId = peer.hostGame();
console.log('Condividi questo ID:', roomId); // es: "abc123xyz"

// 3. GIOCATORE 2: Unisciti alla partita
await peer.joinGame('abc123xyz');

// 4. Invia/Ricevi messaggi
peer.on('connected', () => {
    console.log('Connesso!');
});

peer.on('opponent_attack', (data) => {
    console.log('Avversario ha attaccato:', data.row, data.col);
});

peer.sendAttack(3, 5); // Attacca riga 3, colonna 5
```

## 🔧 Integrazione Completa in app.js

Per integrare completamente PeerJS, devi modificare `app.js`:

### 1. Sostituisci `connectToServer()` con `initializePeerConnection()`

```javascript
/**
 * Inizializza la connessione P2P
 */
async initializePeerConnection() {
    try {
        this.ui.showToast('Inizializzazione connessione P2P...', 'info');
        
        // Crea istanza PeerMultiplayer
        this.peerMultiplayer = new PeerMultiplayer();
        
        // Inizializza
        await this.peerMultiplayer.initialize();
        
        // Setup event handlers
        this.setupPeerEventHandlers();
        
        // Se c'è un roomCode, unisciti; altrimenti crea stanza
        if (this.roomCode) {
            // Guest: unisciti alla stanza
            this.isHost = false;
            this.ui.showToast(`Connessione a stanza ${this.roomCode}...`, 'info');
            await this.peerMultiplayer.joinGame(this.roomCode);
        } else {
            // Host: crea nuova stanza
            this.isHost = true;
            this.roomCode = this.peerMultiplayer.hostGame();
            this.ui.showToast(`Stanza creata: ${this.roomCode}`, 'success', 5000);
            
            // Mostra il codice all'utente
            alert(`Condividi questo codice con l'altro giocatore:\n\n${this.roomCode}`);
        }
        
        // Vai al setup
        this.startSetup();
        
    } catch (error) {
        console.error('Errore connessione P2P:', error);
        this.ui.showToast('Errore connessione P2P: ' + error.message, 'error');
    }
}

/**
 * Setup event handlers per PeerJS
 */
setupPeerEventHandlers() {
    // Quando l'avversario è pronto
    this.peerMultiplayer.on('opponent_ready', (data) => {
        console.log('Avversario pronto!');
        this.ui.showToast('Avversario pronto! Inizia la partita', 'success');
    });
    
    // Quando l'avversario attacca
    this.peerMultiplayer.on('opponent_attack', (data) => {
        const { row, col } = data;
        this.handleOpponentAttack(row, col);
    });
    
    // Quando riceviamo il risultato del nostro attacco
    this.peerMultiplayer.on('attack_result', (data) => {
        this.handleAttackResult(data);
    });
    
    // Messaggio chat
    this.peerMultiplayer.on('chat_message', (data) => {
        this.addChatMessage(data.message, false);
    });
    
    // Game over
    this.peerMultiplayer.on('game_over', (data) => {
        this.endGame(data.winner === this.peerMultiplayer.getPeerId());
    });
    
    // Disconnessione
    this.peerMultiplayer.on('disconnected', () => {
        this.ui.showToast('Avversario disconnesso', 'error');
        this.endGame(false);
    });
    
    // Errori
    this.peerMultiplayer.on('error', (data) => {
        this.ui.showToast('Errore: ' + data.error, 'error');
    });
    
    // Latenza
    this.peerMultiplayer.on('latency_update', (data) => {
        console.log('Latenza:', data.latency, 'ms');
    });
}
```

### 2. Modifica `startOnlineGame()`

```javascript
/**
 * Inizia la partita online
 */
startOnlineGame() {
    // Notifica all'avversario che siamo pronti
    this.peerMultiplayer.sendSetupComplete();
    
    // Mostra schermo di gioco
    this.ui.showScreen('game');
    
    // Renderizza griglie
    this.ui.myGridElement = document.getElementById('myGrid');
    this.ui.enemyGridElement = document.getElementById('enemyGrid');
    
    this.ui.renderGrid(this.ui.myGridElement, this.game.playerGrid, false, true);
    this.ui.renderGrid(this.ui.enemyGridElement, this.game.opponentGrid, false, false);
    
    // Renderizza lista navi nemiche
    this.ui.renderEnemyShipsList(this.game.opponentFleet);
    
    // Setup click handler per attacchi
    this.setupAttackHandler();
    
    // L'host inizia per primo
    if (this.isHost) {
        this.ui.updateTurnIndicators(true);
        this.ui.showToast('Il tuo turno!', 'info');
    } else {
        this.ui.updateTurnIndicators(false);
        this.ui.showToast('Turno avversario...', 'info');
    }
}
```

### 3. Modifica `handleAttack()` per inviare via P2P

```javascript
/**
 * Gestisce un attacco del giocatore
 */
handleAttack(row, col) {
    if (this.gameMode === 'online') {
        // Invia attacco via P2P
        this.peerMultiplayer.sendAttack(row, col);
        this.ui.showToast('Attacco inviato...', 'info');
    } else {
        // Modalità CPU (codice esistente)
        // ...
    }
}

/**
 * Gestisce un attacco dell'avversario
 */
handleOpponentAttack(row, col) {
    // Processa l'attacco sulla nostra griglia
    const result = this.game.playerGrid.receiveAttack({ row, col });
    
    // Invia il risultato all'avversario
    this.peerMultiplayer.sendAttackResult({
        row,
        col,
        hit: result.hit,
        sunk: result.sunk,
        shipName: result.ship ? result.ship.name : null
    });
    
    // Aggiorna UI
    this.ui.renderGrid(this.ui.myGridElement, this.game.playerGrid, false, true);
    
    // Verifica se abbiamo perso
    if (this.game.playerGrid.areAllShipsSunk()) {
        this.endGame(false);
    } else {
        // Ora è il nostro turno
        this.ui.updateTurnIndicators(true);
    }
}
```

### 4. Modifica i listener del menu

```javascript
// In setupMenuListeners(), sostituisci:
document.querySelector('[data-mode="online-quick"]').addEventListener('click', () => {
    this.gameMode = 'online';
    this.roomCode = null; // Nessun codice = crea nuova stanza
    this.initializePeerConnection();
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
    const roomCode = document.getElementById('roomCodeInput').value.trim();
    if (!roomCode) {
        this.ui.showToast('Inserisci un codice stanza', 'warning');
        return;
    }
    this.roomCode = roomCode;
    this.gameMode = 'online';
    this.ui.hideModal('privateRoomModal');
    this.initializePeerConnection();
});
```

## 📝 Checklist Integrazione

- [ ] Sostituire `connectToServer()` con `initializePeerConnection()`
- [ ] Aggiungere `setupPeerEventHandlers()`
- [ ] Modificare `startOnlineGame()` per usare PeerJS
- [ ] Modificare `handleAttack()` per inviare via P2P
- [ ] Aggiungere `handleOpponentAttack()`
- [ ] Modificare i listener del menu
- [ ] Testare creazione stanza (host)
- [ ] Testare join stanza (guest)
- [ ] Testare gameplay completo

## 🧪 Come Testare

### Test Locale (2 Browser)

1. Apri il gioco in Chrome: `http://localhost:8000`
2. Clicca "Partita Rapida Online"
3. Copia il codice stanza (es: "abc123xyz")
4. Apri il gioco in Firefox: `http://localhost:8000`
5. Clicca "Stanza Privata"
6. Incolla il codice e unisciti
7. Entrambi posizionate le navi
8. Giocate!

### Test Remoto (2 Computer)

1. Pubblica su GitHub Pages
2. Giocatore 1 apre il link e crea stanza
3. Giocatore 1 condivide il codice (via WhatsApp, email, etc.)
4. Giocatore 2 apre il link e inserisce il codice
5. Giocate!

## 🐛 Troubleshooting

### "Timeout connessione"
- Verifica che entrambi i browser supportino WebRTC
- Controlla la console per errori
- Prova a ricaricare la pagina

### "Impossibile connettersi"
- Il codice stanza potrebbe essere scaduto (riprova)
- Verifica che il firewall non blocchi WebRTC
- Alcuni network aziendali bloccano P2P

### "Latenza alta"
- Normale se i giocatori sono geograficamente distanti
- WebRTC usa la connessione diretta più veloce disponibile

## 📚 Risorse

- [PeerJS Documentation](https://peerjs.com/docs/)
- [WebRTC Basics](https://webrtc.org/getting-started/overview)
- [PeerJS Examples](https://github.com/peers/peerjs/tree/master/examples)

## 🎉 Vantaggi vs Backend Python

| Aspetto | PeerJS | Python Backend |
|---------|--------|----------------|
| **Setup** | Zero | Complesso |
| **Costo** | Gratis | Gratis (con limiti) |
| **Latenza** | Molto bassa | Media |
| **Scalabilità** | Illimitata | Limitata dal server |
| **Deploy** | Solo GitHub Pages | GitHub Pages + Render |
| **Manutenzione** | Nessuna | Aggiornamenti server |

## ⚠️ Limitazioni

- Richiede che entrambi i giocatori siano online contemporaneamente
- Non c'è matchmaking automatico (devi condividere il codice manualmente)
- Non c'è persistenza (se disconnetti, la partita si perde)
- Alcuni firewall aziendali potrebbero bloccare WebRTC

## 🚀 Prossimi Passi

1. Completa l'integrazione seguendo questa guida
2. Testa localmente con 2 browser
3. Pubblica su GitHub Pages
4. Testa con un amico
5. Divertiti! 🎮