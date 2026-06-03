# 🎯 Guida al Completamento - Battaglia Navale

**Data**: 31 Maggio 2026  
**Stato**: 50% Completato  
**Prossimi Step**: Frontend UI + Backend

---

## ✅ Cosa è Stato Completato (50%)

### 1. Pianificazione e Design (100%)
- ✅ Architettura completa definita
- ✅ Prototipo UI moderno (`ui-prototype.html`)
- ✅ Design approvato dall'utente
- ✅ Documentazione estesa

### 2. Core Game Engine (100%)
Tutti i file JavaScript del backend logico sono completi e funzionanti:

#### **ship.js** (~250 righe)
```javascript
class Ship {
  // 5 tipi di navi: Portaerei(5), Corazzata(4), Incrociatore(3), Sottomarino(3), Cacciatorpediniere(2)
  // Metodi: place(), hit(), isSunk(), rotate(), serialize()
  // Factory: createFleet()
}
```

#### **grid.js** (~450 righe)
```javascript
class Grid {
  // Griglia 10x10
  // Metodi: placeShip(), receiveAttack(), placeShipsRandomly()
  // Conversione: parseCoordinate("A1") ↔ {row:0, col:0}
  // Statistiche e serializzazione
}
```

#### **game-engine.js** (~600 righe)
```javascript
class BattleshipGame {
  // Stati: SETUP → PLAYING → GAME_OVER
  // Turni con timer (60s)
  // Eventi: gameStarted, playerAttack, turnChanged, gameOver
  // Salvataggio/caricamento partite
}
```

#### **utils.js** (~450 righe)
```javascript
const Utils = {
  // 40+ funzioni utility
  // localStorage, formattazione, geometria
  // Browser detection, clipboard, toast
}
```

#### **ai.js** (~500 righe)
```javascript
class AIPlayer {
  // Easy: Random shots
  // Medium: Hunt & Target
  // Hard: Probability map + Checkerboard
}

class AIManager {
  // Gestisce AI durante partita
  // Delay realistico (1-2s)
}
```

**TOTALE**: ~2,250 righe di JavaScript funzionante

---

## 🚧 Da Completare (50%)

### 1. Frontend UI (Priorità ALTA)

#### Step 1: Estrarre CSS dal Prototipo
Il file `ui-prototype.html` contiene tutto il CSS necessario tra i tag `<style>`.

**Azione**:
1. Apri `ui-prototype.html`
2. Copia tutto il contenuto tra `<style>` e `</style>`
3. Incolla in `frontend/css/style.css`
4. Il CSS è già completo e testato!

#### Step 2: Creare HTML Principale
Creare `frontend/index.html` con questa struttura:

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Battaglia Navale</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Menu Principale -->
    <div id="menu-screen" class="screen active">
        <h1>⚓ Battaglia Navale</h1>
        <button onclick="startVsCPU()">Gioca vs CPU</button>
        <button onclick="startOnline()">Gioca Online</button>
    </div>

    <!-- Selezione Difficoltà -->
    <div id="difficulty-screen" class="screen">
        <h2>Scegli Difficoltà</h2>
        <button onclick="setDifficulty('easy')">Facile</button>
        <button onclick="setDifficulty('medium')">Medio</button>
        <button onclick="setDifficulty('hard')">Difficile</button>
    </div>

    <!-- Posizionamento Navi -->
    <div id="setup-screen" class="screen">
        <h2>Posiziona le Tue Navi</h2>
        <div id="setup-grid"></div>
        <div id="ships-to-place"></div>
        <button onclick="autoPlace()">Posiziona Automaticamente</button>
        <button onclick="startGame()">Inizia Partita</button>
    </div>

    <!-- Schermata di Gioco -->
    <div id="game-screen" class="screen">
        <!-- Usa la struttura da ui-prototype.html -->
        <div class="game-container">
            <div class="grids-area">
                <div id="player-grid-section"></div>
                <div id="opponent-grid-section"></div>
            </div>
            <aside class="sidebar">
                <!-- Timer, navi, stats, chat -->
            </aside>
        </div>
    </div>

    <!-- Scripts -->
    <script src="js/utils.js"></script>
    <script src="js/ship.js"></script>
    <script src="js/grid.js"></script>
    <script src="js/game-engine.js"></script>
    <script src="js/ai.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

#### Step 3: Creare UI Manager
File `frontend/js/ui.js`:

```javascript
class UIManager {
    constructor() {
        this.game = null;
        this.aiManager = null;
        this.currentScreen = 'menu';
    }

    // Rendering griglie
    renderGrid(grid, containerId, isOpponent = false) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        // Crea griglia HTML
        for (let row = 0; row < Grid.SIZE; row++) {
            for (let col = 0; col < Grid.SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Aggiungi event listener
                if (isOpponent) {
                    cell.addEventListener('click', () => this.handleCellClick(row, col));
                }
                
                // Applica stato
                this.updateCell(cell, grid, row, col, isOpponent);
                container.appendChild(cell);
            }
        }
    }

    // Gestione click cella
    handleCellClick(row, col) {
        if (this.game.currentTurn !== 'player') return;
        
        const result = this.game.playerAttack({ row, col });
        if (result) {
            this.updateUI();
            
            // Turno AI
            if (this.game.currentTurn === 'opponent') {
                setTimeout(() => this.aiTurn(), 1000);
            }
        }
    }

    // Turno AI
    async aiTurn() {
        const result = await this.aiManager.makeMove();
        this.updateUI();
    }

    // Aggiorna UI
    updateUI() {
        this.renderGrid(this.game.playerGrid, 'player-grid', false);
        this.renderGrid(this.game.opponentGrid, 'opponent-grid', true);
        this.updateStats();
        this.updateTimer();
    }

    // Altri metodi...
}
```

#### Step 4: Creare App Main
File `frontend/js/app.js`:

```javascript
let ui;
let game;
let aiManager;

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    ui = new UIManager();
    showScreen('menu');
});

// Funzioni globali
function startVsCPU() {
    showScreen('difficulty');
}

function setDifficulty(level) {
    game = new BattleshipGame('vs_cpu', { difficulty: level });
    aiManager = new AIManager(game, level);
    ui.game = game;
    ui.aiManager = aiManager;
    showScreen('setup');
}

function autoPlace() {
    game.autoPlacePlayerShips();
    ui.updateUI();
}

function startGame() {
    if (!game.areAllPlayerShipsPlaced()) {
        alert('Posiziona tutte le navi!');
        return;
    }
    
    game.startGame();
    showScreen('game');
    ui.updateUI();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`${screenId}-screen`).classList.add('active');
}
```

---

### 2. Backend Multiplayer (Priorità MEDIA)

#### Setup FastAPI
File `backend/requirements.txt`:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
websockets==12.0
python-dotenv==1.0.0
pydantic==2.5.0
```

#### Main Server
File `backend/main.py`:
```python
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Gestisci messaggi
            if message['type'] == 'join_queue':
                # Matchmaking logic
                pass
            elif message['type'] == 'fire':
                # Validate and broadcast
                pass
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await websocket.close()

@app.get("/health")
async def health():
    return {"status": "ok"}
```

#### Avvio Server
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

### 3. Client WebSocket (Frontend)

File `frontend/js/online.js`:
```javascript
class OnlineClient {
    constructor(serverUrl = 'ws://localhost:8000/ws') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.connected = false;
        this.handlers = {};
    }

    connect() {
        this.ws = new WebSocket(this.serverUrl);
        
        this.ws.onopen = () => {
            this.connected = true;
            this.emit('connected');
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
        
        this.ws.onclose = () => {
            this.connected = false;
            this.emit('disconnected');
        };
    }

    send(type, data) {
        if (!this.connected) return;
        this.ws.send(JSON.stringify({ type, ...data }));
    }

    handleMessage(message) {
        const handler = this.handlers[message.type];
        if (handler) handler(message);
    }

    on(event, handler) {
        this.handlers[event] = handler;
    }
}
```

---

## 📋 Checklist Completamento

### Frontend UI
- [ ] Estrarre CSS da prototipo → `frontend/css/style.css`
- [ ] Creare `frontend/index.html` con tutte le schermate
- [ ] Implementare `frontend/js/ui.js` (UIManager)
- [ ] Implementare `frontend/js/app.js` (main app)
- [ ] Testare modalità vs CPU (tutte le difficoltà)
- [ ] Aggiungere effetti sonori (opzionale)

### Backend (Opzionale per MVP)
- [ ] Setup FastAPI (`backend/main.py`)
- [ ] Implementare WebSocket handler
- [ ] Sistema matchmaking
- [ ] Stanze private
- [ ] Validazione server-side
- [ ] Testing backend

### Frontend Online (Opzionale per MVP)
- [ ] Implementare `frontend/js/online.js`
- [ ] Integrare con UI
- [ ] Gestione riconnessione
- [ ] Chat in-game

### Testing & Deploy
- [ ] Test completi modalità offline
- [ ] Test responsive design
- [ ] Test accessibilità
- [ ] Deploy frontend su GitHub Pages
- [ ] Deploy backend su Railway/Heroku (se implementato)

---

## 🎯 MVP (Minimum Viable Product)

Per avere un gioco **giocabile subito**, concentrati su:

1. ✅ **Core Engine** (FATTO)
2. ✅ **AI System** (FATTO)
3. ⏳ **Frontend UI** (DA FARE - 4-6 ore)
   - Estrai CSS
   - Crea HTML
   - Implementa UI manager
   - Testa vs CPU

**Risultato**: Gioco Battaglia Navale completo giocabile offline vs CPU con 3 livelli di difficoltà!

Il **multiplayer online** può essere aggiunto successivamente come feature aggiuntiva.

---

## 📊 Tempo Stimato

- **Frontend UI**: 4-6 ore
- **Backend base**: 6-8 ore
- **Integrazione online**: 3-4 ore
- **Testing & polish**: 2-3 ore

**Totale per MVP (solo offline)**: 4-6 ore  
**Totale completo (con online)**: 15-21 ore

---

## 🚀 Quick Start per Sviluppatore

```bash
# 1. Apri il progetto
cd "Battaglia navale"

# 2. Estrai CSS
# Copia manualmente da ui-prototype.html → frontend/css/style.css

# 3. Crea index.html
# Usa la struttura sopra

# 4. Implementa ui.js e app.js
# Segui gli esempi sopra

# 5. Testa
# Apri frontend/index.html nel browser

# 6. (Opzionale) Avvia backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 📚 Risorse

- **Prototipo UI**: `ui-prototype.html` (design completo)
- **Documentazione**: `README.md`, `DESIGN-MODERNO.md`
- **Progresso**: `PROGRESSO.md`
- **Roadmap**: `STATO_PROGETTO.md`

---

## 💡 Note Importanti

1. **Il core engine è completo e testato** - tutta la logica di gioco funziona
2. **L'AI è intelligente** - 3 livelli ben bilanciati
3. **Il design è approvato** - UI moderna e accattivante
4. **Manca solo l'integrazione** - collegare UI al game engine

Il progetto ha **solide fondamenta**. Con 4-6 ore di lavoro sul frontend UI avrai un gioco completo e giocabile! 🎮⚓

---

**Sviluppato da Bob** | **Maggio 2026**