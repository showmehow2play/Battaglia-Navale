# ⚓ Battaglia Navale

Un gioco della Battaglia Navale moderno e interattivo con supporto per modalità single-player contro AI e multiplayer online peer-to-peer.

## 🎮 Caratteristiche

### Modalità di Gioco
- **VS Computer**: Sfida l'intelligenza artificiale con 3 livelli di difficoltà (Facile, Medio, Difficile)
- **Multiplayer Online**: Gioca contro un amico in tempo reale tramite connessione peer-to-peer
- **Chat Opzionale**: Comunica con l'avversario durante le partite online

### Posizionamento Navi
- **Modalità Rapida**: Posiziona le navi con un singolo click
- **Modalità Manuale**: Seleziona manualmente ogni cella della nave
- **Posizionamento Casuale**: Lascia che il computer posizioni le navi automaticamente
- **Regola Celle Attigue**: Le navi non possono essere posizionate in celle adiacenti

### Funzionalità Speciali
- **Slot Machine**: Quando affondi una nave nemica, gioca alla slot machine per un premio speciale!
- **Statistiche in Tempo Reale**: Monitora colpi, precisione e stato delle flotte
- **Interfaccia Moderna**: Design glassmorphism con animazioni fluide
- **Responsive**: Ottimizzato per desktop e dispositivi mobili

## 🚀 Come Iniziare

### Requisiti
- Browser moderno (Chrome, Firefox, Safari, Edge)
- Connessione internet (solo per modalità multiplayer)

### Avvio Locale
1. Apri il file `index.html` nel tuo browser
2. Scegli la modalità di gioco
3. Posiziona le tue navi
4. Inizia a giocare!

### Modalità Multiplayer
1. **Creare una Partita**:
   - Clicca su "Crea Partita Live"
   - Condividi il codice stanza con un amico
   - Attendi che l'altro giocatore si connetta

2. **Entrare in una Partita**:
   - Clicca su "Entra con Codice"
   - Inserisci il codice ricevuto dall'host
   - Connettiti e inizia a giocare

## 📁 Struttura del Progetto

```
Battaglia navale/
├── index.html              # Pagina principale (root)
├── README.md               # Documentazione
├── .gitignore
├── docs/                   # Documentazione aggiuntiva
└── frontend/
    ├── css/
    │   └── style.css       # Stili dell'applicazione
    ├── js/
    │   ├── app.js          # Applicazione principale
    │   ├── game-engine.js  # Logica di gioco
    │   ├── ui.js           # Gestione interfaccia
    │   ├── grid.js         # Gestione griglia
    │   ├── ship.js         # Gestione navi
    │   ├── ai.js           # Intelligenza artificiale
    │   ├── peer-multiplayer.js  # Multiplayer P2P
    │   ├── placement-modes.js   # Modalità posizionamento
    │   ├── slot-machine.js      # Slot machine
    │   ├── utils.js        # Funzioni utility
    │   └── peerjs.min.js   # Libreria PeerJS
    └── assets/
        ├── images/         # Immagini del gioco
        └── sounds/         # Effetti sonori
```

## 🎯 Regole del Gioco

### Obiettivo
Affonda tutte le navi avversarie prima che affondi le tue.

### Flotta
- **Portaerei** (5 celle) 🚢
- **Corazzata** (4 celle) ⚓
- **Incrociatore** (3 celle) 🛳️
- **Sottomarino** (3 celle) 🚤
- **Cacciatorpediniere** (2 celle) ⛵

### Setup
1. Posiziona le tue 5 navi sulla griglia 10x10
2. Le navi possono essere orizzontali o verticali
3. Le navi non possono sovrapporsi
4. Le navi non possono essere in celle attigue (incluse diagonali)

### Gameplay
1. A turno, scegli una cella nella griglia avversaria
2. **💧 Acqua**: Colpo mancato
3. **✕ Colpito**: Hai colpito una nave
4. **💥 Affondato**: Hai affondato una nave completa
5. Quando affondi una nave, gioca alla slot machine!

### Vittoria
Vince chi affonda per primo tutte le navi avversarie.

## 🤖 Livelli AI

### Facile 😊
- Spara casualmente sulla griglia
- Ideale per principianti

### Medio 😐
- Usa strategia Hunt & Target
- Dopo un colpo, cerca nelle celle adiacenti
- Buon equilibrio tra sfida e divertimento

### Difficile 😈
- Usa mappa di probabilità avanzata
- Pattern a scacchiera per massimizzare efficienza
- Identifica direzione delle navi dopo 2 colpi
- Sfida anche per giocatori esperti

## 🛠️ Tecnologie Utilizzate

- **HTML5**: Struttura dell'applicazione
- **CSS3**: Stili moderni con glassmorphism e animazioni
- **JavaScript (ES6+)**: Logica di gioco e interazioni
- **PeerJS**: Connessioni peer-to-peer per multiplayer
- **LocalStorage**: Salvataggio preferenze

## 🎨 Design

Il gioco utilizza un design moderno con:
- **Glassmorphism**: Effetti vetro sfumato
- **Gradient Animati**: Sfondo dinamico
- **Animazioni Fluide**: Transizioni smooth
- **Responsive Design**: Adattamento a tutti i dispositivi
- **Accessibilità**: Supporto screen reader e navigazione da tastiera

## 📝 Note di Sviluppo

### Architettura
Il progetto segue un'architettura modulare con separazione delle responsabilità:
- **app.js**: Orchestrazione generale
- **game-engine.js**: Logica di gioco core
- **ui.js**: Rendering e interazioni UI
- **grid.js**: Gestione stato griglia
- **ship.js**: Gestione stato navi
- **ai.js**: Intelligenza artificiale
- **peer-multiplayer.js**: Networking P2P

### Estensibilità
Il codice è progettato per essere facilmente estendibile:
- Aggiungi nuove modalità di gioco
- Implementa nuovi livelli AI
- Personalizza l'interfaccia
- Aggiungi power-up e bonus

## 🐛 Risoluzione Problemi

### La connessione multiplayer non funziona
- Verifica la connessione internet
- Controlla che il firewall non blocchi PeerJS
- Prova a ricaricare la pagina

### Le navi non si posizionano
- Verifica che non ci siano sovrapposizioni
- Controlla che le navi non siano in celle attigue
- Assicurati che la nave non esca dalla griglia

### Il gioco è lento
- Chiudi altre schede del browser
- Disabilita estensioni del browser
- Aggiorna il browser all'ultima versione

## 📄 Licenza

Questo progetto è stato creato per scopi educativi e di intrattenimento.

## 👨‍💻 Autore

Sviluppato con ❤️ usando Bob AI Assistant

---

**Buon divertimento! ⚓🎮**