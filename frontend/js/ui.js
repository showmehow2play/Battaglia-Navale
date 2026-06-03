/**
 * UI Manager - Gestisce il rendering e le interazioni dell'interfaccia utente
 */

class UIManager {
    constructor() {
        this.currentScreen = 'menu';
        this.selectedShip = null;
        this.isHorizontal = true;
        this.setupGridElement = null;
        this.myGridElement = null;
        this.enemyGridElement = null;
        
        // Modalità posizionamento duale
        this.placementMode = 'quick'; // 'quick' o 'manual'
        this.selectedCells = []; // Array di {row, col} per modalità manuale
        this.manualPlacementActive = false;
    }

    /**
     * Inizializza l'UI Manager
     */
    init() {
        this.showScreen('menu');
        this.setupEventListeners();
    }

    /**
     * Mostra uno schermo specifico
     */
    showScreen(screenName) {
        // Nascondi tutti gli schermi
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Mostra lo schermo richiesto
        const screen = document.getElementById(`${screenName}Screen`);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
            
            // Aggiorna il badge della modalità
            this.updateModeBadge(screenName);
            
            // Mostra/nascondi pulsante indietro
            const backBtn = document.getElementById('backBtn');
            if (screenName === 'menu') {
                backBtn.style.display = 'none';
            } else {
                backBtn.style.display = 'block';
            }
        }
    }

    /**
     * Aggiorna il badge della modalità nell'header
     */
    updateModeBadge(screenName) {
        const badge = document.getElementById('modeBadge');
        const badges = {
            'menu': 'Menu Principale',
            'setup': 'Posizionamento Navi',
            'game': 'Partita in Corso'
        };
        badge.textContent = badges[screenName] || 'Battaglia Navale';
    }

    /**
     * Setup event listeners globali
     */
    setupEventListeners() {
        // Pulsante indietro
        document.getElementById('backBtn').addEventListener('click', () => {
            if (this.currentScreen === 'setup') {
                this.showScreen('menu');
            } else if (this.currentScreen === 'game') {
                if (confirm('Sei sicuro di voler abbandonare la partita?')) {
                    this.showScreen('menu');
                }
            }
        });

        // Toggle regole
        document.getElementById('toggleRules').addEventListener('click', () => {
            const rulesContent = document.getElementById('rulesContent');
            const isVisible = rulesContent.style.display !== 'none';
            rulesContent.style.display = isVisible ? 'none' : 'block';
        });
    }

    /**
     * Renderizza una griglia
     */
    renderGrid(gridElement, grid, isSetup = false, isMyGrid = false) {
        gridElement.innerHTML = '';
        gridElement.className = 'grid';

        // Cella vuota in alto a sinistra
        const emptyCell = document.createElement('div');
        emptyCell.className = 'grid-label';
        gridElement.appendChild(emptyCell);

        // Etichette colonne (1-10)
        for (let col = 1; col <= 10; col++) {
            const label = document.createElement('div');
            label.className = 'grid-label';
            label.textContent = col;
            label.setAttribute('aria-label', `Colonna ${col}`);
            gridElement.appendChild(label);
        }

        // Righe con etichette (A-J) e celle
        const rows = 'ABCDEFGHIJ';
        for (let row = 0; row < 10; row++) {
            // Etichetta riga
            const rowLabel = document.createElement('div');
            rowLabel.className = 'grid-label';
            rowLabel.textContent = rows[row];
            rowLabel.setAttribute('aria-label', `Riga ${rows[row]}`);
            gridElement.appendChild(rowLabel);

            // Celle della riga
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.setAttribute('aria-label', `Cella ${rows[row]}${col + 1}`);

                // Ottieni lo stato della cella dalla griglia
                const cellState = grid.cells[row][col];
                
                // Applica classi CSS in base allo stato usando Grid.CELL_STATES
                if (cellState.ship && (isSetup || isMyGrid)) {
                    cell.classList.add('ship');
                }
                
                // Usa cellState.state per determinare hit/miss/sunk
                if (cellState.state === 'sunk') {
                    cell.classList.add('sunk');
                    cell.setAttribute('aria-label', `Cella ${rows[row]}${col + 1} - Affondata`);
                } else if (cellState.state === 'hit') {
                    cell.classList.add('hit');
                    cell.setAttribute('aria-label', `Cella ${rows[row]}${col + 1} - Colpita`);
                } else if (cellState.state === 'miss') {
                    cell.classList.add('miss');
                    cell.setAttribute('aria-label', `Cella ${rows[row]}${col + 1} - Mancata`);
                }

                gridElement.appendChild(cell);
            }
        }
    }

    /**
     * Evidenzia l'ultima mossa
     */
    highlightLastMove(gridElement, row, col) {
        const cells = gridElement.querySelectorAll('.grid-cell');
        cells.forEach(cell => cell.classList.remove('last-move'));
        
        const targetCell = gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (targetCell) {
            targetCell.classList.add('last-move');
            setTimeout(() => {
                targetCell.classList.remove('last-move');
            }, 1500);
        }
    }

    /**
     * Aggiunge un flash blu alla cella attaccata (solo per nuovi attacchi)
     */
    addAttackFlash(gridElement, row, col) {
        const targetCell = gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (targetCell) {
            // Add flash animation class
            targetCell.classList.add('attack-flash');
            
            // Remove the class after animation completes
            setTimeout(() => {
                targetCell.classList.remove('attack-flash');
            }, 600); // Match the animation duration
        }
    }

    /**
     * Renderizza la lista delle navi per il setup
     */
    renderShipsList(ships) {
        const shipsList = document.getElementById('shipsList');
        shipsList.innerHTML = '';

        ships.forEach((ship, index) => {
            const shipItem = document.createElement('div');
            shipItem.className = 'ship-select-item';
            shipItem.dataset.shipIndex = index;
            
            if (ship.placed) {
                shipItem.classList.add('placed');
            }

            shipItem.innerHTML = `
                <div>
                    <div class="ship-name">${ship.name}</div>
                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">
                        Lunghezza: ${ship.size}
                    </div>
                </div>
                <div class="ship-status">
                    ${ship.placed ? '✓' : '○'}
                </div>
            `;

            if (!ship.placed) {
                shipItem.addEventListener('click', () => {
                    this.selectShip(index, ships);
                });
            }

            shipsList.appendChild(shipItem);
        });
    }

    /**
     * Seleziona una nave per il posizionamento
     */
    selectShip(index, ships) {
        // Rimuovi selezione precedente
        document.querySelectorAll('.ship-select-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Seleziona la nuova nave
        const shipItem = document.querySelector(`[data-ship-index="${index}"]`);
        if (shipItem && !ships[index].placed) {
            shipItem.classList.add('selected');
            this.selectedShip = index;
        }
    }

    /**
     * Renderizza la lista delle navi nemiche durante il gioco
     */
    renderEnemyShipsList(ships) {
        const shipsList = document.getElementById('enemyShipsList');
        shipsList.innerHTML = '';

        ships.forEach(ship => {
            const shipItem = document.createElement('li');
            shipItem.className = 'ship-item';
            
            if (ship.isSunk()) {
                shipItem.classList.add('sunk');
            }

            shipItem.innerHTML = `
                <span class="ship-name">${ship.name}</span>
                <span class="ship-size">${ship.size}</span>
                <span class="ship-status">${ship.isSunk() ? '💥' : '🚢'}</span>
            `;

            shipsList.appendChild(shipItem);
        });
    }

    /**
     * Renderizza la lista delle navi del giocatore durante il gioco
     */
    renderMyShipsList(ships) {
        const shipsList = document.getElementById('myShipsList');
        if (!shipsList) return; // Se l'elemento non esiste, esci
        
        shipsList.innerHTML = '';

        ships.forEach(ship => {
            const shipItem = document.createElement('li');
            shipItem.className = 'ship-item';
            
            if (ship.isSunk()) {
                shipItem.classList.add('sunk');
            }

            shipItem.innerHTML = `
                <span class="ship-name">${ship.name}</span>
                <span class="ship-size">${ship.size}</span>
                <span class="ship-status">${ship.isSunk() ? '💥' : '🚢'}</span>
            `;

            shipsList.appendChild(shipItem);
        });
    }

    /**
     * Aggiorna le statistiche di gioco (attacchi del giocatore)
     */
    updateStats(stats) {
        document.getElementById('shotsCount').textContent = stats.shots || 0;
        document.getElementById('hitsCount').textContent = stats.hits || 0;
        document.getElementById('missesCount').textContent = stats.misses || 0;
        
        const accuracy = stats.shots > 0
            ? Math.round((stats.hits / stats.shots) * 100)
            : 0;
        document.getElementById('accuracyValue').textContent = `${accuracy}%`;
    }

    /**
     * Aggiorna le statistiche degli attacchi nemici
     */
    updateEnemyStats(stats) {
        const shotsEl = document.getElementById('enemyShotsCount');
        const hitsEl = document.getElementById('enemyHitsCount');
        const missesEl = document.getElementById('enemyMissesCount');
        const accuracyEl = document.getElementById('enemyAccuracyValue');
        
        if (shotsEl) shotsEl.textContent = stats.shots || 0;
        if (hitsEl) hitsEl.textContent = stats.hits || 0;
        if (missesEl) missesEl.textContent = stats.misses || 0;
        
        const accuracy = stats.shots > 0
            ? Math.round((stats.hits / stats.shots) * 100)
            : 0;
        if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    }

    /**
     * Aggiorna il timer
     */
    updateTimer(seconds) {
        const timerValue = document.getElementById('timerValue');
        timerValue.textContent = seconds;
        
        // Aggiungi classe warning se < 10 secondi
        if (seconds <= 10) {
            timerValue.classList.add('warning');
        } else {
            timerValue.classList.remove('warning');
        }
    }

    /**
     * Aggiorna gli indicatori di turno
     */
    updateTurnIndicators(isMyTurn) {
        const myIndicator = document.getElementById('myTurnIndicator');
        const enemyIndicator = document.getElementById('enemyTurnIndicator');

        if (isMyTurn) {
            myIndicator.className = 'turn-indicator turn-active';
            myIndicator.textContent = '🎯 Tuo Turno';
            enemyIndicator.className = 'turn-indicator turn-waiting';
            enemyIndicator.textContent = 'In attesa...';
        } else {
            myIndicator.className = 'turn-indicator turn-waiting';
            myIndicator.textContent = 'In attesa...';
            enemyIndicator.className = 'turn-indicator turn-active';
            enemyIndicator.textContent = '🎯 Turno Avversario';
        }
    }

    /**
     * Mostra un toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || 'ℹ'}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">×</button>
        `;
        
        container.appendChild(toast);
        
        // Chiudi al click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        // Auto-chiudi dopo duration
        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    }

    /**
     * Mostra un modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Nascondi un modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Mostra il modal di game over
     */
    showGameOver(isWinner, stats) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        const statsDiv = document.getElementById('gameOverStats');

        title.textContent = isWinner ? '🎉 Vittoria!' : '💔 Sconfitta';
        message.textContent = isWinner 
            ? 'Complimenti! Hai affondato tutte le navi nemiche!' 
            : 'Peccato! Tutte le tue navi sono state affondate.';

        // Mostra statistiche
        const accuracy = stats.shots > 0 
            ? Math.round((stats.hits / stats.shots) * 100) 
            : 0;

        statsDiv.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Colpi Totali:</span>
                <span class="stat-value">${stats.shots}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Colpi a Segno:</span>
                <span class="stat-value">${stats.hits}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Colpi Mancati:</span>
                <span class="stat-value">${stats.misses}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Precisione:</span>
                <span class="stat-value">${accuracy}%</span>
            </div>
        `;

        this.showModal('gameOverModal');
    }

    /**
     * Aggiungi un messaggio alla chat
     */
    addChatMessage(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${this.escapeHtml(message)}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Mostra/nascondi il pannello chat
     */
    toggleChatPanel(show) {
        const chatPanel = document.getElementById('chatPanel');
        chatPanel.style.display = show ? 'flex' : 'none';
    }

    /**
     * Escape HTML per prevenire XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Abilita/disabilita le celle della griglia
     */
    setGridInteractive(gridElement, interactive) {
        const cells = gridElement.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            if (interactive) {
                cell.style.cursor = 'pointer';
                cell.style.pointerEvents = 'auto';
            } else {
                cell.style.cursor = 'not-allowed';
                cell.style.pointerEvents = 'none';
            }
        });
    }

    /**
     * Anima una cella (hit, miss, sunk)
     */
    animateCell(gridElement, row, col, type) {
        const cell = gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        // Rimuovi animazioni precedenti
        cell.classList.remove('miss', 'hit', 'sunk');
        
        // Forza reflow per riavviare l'animazione
        void cell.offsetWidth;
        
        // Aggiungi la nuova classe
        cell.classList.add(type);
    }

    /**
     * Mostra un indicatore di caricamento
     */
    showLoading(message = 'Caricamento...') {
        this.showToast(message, 'info', 0);
    }

    /**
     * Nascondi l'indicatore di caricamento
     */
    hideLoading() {
        const toasts = document.querySelectorAll('.toast-info');
        toasts.forEach(toast => toast.remove());
    }
}

// Esporta per uso globale
window.UIManager = UIManager;

// Made with Bob
