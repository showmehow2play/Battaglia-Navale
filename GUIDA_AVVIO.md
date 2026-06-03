# 🚀 Guida Rapida - Avvio Battaglia Navale

## 📋 Prerequisiti

- Browser moderno (Chrome, Firefox, Safari, Edge)
- Server HTTP locale opzionale (per evitare problemi CORS)

---

## 🎮 Avvio Rapido - Modalità vs CPU

### Opzione 1: Apertura Diretta (Più Semplice)

1. Vai nella cartella `frontend/`
2. Fai doppio click su `index.html`
3. Il gioco si aprirà nel browser!

### Opzione 2: Python HTTP Server (Consigliato)

```bash
cd "Battaglia navale/frontend"
python3 -m http.server 8080
```

Poi apri: **http://localhost:8080**

### Opzione 3: Node.js HTTP Server

```bash
cd "Battaglia navale/frontend"
npx http-server -p 8080
```

Poi apri: **http://localhost:8080**

### Opzione 4: VS Code Live Server

1. Installa l'estensione "Live Server" in VS Code
2. Apri `frontend/index.html`
3. Click destro → "Open with Live Server"

---

## 🎯 Come Giocare

### 1. Menu Principale

Scegli la difficoltà:

- **😊 Facile**: Tiri casuali
- **😐 Medio**: Hunt & Target
- **😈 Difficile**: Mappa probabilità

### 2. Posizionamento Navi

1. Clicca su una nave nella lista a sinistra
2. Clicca sulla griglia per posizionarla
3. Usa "🔄 Ruota Nave" per cambiare orientamento
4. Oppure usa "🎲 Posizionamento Casuale"
5. Quando tutte le navi sono posizionate, clicca "▶️ Inizia Partita"

### 3. Battaglia

- **Tuo turno**: Clicca su una cella della griglia nemica per attaccare
- **Turno CPU**: Aspetta che il computer attacchi
- **Esiti**:
  - 💧 Cerchio bianco = Acqua (mancato)
  - ✕ X rossa = Colpito
  - 💥 Esplosione = Nave affondata

### 4. Vittoria

Vince chi affonda per primo tutte le navi avversarie!

---

## 🔧 Risoluzione Problemi

### Frontend non si carica

**Problema**: Pagina bianca o errori console  
**Soluzione**: 
- Verifica di usare un browser moderno
- Controlla la console del browser (F12) per errori
- Prova ad usare un server HTTP locale (Opzione 2)
- Assicurati che tutti i file JS siano nella cartella corretta

### Errori CORS

**Problema**: "CORS policy" nella console  
**Soluzione**: Usa un server HTTP locale invece di aprire direttamente il file HTML

### Il gioco è lento

**Problema**: Animazioni scattose  
**Soluzione**:
- Chiudi altre tab del browser
- Disabilita estensioni del browser
- Aggiorna il browser all'ultima versione

---

## 📱 Test su Mobile

### Opzione 1: Stesso Network

1. Trova l'IP del tuo computer:
   - Mac/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`

2. Avvia il server:
   ```bash
   python3 -m http.server 8080
   ```

3. Sul telefono, apri: `http://TUO_IP:8080`
   (es: http://192.168.1.100:8080)

### Opzione 2: ngrok (Accesso da Internet)

```bash
# Installa ngrok: https://ngrok.com/download

# Avvia il frontend
python3 -m http.server 8080

# In un altro terminale, esponi la porta
ngrok http 8080
```

Usa l'URL fornito da ngrok (es: https://abc123.ngrok.io)

---

## 🎨 Personalizzazione

### Cambiare i Colori

Modifica le variabili CSS in `frontend/css/style.css`:

```css
:root {
    --primary-color: #6366f1;      /* Colore primario */
    --secondary-color: #14b8a6;    /* Colore secondario */
    --water-color: #0ea5e9;        /* Colore acqua */
    --hit-color: #f97316;          /* Colore colpito */
    --sunk-color: #dc2626;         /* Colore affondato */
}
```

### Modificare la Difficoltà AI

Modifica i parametri in `frontend/js/ai.js`:

```javascript
// Difficoltà Hard
this.probabilityWeight = 2.0;  // Aumenta per AI più intelligente
this.checkerboardBonus = 1.5;  // Aumenta per pattern più aggressivo
```

### Cambiare il Timeout Turni

Modifica in `frontend/js/game-engine.js`:

```javascript
this.turnTimeout = 60000;  // Millisecondi (60000 = 60 secondi)
```

---

## 📊 Struttura File

```
Battaglia navale/
├── frontend/
│   ├── index.html              # Pagina principale
│   ├── css/
│   │   └── style.css           # Tutti gli stili
│   └── js/
│       ├── ship.js             # Classe Ship
│       ├── grid.js             # Classe Grid
│       ├── game-engine.js      # Motore di gioco
│       ├── utils.js            # Funzioni utility
│       ├── ai.js               # AI con 3 difficoltà
│       ├── ui.js               # UI Manager
│       └── app.js              # App principale
├── ui-prototype.html           # Prototipo UI originale
├── README.md                   # Documentazione principale
└── GUIDA_AVVIO.md             # Questa guida
```

---

## 🐛 Debug Mode

Per abilitare log dettagliati, apri la console del browser (F12) e digita:

```javascript
// Abilita log dettagliati
localStorage.setItem('debug', 'true');

// Accedi agli oggetti globali
console.log(window.app);           // App principale
console.log(window.app.game);      // Game engine
console.log(window.app.aiManager); // AI Manager
console.log(window.app.ui);        // UI Manager

// Simula una vittoria (per test)
window.app.endGame(true);

// Simula una sconfitta (per test)
window.app.endGame(false);
```

---

## 📈 Performance

### Ottimizzazioni Applicate

- ✅ CSS animations hardware-accelerated (transform/opacity)
- ✅ Event delegation per celle griglia
- ✅ Debouncing per eventi resize/scroll
- ✅ Lazy rendering delle griglie
- ✅ Algoritmi AI ottimizzati

### Metriche Attese

- **Caricamento iniziale**: < 1s
- **Rendering griglia**: < 100ms
- **Animazioni**: 60 FPS
- **Risposta AI**: < 500ms

---

## 🔐 Sicurezza

### Implementazioni di Sicurezza

- ✅ Input sanitization
- ✅ Validazione client-side
- ✅ Rate limiting (eventi UI)
- ✅ Escape HTML (prevenzione XSS)
- ✅ Nessun dato sensibile memorizzato

### Note per Produzione

Se vuoi deployare in produzione:

1. **Usa HTTPS** (GitHub Pages lo fa automaticamente)
2. **Minifica** CSS e JavaScript
3. **Comprimi** immagini e assets
4. **Abilita caching** del browser

---

## 📞 Supporto

Per problemi o domande:

1. Controlla questa guida
2. Leggi `README.md` per dettagli tecnici
3. Controlla la console del browser per errori

---

## 🎉 Buon Divertimento!

Il gioco è pronto per essere testato. La difficoltà "Difficile" è molto impegnativa - l'AI usa una mappa di probabilità sofisticata! 😈

---

**Ultimo aggiornamento**: 3 Giugno 2026  
**Versione**: 1.0 - Offline Only