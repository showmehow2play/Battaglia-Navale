/**
 * App Main - Punto di ingresso dell'applicazione
 * Collega UI Manager, Game Engine, AI e PeerJS per multiplayer P2P
 */

console.log('📦 Caricamento app.js...');

class BattleshipApp {
    constructor() {
        console.log('🔨 Costruttore BattleshipApp chiamato');
        
        try {
            console.log('  → Creazione UIManager...');
            this.ui = new UIManager();
            console.log('  ✓ UIManager creato');
            
            this.game = null;
            this.aiManager = null;
            this.peerMultiplayer = null;
            this.gameMode = null;
            this.difficulty = null;
            this.roomCode = null;
            this.isHost = false;
            this.chatEnabled = true; // Default: chat abilitata
            this.opponentReady = false;
            this.onlineGameStarted = false;
            this.pendingAttack = null;
            this.opponentSlotInterval = null;
            this.stats = {
                shots: 0,
                hits: 0,
                misses: 0
            };
            this.enemyStats = {
                shots: 0,
                hits: 0,
                misses: 0
            };
            
            console.log('✓ Costruttore BattleshipApp completato');
        } catch (error) {
            console.error('❌ ERRORE nel costruttore BattleshipApp:', error);
            throw error;
        }
    }

    init() {
        console.log('🚢 Battaglia Navale - Inizializzazione...');

        try {
            console.log('  → Inizializzazione UI...');
            this.ui.init();
            console.log('  ✓ UI inizializzata');
            
            console.log('  → Setup menu listeners...');
            this.setupMenuListeners();
            console.log('  ✓ Menu listeners configurati');
            
            console.log('  → Setup setup listeners...');
            this.setupSetupListeners();
            console.log('  ✓ Setup listeners configurati');
            
            console.log('  → Setup game listeners...');
            this.setupGameListeners();
            console.log('  ✓ Game listeners configurati');
            
            console.log('  → Setup modal listeners...');
            this.setupModalListeners();
            console.log('  ✓ Modal listeners configurati');

            console.log('✓ Applicazione inizializzata');
        } catch (error) {
            console.error('❌ ERRORE durante init():', error);
            console.error('Stack:', error.stack);
            throw error;
        }
    }

    setupMenuListeners() {
        document.querySelectorAll('[data-mode="cpu"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.resetOnlineState(false);
                this.difficulty = e.target.dataset.difficulty;
                this.gameMode = 'cpu';
                this.startSetup();
            });
        });

        const quickBtn = document.querySelector('[data-mode="online-quick"]');
        if (quickBtn) {
            quickBtn.addEventListener('click', () => {
                this.gameMode = 'online';
                this.roomCode = null;
                // Leggi lo stato del checkbox per la chat
                const chatCheckbox = document.getElementById('enableChatCheckbox');
                this.chatEnabled = chatCheckbox ? chatCheckbox.checked : true;
                this.initializePeerMultiplayer(true);
            });
        }

        const privateBtn = document.querySelector('[data-mode="online-private"]');
        if (privateBtn) {
            privateBtn.addEventListener('click', () => {
                this.ui.showModal('privateRoomModal');
            });
        }
    }

    setupSetupListeners() {
        const rotateBtn = document.getElementById('rotateBtn');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                // Cambia l'orientamento globale per i nuovi posizionamenti
                this.ui.isHorizontal = !this.ui.isHorizontal;
                
                // Se c'è una nave selezionata e non è ancora posizionata, ruotala
                if (this.ui.selectedShip !== null && this.game && this.game.playerFleet) {
                    const ship = this.game.playerFleet[this.ui.selectedShip];
                    if (ship && !ship.placed) {
                        ship.rotate();
                    }
                }
                
                this.ui.showToast(
                    `Orientamento: ${this.ui.isHorizontal ? 'Orizzontale' : 'Verticale'}`,
                    'info',
                    1500
                );
            });
        }

        const randomBtn = document.getElementById('randomBtn');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.randomPlacement();
            });
        }

        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Copy button for setup screen
        const copySetupCodeBtn = document.getElementById('copySetupCodeBtn');
        if (copySetupCodeBtn) {
            copySetupCodeBtn.addEventListener('click', () => {
                this.copyRoomCode('activeRoomCode');
            });
        }

        this.setupDualModeListeners();
    }

    setupGameListeners() {
        const surrenderBtn = document.getElementById('surrenderBtn');
        if (surrenderBtn) {
            surrenderBtn.addEventListener('click', () => {
                if (confirm('Sei sicuro di volerti arrendere?')) {
                    this.endGame(false);
                }
            });
        }

        const sendChatBtn = document.getElementById('sendChatBtn');
        if (sendChatBtn) {
            sendChatBtn.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }

        // Copy button for game screen
        const copyGameCodeBtn = document.getElementById('copyGameCodeBtn');
        if (copyGameCodeBtn) {
            copyGameCodeBtn.addEventListener('click', () => {
                this.copyRoomCode('gameRoomCode');
            });
        }
    }

    setupModalListeners() {
        const cancelRoomBtn = document.getElementById('cancelRoomBtn');
        if (cancelRoomBtn) {
            cancelRoomBtn.addEventListener('click', () => {
                this.ui.hideModal('privateRoomModal');
            });
        }

        const joinRoomBtn = document.getElementById('joinRoomBtn');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => {
                const roomCodeInput = document.getElementById('roomCodeInput');
                const roomCode = roomCodeInput ? roomCodeInput.value.trim() : '';
                if (!roomCode) {
                    this.ui.showToast('Inserisci un codice stanza valido', 'warning');
                    return;
                }

                this.roomCode = roomCode;
                this.gameMode = 'online';
                this.ui.hideModal('privateRoomModal');
                this.initializePeerMultiplayer(false);
            });
        }

        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.ui.hideModal('gameOverModal');
                this.resetOnlineState();
                this.ui.showScreen('menu');
            });
        }

        const backToMenuBtn = document.getElementById('backToMenuBtn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                this.ui.hideModal('gameOverModal');
                this.resetOnlineState();
                this.ui.showScreen('menu');
            });
        }
    }

    startSetup() {
        console.log(`Modalità: ${this.gameMode}, Difficoltà: ${this.difficulty}`);

        this.game = new BattleshipGame(
            this.gameMode === 'online'
                ? BattleshipGame.GAME_MODES.ONLINE
                : BattleshipGame.GAME_MODES.VS_CPU
        );

        this.stats = { shots: 0, hits: 0, misses: 0 };
        this.enemyStats = { shots: 0, hits: 0, misses: 0 };
        this.pendingAttack = null;
        this.onlineGameStarted = false;
        this.opponentReady = false;

        this.ui.showScreen('setup');

        this.ui.setupGridElement = document.getElementById('setupGrid');
        this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
        this.ui.renderShipsList(this.game.playerFleet);

        this.ui.selectedShip = 0;
        this.ui.selectShip(0, this.game.playerFleet);
        this.setupGridClickHandler();

        document.getElementById('startGameBtn').disabled = true;

        const onlineSetupInfo = document.getElementById('onlineSetupInfo');
        const activeRoomCode = document.getElementById('activeRoomCode');
        if (this.gameMode === 'online') {
            onlineSetupInfo.style.display = 'block';
            activeRoomCode.textContent = this.roomCode || '-';
        } else {
            onlineSetupInfo.style.display = 'none';
            activeRoomCode.textContent = '-';
        }
    }

    setupGridClickHandler() {
        const cells = this.ui.setupGridElement.querySelectorAll('.grid-cell');

        cells.forEach(cell => {
            const clickHandler = () => {
                if (this.ui.selectedShip === null) {
                    this.ui.showToast('Seleziona prima una nave!', 'warning');
                    return;
                }

                const row = parseInt(cell.dataset.row, 10);
                const col = parseInt(cell.dataset.col, 10);

                if (this.ui.placementMode === 'quick') {
                    this.handleQuickPlacement(row, col);
                } else {
                    this.handleManualPlacement(row, col);
                }
            };

            cell.addEventListener('click', clickHandler);
            cell.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clickHandler();
                }
            });
        });
    }

    handleQuickPlacement(row, col) {
        if (this.ui.selectedShip === null) {
            this.ui.showToast('Nessuna nave selezionata!', 'warning');
            return;
        }

        const ship = this.game.playerFleet[this.ui.selectedShip];

        if (ship.placed) {
            this.ui.showToast('Questa nave è già posizionata!', 'warning');
            return;
        }

        const orientation = this.ui.isHorizontal ? 'horizontal' : 'vertical';
        const placed = this.game.playerGrid.placeShip(ship, { row, col }, orientation);

        if (placed) {
            this.ui.showToast(`${ship.name} posizionata!`, 'success');
            this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
            this.ui.renderShipsList(this.game.playerFleet);
            this.setupGridClickHandler();

            const nextShipIndex = this.game.playerFleet.findIndex(s => !s.placed);
            if (nextShipIndex !== -1) {
                this.ui.selectedShip = nextShipIndex;
                this.ui.selectShip(nextShipIndex, this.game.playerFleet);
            } else {
                this.ui.selectedShip = null;
            }

            if (this.game.areAllPlayerShipsPlaced()) {
                document.getElementById('startGameBtn').disabled = false;
                this.ui.showToast('Tutte le navi posizionate! Pronto per iniziare.', 'success');
            }
        } else {
            this.ui.showToast('Posizione non valida!', 'error');
        }
    }

    handleManualPlacement(row, col) {
        const ship = this.game.playerFleet[this.ui.selectedShip];
        const cellKey = `${row},${col}`;

        const index = this.ui.selectedCells.findIndex(c => `${c.row},${c.col}` === cellKey);

        if (index >= 0) {
            this.ui.selectedCells.splice(index, 1);
            this.ui.showToast('Cella rimossa dalla selezione', 'info', 1000);
        } else {
            if (this.ui.selectedCells.length < ship.size) {
                // Verifica preventiva se la cella è valida prima di aggiungerla
                const tempCells = [...this.ui.selectedCells, { row, col }];
                const tempValidation = this.validateManualSelectionWithCells(ship, tempCells);
                
                this.ui.selectedCells.push({ row, col });
                
                // Mostra messaggio appropriato
                if (!tempValidation.valid) {
                    this.ui.showToast(tempValidation.reason, 'error', 3000);
                } else {
                    this.ui.showToast(`Cella aggiunta (${this.ui.selectedCells.length}/${ship.size})`, 'info', 1000);
                }
            } else {
                this.ui.showToast(`Massimo ${ship.size} celle per questa nave!`, 'warning');
                return;
            }
        }

        const validation = this.validateManualSelection(ship);
        this.updateManualSelectionUI(validation);

        document.getElementById('selectionCounter').textContent =
            `${this.ui.selectedCells.length}/${ship.size} celle selezionate`;

        const confirmBtn = document.getElementById('confirmPlacementBtn');
        if (this.ui.selectedCells.length === ship.size && validation.valid) {
            confirmBtn.disabled = false;
            this.ui.showToast('✅ Selezione valida! Clicca Conferma', 'success', 2000);
        } else {
            confirmBtn.disabled = true;
        }

        const hintEl = document.getElementById('selectionHint');
        if (!validation.valid && this.ui.selectedCells.length > 0) {
            hintEl.textContent = validation.reason;
            hintEl.style.background = 'rgba(245, 101, 101, 0.15)';
            hintEl.style.borderColor = '#f56565';
        } else if (this.ui.selectedCells.length > 0 && this.ui.selectedCells.length < ship.size) {
            hintEl.textContent = `Continua a selezionare (${this.ui.selectedCells.length}/${ship.size})`;
            hintEl.style.background = 'rgba(16, 185, 129, 0.15)';
            hintEl.style.borderColor = '#10b981';
        } else {
            hintEl.textContent = 'Seleziona le celle sulla stessa riga o colonna';
            hintEl.style.background = 'rgba(255, 193, 7, 0.15)';
            hintEl.style.borderColor = '#ffc107';
        }
    }

    // Funzione helper per validare con un set temporaneo di celle
    validateManualSelectionWithCells(ship, cells) {
        if (cells.length === 0) {
            return { valid: true, reason: '' };
        }

        const rows = cells.map(c => c.row);
        const cols = cells.map(c => c.col);
        const sameRow = rows.every(r => r === rows[0]);
        const sameCol = cols.every(c => c === cols[0]);

        if (cells.length > 1 && !sameRow && !sameCol) {
            return { valid: false, reason: '❌ Le celle devono essere sulla stessa riga o colonna' };
        }

        if (cells.length > 1) {
            if (sameRow) {
                const sortedCols = [...cols].sort((a, b) => a - b);
                for (let i = 1; i < sortedCols.length; i++) {
                    if (sortedCols[i] !== sortedCols[i - 1] + 1) {
                        return { valid: false, reason: '❌ Le celle devono essere contigue (senza buchi)' };
                    }
                }
            } else {
                const sortedRows = [...rows].sort((a, b) => a - b);
                for (let i = 1; i < sortedRows.length; i++) {
                    if (sortedRows[i] !== sortedRows[i - 1] + 1) {
                        return { valid: false, reason: '❌ Le celle devono essere contigue (senza buchi)' };
                    }
                }
            }
        }

        // Controlla sovrapposizione diretta
        for (const cell of cells) {
            const gridCell = this.game.playerGrid.cells[cell.row][cell.col];
            if (gridCell.ship) {
                return { valid: false, reason: '❌ Sovrapposizione: questa cella è già occupata da un\'altra nave!' };
            }
        }

        // Controlla celle adiacenti
        for (const cell of cells) {
            const adjacentPositions = [
                { row: cell.row - 1, col: cell.col - 1 },
                { row: cell.row - 1, col: cell.col },
                { row: cell.row - 1, col: cell.col + 1 },
                { row: cell.row, col: cell.col - 1 },
                { row: cell.row, col: cell.col + 1 },
                { row: cell.row + 1, col: cell.col - 1 },
                { row: cell.row + 1, col: cell.col },
                { row: cell.row + 1, col: cell.col + 1 }
            ];

            for (const pos of adjacentPositions) {
                if (pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10) {
                    const adjacentCell = this.game.playerGrid.cells[pos.row][pos.col];
                    if (adjacentCell.ship) {
                        const coordinate = String.fromCharCode(65 + cell.row) + (cell.col + 1);
                        return {
                            valid: false,
                            reason: `⚠️ Troppo vicino: la cella ${coordinate} è adiacente a un'altra nave! Le navi devono avere almeno una cella di distanza.`
                        };
                    }
                }
            }
        }

        return { valid: true, reason: '' };
    }

    validateManualSelection(ship) {
        const cells = this.ui.selectedCells;

        if (cells.length === 0) {
            return { valid: true, reason: '' };
        }

        if (cells.length !== ship.size) {
            return { valid: false, reason: `Seleziona ${ship.size} celle` };
        }

        const rows = cells.map(c => c.row);
        const cols = cells.map(c => c.col);
        const sameRow = rows.every(r => r === rows[0]);
        const sameCol = cols.every(c => c === cols[0]);

        if (!sameRow && !sameCol) {
            return { valid: false, reason: 'Le celle devono essere sulla stessa riga o colonna' };
        }

        if (sameRow) {
            const sortedCols = [...cols].sort((a, b) => a - b);
            for (let i = 1; i < sortedCols.length; i++) {
                if (sortedCols[i] !== sortedCols[i - 1] + 1) {
                    return { valid: false, reason: 'Le celle devono essere contigue (senza buchi)' };
                }
            }
        } else {
            const sortedRows = [...rows].sort((a, b) => a - b);
            for (let i = 1; i < sortedRows.length; i++) {
                if (sortedRows[i] !== sortedRows[i - 1] + 1) {
                    return { valid: false, reason: 'Le celle devono essere contigue (senza buchi)' };
                }
            }
        }

        // Controlla sovrapposizione diretta
        for (const cell of cells) {
            const gridCell = this.game.playerGrid.cells[cell.row][cell.col];
            if (gridCell.ship) {
                return { valid: false, reason: '❌ Sovrapposizione: questa cella è già occupata da un\'altra nave!' };
            }
        }

        // Controlla celle adiacenti (le navi non possono toccarsi)
        for (const cell of cells) {
            const adjacentPositions = [
                { row: cell.row - 1, col: cell.col - 1 }, // diagonale alto-sinistra
                { row: cell.row - 1, col: cell.col },     // sopra
                { row: cell.row - 1, col: cell.col + 1 }, // diagonale alto-destra
                { row: cell.row, col: cell.col - 1 },     // sinistra
                { row: cell.row, col: cell.col + 1 },     // destra
                { row: cell.row + 1, col: cell.col - 1 }, // diagonale basso-sinistra
                { row: cell.row + 1, col: cell.col },     // sotto
                { row: cell.row + 1, col: cell.col + 1 }  // diagonale basso-destra
            ];

            for (const pos of adjacentPositions) {
                // Verifica che la posizione sia valida nella griglia
                if (pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10) {
                    const adjacentCell = this.game.playerGrid.cells[pos.row][pos.col];
                    if (adjacentCell.ship) {
                        const coordinate = String.fromCharCode(65 + cell.row) + (cell.col + 1);
                        return {
                            valid: false,
                            reason: `⚠️ Troppo vicino: la cella ${coordinate} è adiacente a un'altra nave! Le navi devono avere almeno una cella di distanza.`
                        };
                    }
                }
            }
        }

        return { valid: true, reason: '' };
    }

    updateManualSelectionUI(validation) {
        const cells = this.ui.setupGridElement.querySelectorAll('.grid-cell');

        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row, 10);
            const col = parseInt(cell.dataset.col, 10);
            const cellKey = `${row},${col}`;
            const isSelected = this.ui.selectedCells.some(c => `${c.row},${c.col}` === cellKey);

            cell.classList.remove('manual-selected', 'manual-invalid');

            if (isSelected) {
                if (validation.valid || this.ui.selectedCells.length < 2) {
                    cell.classList.add('manual-selected');
                } else {
                    cell.classList.add('manual-invalid');
                }
            }
        });
    }

    cancelManualSelection() {
        this.ui.selectedCells = [];
        this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
        this.setupGridClickHandler();

        const ship = this.game.playerFleet[this.ui.selectedShip];
        const selectionCounter = document.getElementById('selectionCounter');
        if (selectionCounter) {
            selectionCounter.textContent = `0/${ship ? ship.size : 5} celle selezionate`;
        }
        
        const confirmPlacementBtn = document.getElementById('confirmPlacementBtn');
        if (confirmPlacementBtn) {
            confirmPlacementBtn.disabled = true;
        }
        
        this.ui.showToast('Selezione annullata', 'info');
    }

    confirmManualPlacement() {
        const ship = this.game.playerFleet[this.ui.selectedShip];
        const cells = this.ui.selectedCells;

        if (cells.length !== ship.size) {
            this.ui.showToast('Selezione incompleta!', 'error');
            return;
        }

        const rows = cells.map(c => c.row);
        const sameRow = rows.every(r => r === rows[0]);

        const sortedCells = sameRow
            ? [...cells].sort((a, b) => a.col - b.col)
            : [...cells].sort((a, b) => a.row - b.row);

        const firstCell = sortedCells[0];
        const orientation = sameRow ? 'horizontal' : 'vertical';
        const placed = this.game.playerGrid.placeShip(ship, firstCell, orientation);

        if (placed) {
            this.ui.showToast(`${ship.name} posizionata!`, 'success');
            this.ui.selectedCells = [];

            this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
            this.ui.renderShipsList(this.game.playerFleet);
            this.setupGridClickHandler();

            const nextShipIndex = this.game.playerFleet.findIndex(s => !s.placed);
            if (nextShipIndex !== -1) {
                this.ui.selectedShip = nextShipIndex;
                this.ui.selectShip(nextShipIndex, this.game.playerFleet);
                const nextShip = this.game.playerFleet[nextShipIndex];
                const selectionCounter = document.getElementById('selectionCounter');
                if (selectionCounter) {
                    selectionCounter.textContent = `0/${nextShip.size} celle selezionate`;
                }
            } else {
                this.ui.selectedShip = null;
                const selectionCounter = document.getElementById('selectionCounter');
                if (selectionCounter) {
                    selectionCounter.textContent = '0/5 celle selezionate';
                }
            }

            const confirmPlacementBtn = document.getElementById('confirmPlacementBtn');
            if (confirmPlacementBtn) {
                confirmPlacementBtn.disabled = true;
            }

            if (this.game.areAllPlayerShipsPlaced()) {
                const startGameBtn = document.getElementById('startGameBtn');
                if (startGameBtn) {
                    startGameBtn.disabled = false;
                }
                this.ui.showToast('Tutte le navi posizionate! Pronto per iniziare.', 'success');
            }
        } else {
            this.ui.showToast('Errore nel posizionamento!', 'error');
        }
    }

    setupDualModeListeners() {
        // Listener per i pulsanti di modalità posizionamento
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                if (!mode) return;
                
                // Aggiorna lo stato visivo dei pulsanti
                document.querySelectorAll('.mode-btn').forEach(b => {
                    b.classList.remove('active', 'btn-primary');
                    b.classList.add('btn-secondary');
                });
                e.target.classList.remove('btn-secondary');
                e.target.classList.add('active', 'btn-primary');
                
                // Aggiorna la modalità
                this.ui.placementMode = mode;
                this.ui.selectedCells = [];

                const manualSelectionInfo = document.getElementById('manualSelectionInfo');
                const modeDescription = document.getElementById('modeDescription');
                
                if (mode === 'manual') {
                    if (manualSelectionInfo) manualSelectionInfo.style.display = 'block';
                    if (modeDescription) modeDescription.innerHTML = '<p><strong>Modalità Manuale:</strong> Seleziona manualmente ogni cella della nave (clicca per selezionare/deselezionare)</p>';
                    this.ui.showToast('Modalità Manuale: seleziona ogni cella della nave', 'info', 3000);

                    if (this.ui.selectedShip !== null && this.game && this.game.playerFleet) {
                        const ship = this.game.playerFleet[this.ui.selectedShip];
                        const selectionCounter = document.getElementById('selectionCounter');
                        if (selectionCounter) selectionCounter.textContent = `0/${ship.size} celle selezionate`;
                    }
                } else {
                    if (manualSelectionInfo) manualSelectionInfo.style.display = 'none';
                    if (modeDescription) modeDescription.innerHTML = '<p><strong>Modalità Rapida:</strong> Clicca una cella per posizionare la nave selezionata</p>';
                    this.ui.showToast('Modalità Rapida: 1 click per posizionare', 'info', 2000);
                }

                if (this.game && this.game.playerGrid) {
                    this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
                    this.setupGridClickHandler();
                }
            });
        });

        const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');
        if (cancelSelectionBtn) {
            cancelSelectionBtn.addEventListener('click', () => {
                this.cancelManualSelection();
            });
        }

        const confirmPlacementBtn = document.getElementById('confirmPlacementBtn');
        if (confirmPlacementBtn) {
            confirmPlacementBtn.addEventListener('click', () => {
                this.confirmManualPlacement();
            });
        }
    }

    randomPlacement() {
        // Pulisci la griglia esistente
        this.game.playerGrid.clear();
        
        // Ricrea la flotta (le navi potrebbero essere state parzialmente posizionate)
        this.game.playerFleet = Ship.createFleet();
        
        // Resetta le celle selezionate per la modalità manuale
        this.ui.selectedCells = [];
        
        // Posiziona le navi casualmente
        const success = this.game.playerGrid.placeShipsRandomly(this.game.playerFleet);
        
        if (success) {
            // Aggiorna l'UI
            this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
            this.ui.renderShipsList(this.game.playerFleet);
            this.setupGridClickHandler(); // Riattiva i click handler
            
            // Deseleziona la nave corrente
            this.ui.selectedShip = null;
            
            // Abilita il pulsante per iniziare
            document.getElementById('startGameBtn').disabled = false;
            
            this.ui.showToast('Navi posizionate casualmente!', 'success');
        } else {
            this.ui.showToast('Errore nel posizionamento casuale. Riprova.', 'error');
        }
    }

    startGame() {
        if (this.gameMode === 'cpu') {
            this.startCPUGame();
        } else if (this.gameMode === 'online') {
            this.startOnlineGame();
        }
    }

    startCPUGame() {
        console.log(`Inizio partita vs CPU (${this.difficulty})`);

        this.game.opponentGrid.placeShipsRandomly(this.game.opponentFleet);
        this.aiManager = new AIManager(this.game, this.difficulty);
        this.game.startGame();

        this.ui.showScreen('game');

        this.ui.myGridElement = document.getElementById('myGrid');
        this.ui.enemyGridElement = document.getElementById('enemyGrid');

        this.ui.renderGrid(this.ui.myGridElement, this.game.playerGrid, false, true);
        this.ui.renderGrid(this.ui.enemyGridElement, this.game.opponentGrid, false, false);

        this.ui.renderEnemyShipsList(this.game.opponentFleet);
        this.ui.renderMyShipsList(this.game.playerFleet);

        this.setupGameEventListeners();
        this.setupAttackClickHandler();

        this.ui.toggleChatPanel(false);
        this.toggleOnlineStatus(false);
        this.ui.updateTurnIndicators(this.game.isPlayerTurn);
    }

    setupGameEventListeners() {
        this.game.on('turnChanged', (data) => {
            this.ui.updateTurnIndicators(data.isPlayerTurn);

            if (!data.isPlayerTurn && this.gameMode === 'cpu') {
                setTimeout(() => {
                    this.cpuAttack();
                }, 1500);
            }
        });
    }

    setupAttackClickHandler() {
        const cells = this.ui.enemyGridElement.querySelectorAll('.grid-cell');

        cells.forEach(cell => {
            const clickHandler = () => {
                if (!this.game.isPlayerTurn) {
                    this.ui.showToast('Non è il tuo turno!', 'warning');
                    return;
                }

                const row = parseInt(cell.dataset.row, 10);
                const col = parseInt(cell.dataset.col, 10);
                const result = this.game.playerAttack({ row, col });

                if (!result) return;

                if (result.result === 'already_shot') {
                    this.ui.showToast('Hai già sparato qui!', 'warning');
                    return;
                }

                this.handlePlayerAttackResult(result, row, col);
            };

            cell.addEventListener('click', clickHandler);
            cell.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clickHandler();
                }
            });
        });
    }

    handlePlayerAttackResult(result, row, col) {
        this.stats.shots++;
        if (result.result === 'hit' || result.result === 'sunk') {
            this.stats.hits++;
        } else if (result.result === 'miss') {
            this.stats.misses++;
        }

        // Format coordinate display (e.g., "A1", "B5")
        const coordinate = Grid.formatCoordinate({ row, col });

        this.ui.updateStats(this.stats);
        this.ui.renderGrid(this.ui.enemyGridElement, this.game.opponentGrid, false, false);
        
        // Add blue flash animation only for the new attack
        this.ui.addAttackFlash(this.ui.enemyGridElement, row, col);
        
        this.setupAttackClickHandler();

        console.log('🔍 DEBUG - Risultato attacco:', result);
        console.log('🔍 DEBUG - result.result:', result.result);
        console.log('🔍 DEBUG - result.result === "sunk":', result.result === 'sunk');

        if (result.result === 'sunk') {
            console.log('🎰🎰🎰 NAVE AFFONDATA! 🎰🎰🎰');
            console.log('gameMode:', this.gameMode);
            console.log('peerMultiplayer exists:', !!this.peerMultiplayer);
            console.log('isConnected:', this.peerMultiplayer ? this.peerMultiplayer.isConnected() : 'N/A');
            
            this.ui.renderEnemyShipsList(this.game.opponentFleet);
            this.ui.showToast(`${coordinate}: ${result.ship.name} affondata! 💥`, 'success');
            
            // Mostra la slot machine quando si affonda una nave
            setTimeout(() => {
                console.log('🎰 Timeout eseguito, slotMachineManager exists:', !!window.slotMachineManager);
                if (window.slotMachineManager) {
                    // In modalità online, notifica l'avversario e passa callback
                    if (this.gameMode === 'online' && this.peerMultiplayer && this.peerMultiplayer.isConnected()) {
                        console.log('🎰 [ATTACCANTE] Invio slot_machine_start all\'avversario');
                        this.peerMultiplayer.sendSlotMachineStart();
                        console.log('🎰 [ATTACCANTE] Evento inviato, mostro slot machine');
                        window.slotMachineManager.show((result) => {
                            // Invia il risultato all'avversario
                            console.log('🎰 [ATTACCANTE] Invio risultato slot machine:', result);
                            this.peerMultiplayer.sendSlotMachineResult(result);
                        });
                    } else {
                        // Modalità CPU: mostra solo la slot machine
                        console.log('🎰 Modalità CPU o non connesso, mostro solo slot machine locale');
                        window.slotMachineManager.show();
                    }
                } else {
                    console.error('🎰 slotMachineManager NON TROVATO!');
                }
            }, 1000);
        } else if (result.result === 'hit') {
            this.ui.showToast(`${coordinate}: Colpito! ✕`, 'success');
        } else if (result.result === 'miss') {
            this.ui.showToast(`${coordinate}: Acqua 💧`, 'info');
        }

        if (result.allShipsSunk) {
            this.endGame(true);
        }
    }

    handleOpponentAttackResult(result, row, col) {
        this.enemyStats.shots++;
        if (result.result === 'hit' || result.result === 'sunk') {
            this.enemyStats.hits++;
        } else if (result.result === 'miss') {
            this.enemyStats.misses++;
        }

        // Format coordinate display (e.g., "A1", "B5")
        const coordinate = Grid.formatCoordinate({ row, col });

        this.ui.updateEnemyStats(this.enemyStats);
        this.ui.renderGrid(this.ui.myGridElement, this.game.playerGrid, false, true);
        
        // Add blue flash animation only for the new attack
        this.ui.addAttackFlash(this.ui.myGridElement, row, col);
        
        this.ui.renderMyShipsList(this.game.playerFleet);

        // Show coordinate in toast messages
        if (result.result === 'sunk') {
            this.ui.showToast(`Avversario ${coordinate}: ${result.ship.name} affondata! 💥`, 'error');
        } else if (result.result === 'hit') {
            this.ui.showToast(`Avversario ${coordinate}: Colpito! ✕`, 'error');
        } else if (result.result === 'miss') {
            this.ui.showToast(`Avversario ${coordinate}: Acqua 💧`, 'info');
        }

        if (result.allShipsSunk) {
            this.endGame(false);
        }
    }

    async cpuAttack() {
        if (this.game.state !== BattleshipGame.GAME_STATES.PLAYING || this.game.isPlayerTurn) {
            return;
        }

        const result = await this.aiManager.makeMove();

        if (result) {
            this.handleOpponentAttackResult(result, result.coordinate.row, result.coordinate.col);
        }
    }

    async initializePeerMultiplayer(isQuickMatch) {
        // Salva il roomCode PRIMA di resettare lo stato (per il guest)
        const savedRoomCode = this.roomCode;
        
        this.resetOnlineState();
        this.ui.showLoading('Inizializzazione connessione P2P...');

        try {
            this.peerMultiplayer = new PeerMultiplayer();
            await this.peerMultiplayer.initialize();
            this.setupPeerEventHandlers();

            if (isQuickMatch) {
                this.isHost = true;
                const roomId = this.peerMultiplayer.hostGame();
                this.roomCode = roomId;
                this.ui.hideLoading();
                this.ui.showToast(`Partita live creata. Condividi questo codice: ${this.roomCode}`, 'success', 12000);
                // Passa alla schermata di setup per posizionare le navi
                this.startSetup();
            } else {
                this.isHost = false;
                
                // Ripristina il roomCode salvato
                this.roomCode = savedRoomCode;
                
                // Verifica che il roomCode sia valido prima di procedere
                if (!this.roomCode || this.roomCode.trim() === '') {
                    throw new Error('Codice stanza mancante');
                }
                
                this.ui.showLoading('Connessione alla stanza...');
                await this.peerMultiplayer.joinGame(this.roomCode);
                this.ui.hideLoading();
                this.ui.showToast('Connesso alla stanza!', 'success');
                // Passa alla schermata di setup anche per il guest
                this.startSetup();
            }
        } catch (error) {
            console.error('Errore inizializzazione PeerJS:', error);
            this.ui.hideLoading();
            this.ui.showToast('Errore di connessione: ' + (error.message || error), 'error');
            this.resetOnlineState();
        }
    }

    setupPeerEventHandlers() {
        this.peerMultiplayer.on('connected', (data) => {
            console.log('✓ Connesso con:', data.peerId);
            this.updateConnectionStatus('Connesso');
            this.ui.showToast('Avversario connesso! Inizia il setup.', 'success');
            
            // Se sono l'host, invio la configurazione della chat
            if (this.isHost) {
                this.peerMultiplayer.sendChatConfig(this.chatEnabled);
            }
            
            if (this.ui.currentScreen !== 'setup') {
                this.startSetup();
            }
        });

        this.peerMultiplayer.on('chat_config', (data) => {
            // Il guest riceve la configurazione della chat dall'host
            this.chatEnabled = data.chatEnabled;
            this.peerMultiplayer.chatEnabled = data.chatEnabled;
            console.log('Configurazione chat ricevuta:', this.chatEnabled ? 'abilitata' : 'disabilitata');
        });

        this.peerMultiplayer.on('opponent_ready', () => {
            this.opponentReady = true;
            this.ui.showToast("L'avversario ha completato il setup.", 'info');

            if (this.game && this.game.areAllPlayerShipsPlaced() && !this.onlineGameStarted) {
                this.startPeerGame();
            }
        });

        this.peerMultiplayer.on('opponent_attack', (data) => {
            this.handlePeerOpponentAttack(data);
        });

        this.peerMultiplayer.on('attack_result', (data) => {
            this.handlePeerAttackResult(data);
        });

        this.peerMultiplayer.on('chat_message', (data) => {
            if (this.chatEnabled) {
                this.ui.addChatMessage('Avversario', data.message);
            }
        });

        this.peerMultiplayer.on('slot_machine_start', () => {
            // L'avversario ha affondato una nostra nave e sta per girare la slot machine
            console.log('🎰🎰🎰 [DIFENSORE] RICEVUTO slot_machine_start! 🎰🎰🎰');
            console.log('🎰 [DIFENSORE] Chiamo showOpponentSlotMachine()');
            this.showOpponentSlotMachine();
            console.log('🎰 [DIFENSORE] showOpponentSlotMachine() completato');
        });

        this.peerMultiplayer.on('slot_machine_result', (data) => {
            // L'avversario ha estratto un risultato dalla slot machine
            console.log('🎰🎰🎰 [DIFENSORE] RICEVUTO slot_machine_result:', data.result);
            this.showOpponentSlotResult(data.result);
        });

        this.peerMultiplayer.on('game_over', (data) => {
            this.endGame(data.winner !== 'me', false);
        });

        this.peerMultiplayer.on('disconnected', () => {
            this.updateConnectionStatus('Disconnesso');
            this.ui.showToast('Avversario disconnesso', 'warning');
            if (this.onlineGameStarted) {
                this.endGame(true, false);
            }
        });

        this.peerMultiplayer.on('error', (data) => {
            console.error('Errore PeerJS:', data.error);
            this.ui.showToast('Errore di connessione: ' + data.error, 'error');
        });
    }

    startOnlineGame() {
        if (!this.peerMultiplayer || !this.peerMultiplayer.isConnected()) {
            this.ui.showToast("Attendi la connessione dell'avversario prima di iniziare.", 'warning');
            return;
        }

        this.peerMultiplayer.sendSetupComplete();
        this.ui.showToast("Setup completato. In attesa dell'avversario...", 'info');

        if (this.opponentReady && !this.onlineGameStarted) {
            this.startPeerGame();
        }
    }

    startPeerGame() {
        if (this.onlineGameStarted) {
            return;
        }

        this.onlineGameStarted = true;
        this.game.state = BattleshipGame.GAME_STATES.PLAYING;
        this.game.currentTurn = this.isHost
            ? BattleshipGame.TURNS.PLAYER
            : BattleshipGame.TURNS.OPPONENT;

        this.game.opponentGrid = new Grid('opponent');
        this.game.opponentFleet = Ship.createFleet();

        this.ui.showScreen('game');

        this.ui.myGridElement = document.getElementById('myGrid');
        this.ui.enemyGridElement = document.getElementById('enemyGrid');

        this.ui.renderGrid(this.ui.myGridElement, this.game.playerGrid, false, true);
        this.ui.renderGrid(this.ui.enemyGridElement, this.game.opponentGrid, false, false);
        this.ui.renderEnemyShipsList(this.game.opponentFleet);
        this.ui.renderMyShipsList(this.game.playerFleet);
        this.ui.updateStats(this.stats);
        this.ui.updateEnemyStats(this.enemyStats);
        // Mostra la chat solo se abilitata
        this.ui.toggleChatPanel(this.chatEnabled);
        this.toggleOnlineStatus(true);
        this.updateConnectionStatus('Connesso');
        this.setupPeerAttackHandler();
        this.ui.updateTurnIndicators(this.game.isPlayerTurn);
        // Aggiungi messaggio di sistema solo se la chat è abilitata
        if (this.chatEnabled) {
            this.ui.addChatMessage('Sistema', `Partita live avviata. Codice stanza: ${this.roomCode}`);
        }
        this.ui.showToast(this.isHost ? 'Partita iniziata! Tocca a te.' : "Partita iniziata! Tocca all'avversario.", 'success');
    }

    setupPeerAttackHandler() {
        const cells = this.ui.enemyGridElement.querySelectorAll('.grid-cell');

        cells.forEach(cell => {
            const clickHandler = () => {
                if (!this.game.isPlayerTurn) {
                    this.ui.showToast('Non è il tuo turno!', 'warning');
                    return;
                }

                const row = parseInt(cell.dataset.row, 10);
                const col = parseInt(cell.dataset.col, 10);
                const cellKey = `${row},${col}`;

                if (this.game.opponentGrid.shots.has(cellKey)) {
                    this.ui.showToast('Cella già attaccata!', 'warning');
                    return;
                }

                this.pendingAttack = { row, col };
                this.game.opponentGrid.shots.add(cellKey);
                this.peerMultiplayer.sendAttack(row, col);
                this.game.currentTurn = BattleshipGame.TURNS.OPPONENT;
                this.ui.updateTurnIndicators(false);
            };

            cell.addEventListener('click', clickHandler);
            cell.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clickHandler();
                }
            });
        });
    }

    handlePeerOpponentAttack(data) {
        const { row, col } = data;
        const result = this.game.playerGrid.receiveAttack({ row, col });

        this.enemyStats.shots++;
        const hit = result.result === 'hit' || result.result === 'sunk';
        if (hit) {
            this.enemyStats.hits++;
        } else {
            this.enemyStats.misses++;
        }

        // Format coordinate display
        const coordinate = Grid.formatCoordinate({ row, col });

        this.ui.updateEnemyStats(this.enemyStats);
        this.ui.renderGrid(this.ui.myGridElement, this.game.playerGrid, false, true);
        
        // Add blue flash animation only for the new attack
        this.ui.addAttackFlash(this.ui.myGridElement, row, col);

        if (result.result === 'sunk') {
            this.ui.renderMyShipsList(this.game.playerFleet);
        }

        if (result.result === 'sunk') {
            this.ui.showToast(`Avversario ${coordinate}: ${result.ship.name} affondata! 💥`, 'error');
        } else if (hit) {
            this.ui.showToast(`Avversario ${coordinate}: Colpito! ✕`, 'error');
        } else {
            this.ui.showToast(`Avversario ${coordinate}: Acqua 💧`, 'info');
        }

        this.peerMultiplayer.sendAttackResult({
            row,
            col,
            result: result.result,
            shipType: result.ship ? result.ship.type : null,
            allShipsSunk: this.game.playerGrid.areAllShipsSunk()
        });

        if (this.game.playerGrid.areAllShipsSunk()) {
            this.endGame(false);
            return;
        }

        this.game.currentTurn = BattleshipGame.TURNS.PLAYER;
        this.ui.updateTurnIndicators(true);
    }

    handlePeerAttackResult(data) {
        const { row, col, result, shipType, allShipsSunk } = data;
        const target = this.pendingAttack || { row, col };
        const cell = this.game.opponentGrid.cells[target.row][target.col];

        if (result === 'hit') {
            cell.state = Grid.CELL_STATES.HIT;
        } else if (result === 'sunk') {
            cell.state = Grid.CELL_STATES.SUNK;
            if (shipType) {
                const enemyShip = this.game.opponentFleet.find(s => s.type === shipType);
                if (enemyShip) {
                    enemyShip.hits = new Set(enemyShip.getCoordinates().map(coord => `${coord.row},${coord.col}`));
                    enemyShip.hits = new Set(Array(enemyShip.size).fill('x'));
                }
            }
        } else {
            cell.state = Grid.CELL_STATES.MISS;
            this.game.opponentGrid.misses.add(`${target.row},${target.col}`);
        }

        this.stats.shots++;
        const hit = result === 'hit' || result === 'sunk';
        if (hit) {
            this.stats.hits++;
        } else {
            this.stats.misses++;
        }

        // Format coordinate display
        const coordinate = Grid.formatCoordinate(target);

        this.ui.updateStats(this.stats);
        this.ui.renderGrid(this.ui.enemyGridElement, this.game.opponentGrid, false, false);
        
        // Add blue flash animation only for the new attack
        this.ui.addAttackFlash(this.ui.enemyGridElement, target.row, target.col);
        
        this.setupPeerAttackHandler();

        if (result === 'sunk') {
            this.ui.showToast(`${coordinate}: Nave affondata! 💥`, 'success');
            this.ui.renderEnemyShipsList(this.game.opponentFleet);
            setTimeout(() => {
                if (window.slotMachineManager) {
                    window.slotMachineManager.show();
                }
            }, 1000);
        } else if (hit) {
            this.ui.showToast(`${coordinate}: Colpito! ✕`, 'success');
        } else {
            this.ui.showToast(`${coordinate}: Acqua 💧`, 'info');
        }

        this.pendingAttack = null;

        if (allShipsSunk) {
            this.endGame(true);
            return;
        }

        this.game.currentTurn = BattleshipGame.TURNS.OPPONENT;
        this.ui.updateTurnIndicators(false);
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        if (!this.chatEnabled) {
            this.ui.showToast('Chat disabilitata per questa partita', 'warning');
            return;
        }

        if (this.peerMultiplayer && this.peerMultiplayer.isConnected()) {
            this.peerMultiplayer.sendChatMessage(message);
            this.ui.addChatMessage('Tu', message);
            input.value = '';
        } else {
            this.ui.showToast('Non connesso all avversario', 'warning');
        }
    }

    toggleOnlineStatus(show) {
        const bar = document.getElementById('onlineStatusBar');
        const roomCodeEl = document.getElementById('gameRoomCode');

        if (bar) {
            bar.style.display = show ? 'flex' : 'none';
        }

        if (roomCodeEl) {
            roomCodeEl.textContent = this.roomCode || '-';
        }
    }

    updateConnectionStatus(status) {
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = status;
        }
    }

    copyRoomCode(elementId) {
        const codeElement = document.getElementById(elementId);
        if (!codeElement) return;

        const code = codeElement.textContent.trim();
        if (code === '-' || !code) {
            this.ui.showToast('Nessun codice da copiare', 'warning');
            return;
        }

        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            this.ui.showToast('✓ Codice copiato negli appunti!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.ui.showToast('✓ Codice copiato negli appunti!', 'success');
            } catch (err) {
                this.ui.showToast('Errore nella copia del codice', 'error');
            }
            document.body.removeChild(textArea);
        });
    }

    showOpponentSlotMachine() {
        // Mostra il popup dell'avversario con le scritte che rotano
        console.log('🎰 showOpponentSlotMachine() chiamato');
        const modal = document.getElementById('opponentSlotModal');
        const reel = document.getElementById('opponentSlotReel');
        const resultDiv = document.getElementById('opponentSlotResult');
        const closeBtn = document.getElementById('closeOpponentSlotBtn');
        
        console.log('🎰 Modal trovato:', !!modal);
        console.log('🎰 Reel trovato:', !!reel);
        
        if (!modal || !reel) {
            console.error('❌ Elementi del modal avversario non trovati');
            console.error('Modal:', modal);
            console.error('Reel:', reel);
            return;
        }
        
        // Reset e mostra il modal
        resultDiv.style.display = 'none';
        closeBtn.style.display = 'none';
        reel.classList.remove('stopping');
        reel.classList.add('spinning');
        modal.style.display = 'flex';
        
        console.log('🎰 Modal display impostato a flex');
        console.log('🎰 Modal style.display:', modal.style.display);
        
        // Avvia l'animazione di rotazione delle scritte
        const options = ['Dimmi', 'Dammi', 'Comanda'];
        
        // Ferma eventuali intervalli precedenti
        if (this.opponentSlotInterval) {
            clearInterval(this.opponentSlotInterval);
        }
        
        this.opponentSlotInterval = setInterval(() => {
            const items = reel.querySelectorAll('.slot-item');
            items.forEach(item => {
                item.textContent = options[Math.floor(Math.random() * 3)];
            });
        }, 100);
        
        console.log('🎰 Animazione avviata');
    }

    showOpponentSlotResult(result) {
        // Ferma la rotazione e mostra il risultato estratto dall'avversario
        if (this.opponentSlotInterval) {
            clearInterval(this.opponentSlotInterval);
            this.opponentSlotInterval = null;
        }
        
        const reel = document.getElementById('opponentSlotReel');
        const resultDiv = document.getElementById('opponentSlotResult');
        const resultText = resultDiv.querySelector('.slot-result-text');
        const closeBtn = document.getElementById('closeOpponentSlotBtn');
        
        if (!reel || !resultDiv || !resultText) {
            console.error('Elementi del risultato avversario non trovati');
            return;
        }
        
        // Ferma l'animazione
        reel.classList.remove('spinning');
        
        // Imposta tutti gli item del reel sul risultato finale
        const items = reel.querySelectorAll('.slot-item');
        items.forEach(item => {
            item.textContent = result;
        });
        
        // Aggiungi animazione di bounce
        reel.classList.add('stopping');
        setTimeout(() => {
            reel.classList.remove('stopping');
        }, 500);
        
        // Mostra il risultato dopo un breve delay
        setTimeout(() => {
            resultText.innerHTML = `😱 ${result.toUpperCase()}! 😱`;
            resultDiv.style.display = 'block';
            closeBtn.style.display = 'inline-block';
            
            // Setup del pulsante chiudi
            closeBtn.onclick = () => {
                const modal = document.getElementById('opponentSlotModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            };
        }, 800);
    }

    resetOnlineState(disconnect = true) {
        if (disconnect && this.peerMultiplayer) {
            this.peerMultiplayer.disconnect();
        }

        this.peerMultiplayer = null;
        this.roomCode = null;
        this.isHost = false;
        this.opponentReady = false;
        this.onlineGameStarted = false;
        this.pendingAttack = null;
        this.toggleOnlineStatus(false);
        this.ui.toggleChatPanel(false);
        this.updateConnectionStatus('Disconnesso');

        const roomInput = document.getElementById('roomCodeInput');
        if (roomInput) {
            roomInput.value = '';
        }

        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
    }

    endGame(isWinner, notifyPeer = true) {
        console.log(`Game Over - ${isWinner ? 'Vittoria' : 'Sconfitta'}`);

        if (this.game) {
            this.game.state = BattleshipGame.GAME_STATES.GAME_OVER;
        }

        if (
            notifyPeer &&
            this.peerMultiplayer &&
            this.peerMultiplayer.isConnected()
        ) {
            this.peerMultiplayer.sendGameOver({
                winner: isWinner ? 'me' : 'opponent'
            });
        }

        if (this.peerMultiplayer) {
            this.peerMultiplayer.disconnect();
            this.peerMultiplayer = null;
        }

        this.isHost = false;
        this.opponentReady = false;
        this.onlineGameStarted = false;
        this.pendingAttack = null;
        this.toggleOnlineStatus(false);
        this.ui.showGameOver(isWinner, this.stats);
    }
}

console.log('📌 Registrazione evento DOMContentLoaded...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOMContentLoaded triggered!');
    
    try {
        console.log('🏗️ Creazione istanza BattleshipApp...');
        const app = new BattleshipApp();
        
        console.log('⚙️ Inizializzazione app...');
        app.init();
        
        console.log('🌐 Assegnazione a window.app...');
        window.app = app;
        
        console.log('✅ App inizializzata con successo!');
    } catch (error) {
        console.error('❌ ERRORE durante inizializzazione app:', error);
        console.error('Stack trace:', error.stack);
    }
});

console.log('✓ Event listener DOMContentLoaded registrato');

// Made with Bob
