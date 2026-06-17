# 🎥 Modalità Webcam Easter Egg - Documentazione

## Panoramica

La **modalità Face-to-Face** è una funzionalità segreta del gioco Battaglia Navale che permette ai giocatori di vedersi tramite webcam durante le partite online. Questa modalità è nascosta e può essere sbloccata solo tramite un Easter Egg.

## 🔓 Come Sbloccare

### Metodo: Messaggio Segreto nella Chat

1. **Avvia una partita online** con chat abilitata
2. **Durante la partita**, scrivi nella chat: `guardami`
3. Se la webcam è supportata, apparirà un pannello video laterale
4. La modalità si attiva immediatamente per quella partita
5. Il messaggio "guardami" NON viene inviato all'avversario (resta segreto!)

### Requisiti Tecnici

Per sbloccare e utilizzare la modalità webcam sono necessari:

- ✅ **Browser moderno** con supporto WebRTC
- ✅ **Connessione HTTPS** (o localhost per test)
- ✅ **Webcam funzionante** collegata al dispositivo
- ✅ **Permessi webcam** concessi dal browser

## 🎮 Come Usare

### Attivare la Webcam Durante una Partita

1. **Avvia una partita online normale**:
   - Clicca su "⚡ Crea Partita Live" o "🔑 Entra con Codice"
   - **IMPORTANTE**: Assicurati che la chat sia abilitata ✅
   - Condividi/inserisci il codice stanza
   - Posiziona le tue navi

2. **Durante la partita**, scrivi nella chat: `guardami`
   - Il messaggio NON verrà inviato all'avversario
   - È un comando segreto!

3. **Apparirà**:
   - Effetto confetti celebrativo 🎉
   - Toast di conferma "Modalità Face-to-Face sbloccata!"
   - Pannello webcam laterale

4. **Attiva la webcam**:
   - Clicca su "Attiva Webcam" nel pannello
   - Concedi i permessi quando richiesto
   - Il tuo video apparirà nel riquadro "Tu"

5. **L'avversario vedrà**:
   - Notifica che hai attivato la webcam
   - Può attivare anche la sua webcam scrivendo "guardami"
   - Il suo video apparirà nel riquadro "Avversario"

## 📹 Funzionalità Video

### Pannello Webcam

Durante la partita, vedrai un pannello sulla destra con:

- **Video locale**: La tua webcam (con etichetta "Tu")
- **Video remoto**: La webcam dell'avversario (con etichetta "Avversario")
- **Pulsante toggle**: Per attivare/disattivare la webcam
- **Indicatori di stato**: Pallini colorati che mostrano lo stato della connessione

### Controlli

- **Attiva/Disattiva Webcam**: Usa il pulsante nel pannello
- **Video sempre visibile**: I video restano visibili durante tutta la partita
- **Solo video**: L'audio è disabilitato per privacy

### Indicatori di Stato

- 🟢 **Verde**: Webcam attiva e connessa
- 🔴 **Rosso**: Webcam disattivata o disconnessa

## 🔒 Privacy e Sicurezza

### Cosa Viene Trasmesso

- ✅ **Solo video** (no audio)
- ✅ **Connessione peer-to-peer** diretta (nessun server intermedio)
- ✅ **Nessuna registrazione** dei video
- ✅ **Controllo completo** dell'utente

### Permessi

- Il browser chiederà esplicitamente il permesso per accedere alla webcam
- Puoi revocare i permessi in qualsiasi momento dalle impostazioni del browser
- Puoi disattivare la webcam durante la partita senza disconnetterti

### Best Practices

1. **Usa solo con persone fidate**: È una modalità per giocare con amici
2. **Controlla l'ambiente**: Assicurati che non ci siano informazioni sensibili visibili
3. **Buona illuminazione**: Per una migliore qualità video
4. **Connessione stabile**: Richiede una buona larghezza di banda

## 🛠️ Architettura Tecnica

### Componenti

1. **WebcamManager** (`webcam-manager.js`)
   - Gestisce l'accesso alla webcam
   - Controlla i permessi
   - Gestisce lo stream video locale

2. **PeerMultiplayer** (esteso in `peer-multiplayer.js`)
   - Gestisce le chiamate video P2P
   - Trasmette lo stream video
   - Riceve lo stream remoto

3. **Easter Egg Detector** (in `app.js`)
   - Rileva la sequenza "WEBCAM"
   - Verifica il supporto hardware
   - Sblocca la modalità

### Flusso di Connessione

```
1. Utente digita "WEBCAM"
   ↓
2. Verifica supporto webcam
   ↓
3. Mostra card Face-to-Face
   ↓
4. Utente crea/entra in partita
   ↓
5. Richiesta permessi webcam
   ↓
6. Connessione P2P stabilita
   ↓
7. Avvio chiamata video
   ↓
8. Stream video bidirezionale attivo
```

### Tecnologie Utilizzate

- **WebRTC**: Per streaming video P2P
- **PeerJS**: Libreria per semplificare WebRTC
- **getUserMedia API**: Per accesso alla webcam
- **MediaStream API**: Per gestione stream video

## 🐛 Risoluzione Problemi

### La modalità non si sblocca

**Problema**: Digito "WEBCAM" ma non succede nulla

**Soluzioni**:
- Assicurati di essere nel menu principale
- Verifica di avere una webcam collegata
- Controlla che il sito sia servito su HTTPS
- Prova a ricaricare la pagina

### Webcam non funziona

**Problema**: La webcam non si attiva

**Soluzioni**:
- Controlla i permessi del browser
- Verifica che nessun'altra app stia usando la webcam
- Riavvia il browser
- Controlla le impostazioni di privacy del sistema operativo

### Video dell'avversario non visibile

**Problema**: Vedo la mia webcam ma non quella dell'avversario

**Soluzioni**:
- Attendi qualche secondo per la connessione
- Verifica che l'avversario abbia attivato la webcam
- Controlla la connessione internet
- Prova a ricaricare entrambi

### Qualità video scarsa

**Problema**: Il video è pixelato o a scatti

**Soluzioni**:
- Migliora l'illuminazione
- Chiudi altre applicazioni che usano banda
- Avvicinati al router WiFi
- Usa una connessione cablata se possibile

## 📱 Compatibilità

### Browser Supportati

- ✅ Chrome/Edge (v80+)
- ✅ Firefox (v75+)
- ✅ Safari (v14+)
- ✅ Opera (v67+)

### Dispositivi

- ✅ **Desktop**: Windows, macOS, Linux
- ✅ **Mobile**: Android, iOS (Safari)
- ⚠️ **Tablet**: Supporto variabile

### Limitazioni Note

- Safari iOS richiede iOS 14.3+
- Alcuni browser mobile potrebbero avere limitazioni
- La qualità dipende dalla connessione internet

## 🎨 Personalizzazione

### Modificare la Sequenza Easter Egg

In `app.js`, modifica:

```javascript
this.easterEggTarget = 'WEBCAM'; // Cambia con la tua sequenza
```

### Modificare la Qualità Video

In `webcam-manager.js`, modifica:

```javascript
video: {
    width: { ideal: 640 },  // Aumenta per qualità migliore
    height: { ideal: 480 }, // Aumenta per qualità migliore
    facingMode: 'user'
}
```

### Personalizzare lo Stile

Modifica le classi CSS in `style.css`:

- `.menu-card-secret`: Stile della card
- `.video-container`: Contenitore video
- `.webcam-panel`: Pannello laterale

## 📊 Statistiche e Metriche

### Utilizzo Banda

- **Video 640x480**: ~500 Kbps
- **Overhead P2P**: ~100 Kbps
- **Totale stimato**: ~600 Kbps per direzione

### Performance

- **Latenza video**: 100-300ms tipica
- **Frame rate**: 15-30 FPS
- **Risoluzione**: 640x480 (configurabile)

## 🔮 Sviluppi Futuri

Possibili miglioramenti:

- [ ] Supporto audio opzionale
- [ ] Filtri e effetti video
- [ ] Registrazione replay
- [ ] Modalità picture-in-picture
- [ ] Supporto per più di 2 giocatori
- [ ] Condivisione schermo

## 📝 Note per Sviluppatori

### File Modificati

1. `frontend/js/webcam-manager.js` (nuovo)
2. `frontend/js/peer-multiplayer.js` (esteso)
3. `frontend/js/app.js` (Easter Egg aggiunto)
4. `frontend/css/style.css` (nuovi stili)
5. `frontend/index.html` (UI video aggiunta)

### Testing

Per testare in locale:

```bash
# Usa un server HTTPS locale o
python3 -m http.server 8000
# Poi accedi a http://localhost:8000
```

### Debug

Abilita i log della console per vedere:
- Stato connessione PeerJS
- Eventi webcam
- Stream video

## 📄 Licenza

Questa funzionalità è parte del progetto Battaglia Navale ed è soggetta alla stessa licenza del progetto principale.

---

**Creato con ❤️ usando Bob AI Assistant**

**Versione**: 2.0 (Face-to-Face Mode)
**Data**: Giugno 2026