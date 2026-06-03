# ✅ Verifica Multiplayer Online - Battaglia Navale

## 🎯 Situazione Attuale

Il tuo gioco **FUNZIONA GIÀ ONLINE** su GitHub Pages! 🎉

La modalità multiplayer utilizza **PeerJS** (peer-to-peer), che permette a due giocatori di connettersi direttamente tra loro **senza bisogno di un server backend**.

---

## 🔍 Come Verificare che Funziona

### Test 1: Verifica che il Gioco sia Online
1. Apri il tuo gioco su GitHub Pages: `https://TUOUSERNAME.github.io/battaglia-navale/`
2. Dovresti vedere il menu principale con le opzioni:
   - 🤖 Gioca vs Computer
   - 🌐 Gioca Online in 2

### Test 2: Verifica PeerJS
1. Apri la **Console del Browser** (F12 → Console)
2. Clicca su "⚡ Crea Partita Live"
3. Nella console dovresti vedere:
   ```
   🚢 Battaglia Navale - Inizializzazione...
   ✓ Applicazione inizializzata
   🌐 Inizializzazione PeerJS...
   ✓ PeerJS inizializzato. Peer ID: abc123xyz...
   ```
4. Se vedi questi messaggi, **PeerJS funziona!**

### Test 3: Test Completo con 2 Dispositivi
1. **Dispositivo 1** (es. PC):
   - Apri il gioco
   - Clicca "⚡ Crea Partita Live"
   - Copia il **codice stanza** che appare (es. `abc123xyz`)
   
2. **Dispositivo 2** (es. Smartphone):
   - Apri lo stesso link del gioco
   - Clicca "🔑 Entra con Codice"
   - Incolla il codice stanza
   - Clicca "Entra"

3. **Risultato Atteso**:
   - Entrambi i dispositivi si connettono
   - Entrambi posizionano le navi
   - La partita inizia!

---

## ❓ Perché Potrebbe Sembrare che Non Funzioni

### Problema 1: PeerJS non Caricato
**Sintomo**: Cliccando "Crea Partita Live" non succede nulla

**Soluzione**: Verifica che PeerJS sia caricato correttamente:
```html
<!-- In index.html, riga 346 -->
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
```

**Test**: Apri Console (F12) e scrivi:
```javascript
typeof Peer
```
Dovrebbe rispondere: `"function"` (non `"undefined"`)

### Problema 2: Firewall o Rete Restrittiva
**Sintomo**: Il codice stanza viene generato ma l'altro giocatore non riesce a connettersi

**Causa**: Alcune reti aziendali/scolastiche bloccano le connessioni P2P

**Soluzione**: 
- Usa una rete domestica o mobile
- Verifica che entrambi i giocatori siano su reti che permettono P2P

### Problema 3: Browser non Supportato
**Sintomo**: Errori nella console

**Soluzione**: Usa browser moderni:
- ✅ Chrome/Edge (consigliato)
- ✅ Firefox
- ✅ Safari (iOS/macOS)
- ❌ Internet Explorer (non supportato)

---

## 🛠️ Troubleshooting Avanzato

### Verifica 1: Console del Browser
Apri la Console (F12) e cerca errori:

**Errore Comune 1**:
```
Uncaught ReferenceError: Peer is not defined
```
**Soluzione**: PeerJS non è caricato. Verifica la connessione internet e ricarica la pagina.

**Errore Comune 2**:
```
PeerJS: Error - Could not connect to peer
```
**Soluzione**: Il codice stanza è errato o l'host ha chiuso la connessione.

### Verifica 2: Network Tab
1. Apri DevTools (F12) → Network
2. Ricarica la pagina
3. Cerca `peerjs.min.js`
4. Dovrebbe essere caricato con status `200 OK`

### Verifica 3: Test Locale
Se vuoi testare in locale (senza GitHub Pages):

```bash
cd "Battaglia navale/frontend"
python3 -m http.server 8080
```

Poi apri:
- **Tab 1**: http://localhost:8080 (Giocatore 1)
- **Tab 2**: http://localhost:8080 (Giocatore 2)

---

## 📋 Checklist Deployment GitHub Pages

- [ ] Repository pubblico su GitHub
- [ ] GitHub Pages abilitato (Settings → Pages)
- [ ] Source: `main` branch, cartella `/frontend`
- [ ] Sito accessibile: `https://TUOUSERNAME.github.io/battaglia-navale/`
- [ ] File `index.html` caricato correttamente
- [ ] PeerJS caricato da CDN (verifica in Console)
- [ ] Modalità "Gioca Online in 2" visibile nel menu

---

## 🎮 Come Giocare Online (Guida Rapida)

### Metodo 1: Crea Partita Live
1. **Tu**: Clicca "⚡ Crea Partita Live"
2. **Tu**: Copia il codice stanza (es. `abc123xyz`)
3. **Tu**: Condividi il codice con l'amico (WhatsApp, SMS, ecc.)
4. **Amico**: Apre il gioco
5. **Amico**: Clicca "🔑 Entra con Codice"
6. **Amico**: Incolla il codice e clicca "Entra"
7. **Entrambi**: Posizionate le navi
8. **Partita inizia!** 🎉

### Metodo 2: Entrambi Cliccano "Crea Partita Live"
⚠️ **NON FUNZIONA**: Ogni giocatore crea una stanza diversa!

**Corretto**: Solo UNO crea, l'altro entra con il codice.

---

## 🌐 Link da Condividere

Quando il gioco è su GitHub Pages, condividi questo link:

```
🎮 Gioca a Battaglia Navale Online!
https://TUOUSERNAME.github.io/battaglia-navale/

Per giocare insieme:
1. Io clicco "Crea Partita Live"
2. Ti mando il codice stanza
3. Tu clicchi "Entra con Codice" e inserisci il codice
4. Giochiamo! ⚓🚢
```

---

## 💡 Vantaggi del Sistema P2P (PeerJS)

✅ **Nessun server backend necessario** → Gratis!
✅ **Connessione diretta** → Bassa latenza
✅ **Privacy** → I dati non passano per server esterni
✅ **Facile da deployare** → Solo file statici su GitHub Pages

❌ **Limitazione**: Entrambi i giocatori devono essere online contemporaneamente

---

## 🔧 Se Proprio Non Funziona

### Opzione 1: Verifica il Codice
Controlla che `frontend/index.html` contenga:

```html
<!-- Riga 346 -->
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
<script src="js/peer-multiplayer.js"></script>
<script src="js/app.js"></script>
```

### Opzione 2: Testa in Locale
```bash
cd "Battaglia navale/frontend"
python3 -m http.server 8080
```

Apri 2 tab del browser:
- Tab 1: http://localhost:8080
- Tab 2: http://localhost:8080

Prova a creare una partita in Tab 1 e entrare in Tab 2.

### Opzione 3: Controlla i File
Verifica che questi file esistano:
```
frontend/
├── index.html
├── js/
│   ├── app.js
│   ├── peer-multiplayer.js
│   ├── game-engine.js
│   ├── ui.js
│   └── ...
└── css/
    └── style.css
```

---

## 📞 Supporto

Se dopo tutti questi test il multiplayer non funziona:

1. **Apri la Console** (F12) e copia tutti gli errori
2. **Verifica la Network Tab** per vedere se PeerJS viene caricato
3. **Prova con un altro browser** (Chrome consigliato)
4. **Prova con un'altra rete** (es. hotspot mobile)

---

## ✅ Conclusione

Il tuo gioco **DOVREBBE GIÀ FUNZIONARE** su GitHub Pages con multiplayer online!

Se non funziona, il problema è probabilmente:
- PeerJS non caricato (verifica CDN)
- Firewall/rete restrittiva
- Browser non supportato

**Test Rapido**: Apri la Console e scrivi `typeof Peer`. Se risponde `"function"`, PeerJS funziona! 🎉

---

**Ultimo aggiornamento**: 3 Giugno 2026  
**Versione**: 1.0 - Guida Verifica Multiplayer Online