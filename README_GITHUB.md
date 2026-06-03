# 🚢 Battaglia Navale - Gioco Online

Un moderno gioco di Battaglia Navale giocabile online contro il computer o altri giocatori in tempo reale.

![Battaglia Navale](https://img.shields.io/badge/Status-Ready-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Caratteristiche

### Modalità di Gioco
- **🤖 Vs Computer**: 3 livelli di difficoltà (Facile, Medio, Difficile)
- **🌐 Online 1v1**: Partita rapida o stanza privata con codice
- **💬 Chat**: Messaggi in tempo reale durante le partite online

### Funzionalità
- ✅ Regole classiche della Battaglia Navale
- ✅ Griglia 10x10 con 5 navi
- ✅ AI sofisticata con mappa di probabilità
- ✅ Design moderno glassmorphism
- ✅ Animazioni 3D fluide
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Accessibile (tastiera + screen reader)
- ✅ Server autoritativo anti-cheat

## 🚀 Avvio Rapido

### Requisiti
- Python 3.8+
- Browser moderno (Chrome, Firefox, Safari, Edge)

### Installazione

```bash
# Clona il repository
git clone https://github.com/TUOUSERNAME/battaglia-navale.git
cd battaglia-navale

# Installa dipendenze backend
cd backend
pip install -r requirements.txt
cd ..
```

### Avvio

#### Modalità Offline (vs CPU)
```bash
# Mac/Linux
./avvia-gioco.sh

# Windows
avvia-gioco.bat
```

Apri: http://localhost:8081

#### Modalità Online (Multiplayer)
```bash
# Mac/Linux
./avvia-tutto.sh

# Windows
avvia-tutto.bat
```

Apri **2 finestre** su: http://localhost:8081

## 📁 Struttura Progetto

```
battaglia-navale/
├── frontend/           # Frontend statico (HTML/CSS/JS)
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── ship.js
│       ├── grid.js
│       ├── game-engine.js
│       ├── ai.js
│       ├── ui.js
│       ├── app.js
│       └── utils.js
├── backend/            # Backend WebSocket (Python/FastAPI)
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
├── avvia-gioco.sh      # Script avvio frontend
├── avvia-server.sh     # Script avvio backend
├── avvia-tutto.sh      # Script avvio completo
└── docs/               # Documentazione
```

## 🌐 Deployment

### Frontend → GitHub Pages
1. Abilita GitHub Pages nelle impostazioni del repository
2. Seleziona branch `main` e cartella `/frontend`
3. Il gioco sarà disponibile su: `https://TUOUSERNAME.github.io/battaglia-navale/`

### Backend → Render.com / Railway.app
1. Crea account su [Render](https://render.com) o [Railway](https://railway.app)
2. Collega il repository GitHub
3. Configura:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`

Guida completa: [GUIDA_DEPLOYMENT.md](GUIDA_DEPLOYMENT.md)

## 🎯 Come Giocare

### Vs Computer
1. Scegli difficoltà (Facile/Medio/Difficile)
2. Posiziona le tue 5 navi sulla griglia
3. Attacca la griglia nemica a turno
4. Vince chi affonda per primo tutte le navi avversarie!

### Online
1. **Partita Rapida**: Matchmaking automatico
2. **Stanza Privata**: Crea/unisciti con codice a 6 caratteri
3. Posiziona le navi
4. Gioca a turno (60 secondi per mossa)
5. Usa la chat per comunicare!

## 🛠️ Tecnologie

### Frontend
- HTML5/CSS3
- Vanilla JavaScript (ES6+)
- LocalStorage per persistenza
- WebSocket API per multiplayer

### Backend
- Python 3.8+
- FastAPI (framework web)
- Uvicorn (server ASGI)
- WebSockets per real-time

### Design
- Glassmorphism UI
- CSS Grid/Flexbox
- CSS Animations (hardware-accelerated)
- ARIA per accessibilità

## 📚 Documentazione

- [COME_AVVIARE.md](COME_AVVIARE.md) - Guida avvio rapido
- [GUIDA_DEPLOYMENT.md](GUIDA_DEPLOYMENT.md) - Deploy su internet
- [TEST_RAPIDO.md](TEST_RAPIDO.md) - Checklist test
- [backend/README.md](backend/README.md) - API WebSocket

## 🤝 Contribuire

Contributi benvenuti! Per favore:
1. Fai fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 License

Questo progetto è rilasciato sotto licenza MIT. Vedi [LICENSE](LICENSE) per dettagli.

## 👨‍💻 Autore

Creato con ❤️ da [Il Tuo Nome]

## 🙏 Ringraziamenti

- Design ispirato ai moderni giochi web
- AI basata su algoritmi di probabilità
- Community FastAPI per il framework backend

## 📞 Supporto

- 🐛 Bug? Apri una [Issue](https://github.com/TUOUSERNAME/battaglia-navale/issues)
- 💡 Suggerimenti? Apri una [Discussion](https://github.com/TUOUSERNAME/battaglia-navale/discussions)
- 📧 Email: tuaemail@example.com

---

**Buon divertimento! 🎮🚢⚓**
