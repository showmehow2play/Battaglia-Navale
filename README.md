# ⚓ Battaglia Navale - Web Game

Un gioco di Battaglia Navale completo giocabile nel browser, con modalità vs CPU.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-stable-green)

## 🎮 Caratteristiche

### Modalità di Gioco
- **🤖 vs CPU**: Gioca contro il computer con 3 livelli di difficoltà
  - **Facile**: Tiri completamente casuali
  - **Medio**: Strategia "Hunt & Target" (cerca e colpisci)
  - **Difficile**: Algoritmo probabilistico con pattern a scacchiera

### Regole Classiche
- Griglia 10x10 (A-J, 1-10)
- 5 navi: Portaerei (5), Corazzata (4), Incrociatore (3), Sottomarino (3), Cacciatorpediniere (2)
- Posizionamento orizzontale o verticale
- Nessuna sovrapposizione
- Turni alternati
- Esiti: Acqua / Colpito / Affondato
- Vittoria: Tutte le navi avversarie affondate

### Design Moderno
- ✨ Glassmorphism UI
- 🎨 Gradienti animati
- 🎬 Animazioni 3D fluide
- 📱 Completamente responsive
- ♿ Accessibile (WCAG AA)
- ⌨️ Navigazione da tastiera

## 🚀 Quick Start

1. Apri `frontend/index.html` nel browser
2. Seleziona "Gioca vs CPU"
3. Scegli la difficoltà
4. Posiziona le tue navi
5. Inizia a giocare!

**Oppure usa un server HTTP locale:**
```bash
cd frontend
python3 -m http.server 8080
```
Poi apri: **http://localhost:8080**

## 📁 Struttura del Progetto

```
Battaglia navale/
├── frontend/                    # Frontend statico
│   ├── index.html              # Pagina principale
│   ├── css/
│   │   └── style.css           # Stili completi
│   ├── js/
│   │   ├── game-engine.js      # Core logica di gioco
│   │   ├── grid.js             # Gestione griglie
│   │   ├── ship.js             # Classe navi
│   │   ├── ai.js               # AI per CPU
│   │   ├── ui.js               # Gestione UI
│   │   └── utils.js            # Utility
│   └── assets/
│       ├── sounds/             # Effetti sonori
│       └── images/             # Icone
│
├── ui-prototype.html           # Prototipo UI
├── DESIGN-MODERNO.md           # Guida design
└── README.md                   # Questo file
```

## 🛠️ Installazione

### Nessuna installazione richiesta!
Il gioco è completamente statico e funziona aprendo `frontend/index.html` nel browser.

### Server HTTP Locale (Opzionale)
Per evitare problemi CORS, puoi usare un server HTTP locale:

```bash
cd frontend
python3 -m http.server 8080
```

Poi apri: **http://localhost:8080**

## 🎯 Come Giocare

### Posizionamento Navi
1. Seleziona una nave dalla lista
2. Clicca sulla griglia per posizionarla
3. Usa il pulsante "Ruota" per cambiare orientamento
4. Ripeti per tutte le 5 navi
5. Clicca "Inizia Partita"

### Durante la Partita
- **Tuo turno**: Clicca su una cella della griglia avversaria per sparare
- **Turno avversario**: Attendi che l'avversario spari
- **Esiti**:
  - 🌊 Cerchio grigio = Acqua (mancato)
  - 🔥 X arancione = Colpito
  - 💥 Esplosione rossa = Affondato

### Vittoria
Affonda tutte le 5 navi avversarie per vincere!

## 🎨 Personalizzazione

### Temi Colore
Modifica le variabili CSS in `frontend/css/style.css`:
```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #14b8a6;
  --water-color: #0ea5e9;
  /* ... */
}
```

### Difficoltà AI
Modifica i parametri in `frontend/js/ai.js`:
```javascript
const AI_SETTINGS = {
  easy: { random: true },
  medium: { huntTarget: true },
  hard: { probability: true, checkerboard: true }
};
```

## 🌐 Deployment

### GitHub Pages
1. Crea un repository GitHub
2. Carica la cartella `frontend/`
3. Vai su Settings → Pages
4. Seleziona branch e cartella
5. Il sito sarà live su `https://username.github.io/repo-name/`

Il gioco funziona completamente lato client, quindi non serve alcun backend!

## 🧪 Testing

Apri `frontend/index.html` e testa:
- Posizionamento navi
- Modalità vs CPU (tutte le difficoltà)
- Responsive design (ridimensiona finestra)
- Accessibilità (naviga con Tab)

## 📚 Documentazione

- **[DESIGN-MODERNO.md](DESIGN-MODERNO.md)**: Guida al design UI
- **[COME_AVVIARE.md](COME_AVVIARE.md)**: Guida rapida all'avvio

## 🤝 Contribuire

Contributi benvenuti! Per favore:
1. Fai fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Roadmap

- [x] Design UI moderno
- [x] Prototipo interattivo
- [x] Game engine completo
- [x] AI a 3 livelli
- [ ] Effetti sonori
- [ ] Animazioni avanzate
- [ ] Temi personalizzabili
- [ ] Statistiche locali

## 🐛 Bug Noti

Nessuno al momento. Segnala bug aprendo una issue!

## 📄 Licenza

MIT License - vedi [LICENSE](LICENSE) per dettagli

## 👨‍💻 Autore

**Bob** - Software Engineer

## 🙏 Ringraziamenti

- Design ispirato a Glassmorphism e Material Design 3
- Font: Poppins (Google Fonts)
- Icone: Emoji native

---

**Buon divertimento! ⚓🎮**