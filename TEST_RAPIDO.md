# ✅ Checklist Test Rapido

## 🎯 Test Modalità Offline (vs CPU)

### Test 1: Avvio e Menu
- [ ] Apri `frontend/index.html` con un server HTTP
- [ ] Verifica che il menu principale si carichi correttamente
- [ ] Controlla che tutti i pulsanti siano visibili e stilizzati
- [ ] Clicca su "📖 Regole del Gioco" - devono apparire le regole

### Test 2: Setup Navi - Manuale
- [ ] Clicca su "😊 Facile" (modalità CPU facile)
- [ ] Verifica che appaia lo schermo di setup
- [ ] Clicca su una nave nella lista a sinistra
- [ ] Clicca su una cella della griglia - la nave deve apparire
- [ ] Prova a posizionare una nave in posizione non valida (fuori griglia o sovrapposta)
- [ ] Verifica che appaia un messaggio di errore
- [ ] Clicca su "🔄 Ruota Nave" e verifica che l'orientamento cambi
- [ ] Posiziona tutte e 5 le navi
- [ ] Verifica che il pulsante "▶️ Inizia Partita" si abiliti

### Test 3: Setup Navi - Casuale
- [ ] Clicca su "← Indietro" per tornare al menu
- [ ] Clicca di nuovo su "😊 Facile"
- [ ] Clicca su "🎲 Posizionamento Casuale"
- [ ] Verifica che tutte le navi vengano posizionate automaticamente
- [ ] Il pulsante "▶️ Inizia Partita" deve essere abilitato

### Test 4: Gameplay - Facile
- [ ] Clicca su "▶️ Inizia Partita"
- [ ] Verifica che appaiano due griglie (mia e nemica)
- [ ] La griglia "La Mia Flotta" deve mostrare le tue navi
- [ ] La griglia "Griglia Nemica" deve essere vuota (solo acqua)
- [ ] Verifica che l'indicatore "🎯 Tuo Turno" sia attivo
- [ ] Clicca su una cella della griglia nemica
- [ ] Verifica che appaia un'animazione (acqua 💧 o colpito ✕)
- [ ] Verifica che le statistiche si aggiornino (Colpi, Colpiti, Mancati, Precisione)
- [ ] Aspetta il turno della CPU
- [ ] Verifica che la CPU attacchi la tua griglia
- [ ] Continua a giocare fino alla fine
- [ ] Verifica che appaia il modal "Game Over" con le statistiche finali

### Test 5: Gameplay - Medio
- [ ] Torna al menu e avvia una partita con difficoltà "😐 Medio"
- [ ] Posiziona le navi (manualmente o casualmente)
- [ ] Gioca alcuni turni
- [ ] Verifica che la CPU usi la strategia "Hunt & Target":
  - Dopo un colpo a segno, deve attaccare celle adiacenti
  - Deve seguire la direzione della nave colpita

### Test 6: Gameplay - Difficile
- [ ] Torna al menu e avvia una partita con difficoltà "😈 Difficile"
- [ ] Posiziona le navi
- [ ] Gioca alcuni turni
- [ ] Verifica che la CPU sia più intelligente:
  - Deve preferire celle con alta probabilità
  - Deve usare pattern a scacchiera
  - Deve essere più difficile da battere

### Test 7: UI e Animazioni
- [ ] Verifica che le animazioni siano fluide:
  - Animazione "miss" (cerchio bianco con fade-in)
  - Animazione "hit" (X rossa con rotazione)
  - Animazione "sunk" (esplosione 💥 con scale)
- [ ] Verifica che l'ultima mossa sia evidenziata con glow
- [ ] Verifica che le navi affondate nella lista abbiano l'icona 💥
- [ ] Verifica che il pulsante "🏳️ Arrenditi" funzioni

### Test 8: Responsive Design
- [ ] Ridimensiona la finestra del browser
- [ ] Verifica che il layout si adatti a:
  - Desktop (> 1024px): layout completo
  - Tablet (640-1024px): griglie ridotte
  - Mobile (< 640px): layout verticale
- [ ] Apri DevTools (F12) e testa con:
  - iPhone SE (375x667)
  - iPad (768x1024)
  - Desktop (1920x1080)

### Test 9: Accessibilità
- [ ] Prova a navigare con la tastiera (Tab)
- [ ] Verifica che tutte le celle siano raggiungibili
- [ ] Premi Enter/Spazio su una cella per attaccare
- [ ] Verifica che i focus indicators siano visibili
- [ ] Apri un screen reader (NVDA/JAWS) e verifica che:
  - Le celle abbiano label corrette (es: "Cella A1")
  - Gli stati siano annunciati (colpita, mancata)

---

## 🌐 Test Modalità Online (Multiplayer)

### Prerequisiti
- [ ] Backend avviato: `cd backend && python main.py`
- [ ] Frontend avviato: `cd frontend && python3 -m http.server 8080`

### Test 10: Connessione Server
- [ ] Apri http://localhost:8080
- [ ] Clicca su "⚡ Partita Rapida"
- [ ] Verifica che appaia "Connesso! In attesa di avversario..."
- [ ] Apri una seconda finestra/tab del browser
- [ ] Clicca di nuovo su "⚡ Partita Rapida"
- [ ] Verifica che entrambe le finestre mostrino "Match trovato!"

### Test 11: Setup Multiplayer
- [ ] In entrambe le finestre, posiziona le navi
- [ ] Clicca su "▶️ Inizia Partita" in entrambe
- [ ] Verifica che il gioco inizi quando entrambi sono pronti

### Test 12: Gameplay Multiplayer
- [ ] Verifica che solo un giocatore alla volta possa attaccare
- [ ] Attacca nella finestra del giocatore 1
- [ ] Verifica che l'attacco appaia nella griglia del giocatore 2
- [ ] Verifica che il turno passi al giocatore 2
- [ ] Continua alternando i turni
- [ ] Verifica che il timer (60s) funzioni
- [ ] Verifica che il game over funzioni per entrambi

### Test 13: Chat
- [ ] Verifica che il pannello chat sia visibile (solo online)
- [ ] Scrivi un messaggio nella finestra 1
- [ ] Verifica che appaia nella finestra 2
- [ ] Scrivi un messaggio nella finestra 2
- [ ] Verifica che appaia nella finestra 1
- [ ] Verifica che i messaggi siano sanitizzati (prova con `<script>alert('test')</script>`)

### Test 14: Stanza Privata
- [ ] Torna al menu in entrambe le finestre
- [ ] Nella finestra 1, clicca su "🔒 Stanza Privata"
- [ ] Lascia vuoto il campo e clicca "Continua"
- [ ] Verifica che appaia un codice a 6 caratteri (es: "ABC123")
- [ ] Nella finestra 2, clicca su "🔒 Stanza Privata"
- [ ] Inserisci il codice della finestra 1
- [ ] Clicca "Continua"
- [ ] Verifica che le due finestre si connettano

### Test 15: Disconnessione
- [ ] Durante una partita online, chiudi una delle due finestre
- [ ] Verifica che l'altra finestra mostri "Avversario disconnesso"
- [ ] Verifica che il gioco gestisca correttamente la disconnessione

### Test 16: Riconnessione
- [ ] Avvia una partita online
- [ ] Chiudi e riapri una finestra durante il setup
- [ ] Verifica che possa riconnettersi (se implementato)

---

## 🐛 Test Edge Cases

### Test 17: Validazioni
- [ ] Prova a cliccare su una cella già attaccata
- [ ] Verifica che appaia "Cella già attaccata!"
- [ ] Prova ad attaccare quando non è il tuo turno
- [ ] Verifica che appaia "Non è il tuo turno!"
- [ ] Prova a posizionare una nave fuori dalla griglia
- [ ] Verifica che venga rifiutato

### Test 18: Performance
- [ ] Apri DevTools → Performance
- [ ] Registra una sessione di gioco
- [ ] Verifica che le animazioni siano a 60 FPS
- [ ] Verifica che non ci siano memory leak
- [ ] Controlla che il rendering sia < 100ms

### Test 19: Browser Compatibility
- [ ] Testa su Chrome
- [ ] Testa su Firefox
- [ ] Testa su Safari (Mac)
- [ ] Testa su Edge
- [ ] Verifica che tutto funzioni su tutti i browser

### Test 20: Mobile Real Device
- [ ] Trova l'IP del tuo computer
- [ ] Avvia il server: `python3 -m http.server 8080`
- [ ] Sul telefono, apri `http://TUO_IP:8080`
- [ ] Testa il gameplay su mobile
- [ ] Verifica che i touch events funzionino
- [ ] Verifica che il layout responsive sia corretto

---

## 📊 Risultati Attesi

### Performance
- ✅ Caricamento iniziale: < 1s
- ✅ Rendering griglia: < 100ms
- ✅ Animazioni: 60 FPS
- ✅ Latenza WebSocket: < 50ms (LAN)

### Funzionalità
- ✅ Tutte le regole del gioco implementate
- ✅ 3 livelli di difficoltà AI funzionanti
- ✅ Multiplayer online stabile
- ✅ Chat funzionante
- ✅ Stanze private funzionanti

### UI/UX
- ✅ Design moderno e attraente
- ✅ Animazioni fluide
- ✅ Responsive su tutti i dispositivi
- ✅ Accessibile (tastiera + screen reader)

---

## 🚨 Bug Comuni e Soluzioni

### Bug: Griglia non si renderizza
**Causa**: Server HTTP non avviato  
**Soluzione**: Usa `python3 -m http.server 8080`

### Bug: WebSocket non si connette
**Causa**: Backend non avviato o URL errato  
**Soluzione**: 
1. Avvia backend: `cd backend && python main.py`
2. Verifica URL in `app.js`: `ws://localhost:8000/ws`

### Bug: Animazioni scattose
**Causa**: Browser vecchio o troppi tab aperti  
**Soluzione**: Chiudi altri tab, usa browser moderno

### Bug: Layout rotto su mobile
**Causa**: Viewport meta tag mancante  
**Soluzione**: Verifica che `index.html` abbia:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## ✅ Checklist Finale

Prima di considerare il progetto completo:

- [ ] Tutti i test offline passano
- [ ] Tutti i test online passano
- [ ] Tutti i test edge cases passano
- [ ] Performance ottimale su tutti i browser
- [ ] Responsive su mobile/tablet/desktop
- [ ] Accessibilità WCAG AA
- [ ] Documentazione completa
- [ ] Codice pulito e commentato
- [ ] Nessun errore in console
- [ ] Nessun warning in console

---

## 🎉 Congratulazioni!

Se tutti i test passano, il gioco è pronto per essere pubblicato! 🚀

**Prossimi passi**:
1. Deploy frontend su GitHub Pages
2. Deploy backend su Heroku/Railway/Render
3. Configura dominio personalizzato (opzionale)
4. Condividi con amici e raccogli feedback!

---

**Tempo stimato per tutti i test**: 2-3 ore  
**Ultimo aggiornamento**: 31 Maggio 2026