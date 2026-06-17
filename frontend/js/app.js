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
            this.webcamManager = null;
            this.gameMode = null;
            this.difficulty = null;
            this.roomCode = null;
            this.isHost = false;
            this.chatEnabled = true; // Default: chat abilitata
            this.webcamEnabled = false; // Webcam disabilitata di default
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
            
            // Easter Egg per modalità webcam (attivato tramite chat)
            this.easterEggTrigger = 'guardami';
            this.webcamModeUnlocked = false;
            
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
            
            console.log('  → Setup Easter Egg...');
            this.setupEasterEgg();
            console.log('  ✓ Easter Egg configurato');
            
            console.log('  → Controllo stato webcam...');
            this.checkUnlockedStatus();
            console.log('  ✓ Stato webcam verificato');

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
                        window.slotMachineManager.show(
                            (slotResult) => {
                                // Callback STOP: Invia il risultato all'avversario con flag isLastShip
                                console.log('🎰 [ATTACCANTE] Invio risultato slot machine:', slotResult);
                                this.peerMultiplayer.sendSlotMachineResult(slotResult, result.allShipsSunk);
                            },
                            () => {
                                // Callback CLOSE: Se tutte le navi sono affondate, NON chiamare endGame
                                // Aspetta che il difensore chiuda la sua slot machine (evento slot_machine_closed)
                                if (result.allShipsSunk) {
                                    console.log('🏆 [ATTACCANTE] Tutte le navi affondate! Aspetto che difensore chiuda slot machine...');
                                    // Non fare nulla, aspetta slot_machine_closed che chiamerà endGame
                                } else {
                                    // Se non era l'ultima nave, continua normalmente
                                    console.log('🎰 [ATTACCANTE] Non era ultima nave, continuo');
                                }
                            }
                        );
                    } else {
                        // Modalità CPU: mostra solo la slot machine
                        console.log('🎰 Modalità CPU o non connesso, mostro solo slot machine locale');
                        window.slotMachineManager.show(
                            null, // Nessun callback per STOP in modalità CPU
                            () => {
                                // Callback CLOSE: Se tutte le navi sono affondate, mostra il popup di vittoria
                                if (result.allShipsSunk) {
                                    console.log('🏆 Tutte le navi affondate! Mostro popup vittoria dopo chiusura slot machine');
                                    this.endGame(true);
                                }
                            }
                        );
                    }
                } else {
                    console.error('🎰 slotMachineManager NON TROVATO!');
                    // Fallback: se la slot machine non esiste, mostra comunque il popup di vittoria
                    if (result.allShipsSunk) {
                        this.endGame(true);
                    }
                }
            }, 1000);
        } else if (result.result === 'hit') {
            this.ui.showToast(`${coordinate}: Colpito! ✕`, 'success');
        } else if (result.result === 'miss') {
            this.ui.showToast(`${coordinate}: Acqua 💧`, 'info');
        }

        // Non chiamare più endGame qui - viene chiamato nel callback della slot machine
        // if (result.allShipsSunk) {
        //     this.endGame(true);
        // }
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
            
            // Mostra la slot machine dell'avversario quando affonda una tua nave
            console.log('🎰 Nave affondata dall\'avversario, mostro slot machine...');
            this.showOpponentSlotMachine();
            
            // Simula l'estrazione del risultato dopo 3 secondi
            setTimeout(() => {
                const options = ['Dimmi', 'Dammi', 'Comanda'];
                const randomResult = options[Math.floor(Math.random() * 3)];
                console.log('🎰 Risultato estratto:', randomResult);
                this.showOpponentSlotResult(randomResult);
            }, 3000);
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
            this.showOpponentSlotResult(data.result, data.isLastShip);
        });

        this.peerMultiplayer.on('slot_machine_closed', (data) => {
            // Il difensore ha chiuso la slot machine, ora posso mostrare il game over
            console.log('🏆 [ATTACCANTE] Difensore ha chiuso slot machine, mostro game over');
            this.endGame(true, true);
        });

        this.peerMultiplayer.on('game_over', (data) => {
            // Ricevuto game_over dall'attaccante
            console.log('🏆 [DIFENSORE] Ricevuto game_over, winner:', data.winner);
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
            
            // NON mostrare la slot machine qui - verrà mostrata quando riceviamo 'slot_machine_start'
            // Il risultato arriverà tramite 'slot_machine_result' dall'avversario
            console.log('🎰 [DIFENSORE] Nave affondata, in attesa di slot_machine_start dall\'avversario...');
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
            shipCoordinates: result.ship && result.result === 'sunk' ? result.ship.getCoordinates() : null,
            allShipsSunk: this.game.playerGrid.areAllShipsSunk()
        });

        if (this.game.playerGrid.areAllShipsSunk()) {
            console.log('🏆 [DIFENSORE] Tutte le navi affondate! Attendo il flusso slot machine prima del game over');
            return;
        }

        this.game.currentTurn = BattleshipGame.TURNS.PLAYER;
        this.ui.updateTurnIndicators(true);
    }

    handlePeerAttackResult(data) {
        const { row, col, result, shipType, shipCoordinates, allShipsSunk } = data;
        const target = this.pendingAttack || { row, col };
        const cell = this.game.opponentGrid.cells[target.row][target.col];

        if (result === 'hit') {
            cell.state = Grid.CELL_STATES.HIT;
        } else if (result === 'sunk') {
            // FIX: Usa le coordinate inviate dal difensore per marcare tutte le celle come SUNK
            if (shipCoordinates && Array.isArray(shipCoordinates)) {
                // Marca tutte le celle della nave come SUNK usando le coordinate ricevute
                shipCoordinates.forEach(coord => {
                    const shipCell = this.game.opponentGrid.cells[coord.row][coord.col];
                    shipCell.state = Grid.CELL_STATES.SUNK;
                });
            } else {
                // Fallback: marca solo la cella corrente
                cell.state = Grid.CELL_STATES.SUNK;
            }
            
            // Marca la nave come completamente affondata
            if (shipType) {
                const enemyShip = this.game.opponentFleet.find(s => s.type === shipType);
                if (enemyShip) {
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
            
            // Mostra la slot machine e invia il risultato all'avversario
            setTimeout(() => {
                if (window.slotMachineManager) {
                    console.log('🎰 [ATTACCANTE] Mostro slot machine per nave affondata');
                    
                    // Invia notifica all'avversario che sta per vedere la slot machine
                    if (this.peerMultiplayer && this.peerMultiplayer.isConnected()) {
                        console.log('🎰 [ATTACCANTE] Invio slot_machine_start all\'avversario');
                        this.peerMultiplayer.sendSlotMachineStart();
                    }
                    
                    // Mostra la slot machine con due callback
                    window.slotMachineManager.show(
                        (extractedResult) => {
                            // Callback STOP: Invia il risultato all'avversario con flag isLastShip
                            console.log('🎰 [ATTACCANTE] Risultato estratto:', extractedResult);
                            
                            if (this.peerMultiplayer && this.peerMultiplayer.isConnected()) {
                                console.log('🎰 [ATTACCANTE] Invio risultato all\'avversario:', extractedResult);
                                this.peerMultiplayer.sendSlotMachineResult(extractedResult, allShipsSunk);
                            }
                        },
                        () => {
                            // Callback CLOSE: Se tutte le navi sono affondate, NON chiamare endGame
                            // Aspetta che il difensore chiuda la sua slot machine (evento slot_machine_closed)
                            if (allShipsSunk) {
                                console.log('🏆 [ATTACCANTE] Tutte le navi affondate! Aspetto che difensore chiuda slot machine...');
                                // Non fare nulla, aspetta slot_machine_closed che chiamerà endGame
                            } else {
                                // Se non era l'ultima nave, continua normalmente
                                console.log('🎰 [ATTACCANTE] Non era ultima nave, continuo');
                            }
                        }
                    );
                }
            }, 1000);
        } else if (hit) {
            this.ui.showToast(`${coordinate}: Colpito! ✕`, 'success');
        } else {
            this.ui.showToast(`${coordinate}: Acqua 💧`, 'info');
        }

        this.pendingAttack = null;

        // FIX 2: Non chiamare più endGame qui - viene chiamato nel callback della slot machine
        // if (allShipsSunk) {
        //     this.endGame(true);
        //     return;
        // }

        // Solo se NON tutte le navi sono affondate, cambia turno
        if (!allShipsSunk) {
            this.game.currentTurn = BattleshipGame.TURNS.OPPONENT;
            this.ui.updateTurnIndicators(false);
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        if (!this.chatEnabled) {
            this.ui.showToast('Chat disabilitata per questa partita', 'warning');
            return;
        }

        // Easter Egg: Controlla se il messaggio è "guardami"
        if (message.toLowerCase() === this.easterEggTrigger) {
            console.log('🎥 Easter Egg attivato: guardami!');
            input.value = '';
            this.activateWebcamDuringGame();
            return; // Non inviare il messaggio "guardami" nella chat
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

    showOpponentSlotResult(result, isLastShip = false) {
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
                
                // FIX: Se era l'ultima nave, invia evento slot_machine_closed e poi mostra game over
                if (isLastShip) {
                    console.log('🏆 [DIFENSORE] Era ultima nave, invio slot_machine_closed e mostro game over');
                    if (this.peerMultiplayer && this.peerMultiplayer.isConnected()) {
                        this.peerMultiplayer.sendSlotMachineClosed();
                    }
                    // Mostra il popup di sconfitta
                    setTimeout(() => {
                        this.endGame(false, false);
                    }, 300);
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

    // ==================== EASTER EGG WEBCAM MODE ====================

    setupEasterEgg() {
        // Easter Egg ora gestito tramite chat (messaggio "guardami")
        // Manteniamo il metodo vuoto per compatibilità
    }

    async activateWebcamDuringGame() {
        // Se già attivata, non fare nulla
        if (this.webcamEnabled) {
            this.ui.showToast('🎥 Webcam già attiva!', 'info');
            return;
        }

        // Verifica supporto webcam
        try {
            if (!this.webcamManager) {
                this.webcamManager = new WebcamManager();
            }
            
            const isSupported = await this.webcamManager.isWebcamSupported();
            
            if (!isSupported) {
                this.ui.showToast('❌ Webcam non disponibile o connessione non sicura', 'error', 4000);
                return;
            }
            
            // Mostra toast di sblocco con effetto
            this.ui.showToast('🎉 Modalità Face-to-Face sbloccata!', 'success', 3000);
            
            // Effetto confetti sulla schermata di gioco
            this.createGameConfetti();
            
            // Mostra il pannello webcam
            await this.showWebcamPanel();
            
            // Notifica l'altro giocatore
            if (this.peerMultiplayer && this.peerMultiplayer.isConnected()) {
                this.peerMultiplayer.send('webcam_mode_activated', {});
            }
            
        } catch (error) {
            console.error('Errore attivazione webcam:', error);
            this.ui.showToast('❌ Impossibile attivare webcam', 'error');
        }
    }

    async showWebcamPanel() {
        const webcamPanel = document.getElementById('webcamPanel');
        if (!webcamPanel) return;
        
        // Mostra il pannello
        webcamPanel.style.display = 'flex';
        webcamPanel.style.animation = 'slideInRight 0.5s ease';
        
        // Setup del pulsante toggle
        const toggleBtn = document.getElementById('toggleWebcamBtn');
        if (toggleBtn) {
            toggleBtn.onclick = async () => {
                if (!this.webcamEnabled) {
                    await this.enableWebcam();
                } else {
                    this.disableWebcam();
                }
            };
        }
        
        // Setup listener per chiamate video in arrivo
        if (this.peerMultiplayer) {
            this.peerMultiplayer.setupVideoCallListener();
            
            this.peerMultiplayer.on('incoming_video_call', async (data) => {
                console.log('📹 Chiamata video in arrivo');
                
                // Se la webcam è attiva, rispondi automaticamente
                if (this.webcamManager && this.webcamManager.isActive()) {
                    const localStream = this.webcamManager.getLocalStream();
                    this.peerMultiplayer.answerVideoCall(data.call, localStream);
                } else {
                    // Altrimenti chiedi all'utente
                    this.ui.showToast('📹 L\'avversario ha attivato la webcam!', 'info', 3000);
                }
            });
            
            this.peerMultiplayer.on('remote_stream', (data) => {
                console.log('📹 Stream remoto ricevuto');
                const remoteVideo = document.getElementById('remoteVideo');
                const remotePlaceholder = document.getElementById('remoteVideoPlaceholder');
                const remoteStatus = document.getElementById('remoteWebcamStatus');
                
                if (remoteVideo && data.stream) {
                    remoteVideo.srcObject = data.stream;
                    remoteVideo.style.display = 'block';
                    if (remotePlaceholder) remotePlaceholder.style.display = 'none';
                    if (remoteStatus) remoteStatus.classList.remove('disconnected');
                }
            });
        }
    }

    async enableWebcam() {
        try {
            if (!this.webcamManager) {
                this.webcamManager = new WebcamManager();
            }
            
            const localStream = await this.webcamManager.enableWebcam();
            
            if (localStream) {
                this.webcamEnabled = true;
                
                // Collega al video element
                const localVideo = document.getElementById('localVideo');
                const localPlaceholder = document.getElementById('localVideoPlaceholder');
                const localStatus = document.getElementById('localWebcamStatus');
                const toggleBtn = document.getElementById('toggleWebcamBtn');
                
                if (localVideo) {
                    this.webcamManager.attachLocalVideo(localVideo);
                    localVideo.style.display = 'block';
                    if (localPlaceholder) localPlaceholder.style.display = 'none';
                    if (localStatus) localStatus.classList.remove('disconnected');
                }
                
                if (toggleBtn) {
                    toggleBtn.textContent = 'Disattiva Webcam';
                    toggleBtn.classList.add('active');
                }
                
                // Avvia la chiamata video con il peer
                if (this.peerMultiplayer && this.peerMultiplayer.isConnected()) {
                    await this.peerMultiplayer.startVideoCall(localStream);
                }
                
                this.ui.showToast('✅ Webcam attivata', 'success');
            }
        } catch (error) {
            console.error('Errore attivazione webcam:', error);
            this.ui.showToast('❌ ' + error.message, 'error');
        }
    }

    disableWebcam() {
        if (this.webcamManager) {
            this.webcamManager.disableWebcam();
        }
        
        this.webcamEnabled = false;
        
        const localVideo = document.getElementById('localVideo');
        const localPlaceholder = document.getElementById('localVideoPlaceholder');
        const localStatus = document.getElementById('localWebcamStatus');
        const toggleBtn = document.getElementById('toggleWebcamBtn');
        
        if (localVideo) localVideo.style.display = 'none';
        if (localPlaceholder) localPlaceholder.style.display = 'flex';
        if (localStatus) localStatus.classList.add('disconnected');
        
        if (toggleBtn) {
            toggleBtn.textContent = 'Attiva Webcam';
            toggleBtn.classList.remove('active');
        }
        
        this.ui.showToast('Webcam disattivata', 'info');
    }

    createGameConfetti() {
        const gameScreen = document.getElementById('gameScreen');
        if (!gameScreen) return;
        
        const rect = gameScreen.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const emojis = ['🎉', '✨', '🎊', '⭐', '💫', '🌟', '📹', '🎥'];
        
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            
            const randomX = (Math.random() - 0.5) * 300;
            const randomY = Math.random() * 400;
            const randomRotation = Math.random() * 720;
            
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                font-size: 28px;
                pointer-events: none;
                z-index: 10000;
                animation: confetti-fall-${i} 2.5s ease-out forwards;
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                @keyframes confetti-fall-${i} {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(${randomX}px, ${randomY}px) rotate(${randomRotation}deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styleSheet);
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
                styleSheet.remove();
            }, 2500);
        }
    }

    checkUnlockedStatus() {
        // Non più necessario - l'Easter Egg si attiva durante la partita
        // Manteniamo il metodo vuoto per compatibilità
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
