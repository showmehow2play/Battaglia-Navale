/**
 * App Main - Punto di ingresso dell'applicazione
 * Collega UI Manager, Game Engine, AI e PeerJS per multiplayer P2P
 */

class BattleshipApp {
    constructor() {
        this.ui = new UIManager();
        this.game = null;
        this.aiManager = null;
        this.peerMultiplayer = null;
        this.gameMode = null;
        this.difficulty = null;
        this.roomCode = null;
        this.isHost = false;
        this.opponentReady = false;
        this.onlineGameStarted = false;
        this.pendingAttack = null;
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
    }

    init() {
        console.log('🚢 Battaglia Navale - Inizializzazione...');

        this.ui.init();
        this.setupMenuListeners();
        this.setupSetupListeners();
        this.setupGameListeners();
        this.setupModalListeners();

        console.log('✓ Applicazione inizializzata');
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
        document.getElementById('rotateBtn').addEventListener('click', () => {
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

        document.getElementById('randomBtn').addEventListener('click', () => {
            this.randomPlacement();
        });

        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });

        this.setupDualModeListeners();
    }

    setupGameListeners() {
        document.getElementById('surrenderBtn').addEventListener('click', () => {
            if (confirm('Sei sicuro di volerti arrendere?')) {
                this.endGame(false);
            }
        });

        document.getElementById('sendChatBtn').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    setupModalListeners() {
        document.getElementById('cancelRoomBtn').addEventListener('click', () => {
            this.ui.hideModal('privateRoomModal');
        });

        document.getElementById('joinRoomBtn').addEventListener('click', () => {
            const roomCode = document.getElementById('roomCodeInput').value.trim();
            if (!roomCode) {
                this.ui.showToast('Inserisci un codice stanza valido', 'warning');
                return;
            }

            this.roomCode = roomCode;
            this.gameMode = 'online';
            this.ui.hideModal('privateRoomModal');
            this.initializePeerMultiplayer(false);
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.ui.hideModal('gameOverModal');
            this.resetOnlineState();
            this.ui.showScreen('menu');
        });

        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.ui.hideModal('gameOverModal');
            this.resetOnlineState();
            this.ui.showScreen('menu');
        });
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
                this.ui.selectedCells.push({ row, col });
                this.ui.showToast(`Cella aggiunta (${this.ui.selectedCells.length}/${ship.size})`, 'info', 1000);
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
            this.ui.showToast('Selezione valida! Clicca Conferma', 'success', 2000);
        } else {
            confirmBtn.disabled = true;
        }

        const hintEl = document.getElementById('selectionHint');
        if (!validation.valid && this.ui.selectedCells.length > 0) {
            hintEl.textContent = validation.reason;
            hintEl.style.background = 'rgba(245, 101, 101, 0.15)';
            hintEl.style.borderColor = '#f56565';
        } else {
            hintEl.textContent = 'Seleziona le celle sulla stessa riga o colonna';
            hintEl.style.background = 'rgba(255, 193, 7, 0.15)';
            hintEl.style.borderColor = '#ffc107';
        }
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

        for (const cell of cells) {
            const gridCell = this.game.playerGrid.cells[cell.row][cell.col];
            if (gridCell.ship) {
                return { valid: false, reason: 'Sovrapposizione con altra nave' };
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
        document.getElementById('selectionCounter').textContent = `0/${ship ? ship.size : 5} celle selezionate`;
        document.getElementById('confirmPlacementBtn').disabled = true;
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
                document.getElementById('selectionCounter').textContent = `0/${nextShip.size} celle selezionate`;
            } else {
                this.ui.selectedShip = null;
                document.getElementById('selectionCounter').textContent = '0/5 celle selezionate';
            }

            document.getElementById('confirmPlacementBtn').disabled = true;

            if (this.game.areAllPlayerShipsPlaced()) {
                document.getElementById('startGameBtn').disabled = false;
                this.ui.showToast('Tutte le navi posizionate! Pronto per iniziare.', 'success');
            }
        } else {
            this.ui.showToast('Errore nel posizionamento!', 'error');
        }
    }

    setupDualModeListeners() {
        document.querySelectorAll('input[name="placementMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.ui.placementMode = e.target.value;
                this.ui.selectedCells = [];

                const manualControls = document.getElementById('manualModeControls');
                if (e.target.value === 'manual') {
                    manualControls.style.display = 'block';
                    this.ui.showToast('Modalità Manuale: seleziona ogni cella della nave', 'info', 3000);

                    if (this.ui.selectedShip !== null && this.game && this.game.playerFleet) {
                        const ship = this.game.playerFleet[this.ui.selectedShip];
                        document.getElementById('selectionCounter').textContent = `0/${ship.size} celle selezionate`;
                    }
                } else {
                    manualControls.style.display = 'none';
                    this.ui.showToast('Modalità Rapida: 1 click per posizionare', 'info', 2000);
                }

                if (this.game && this.game.playerGrid) {
                    this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
                    this.setupGridClickHandler();
                }
            });
        });

        document.getElementById('cancelSelectionBtn').addEventListener('click', () => {
            this.cancelManualSelection();
        });

        document.getElementById('confirmPlacementBtn').addEventListener('click', () => {
            this.confirmManualPlacement();
        });
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

        if (result.result === 'sunk') {
            this.ui.renderEnemyShipsList(this.game.opponentFleet);
            this.ui.showToast(`${coordinate}: ${result.ship.name} affondata! 💥`, 'success');
            
            // Mostra la slot machine quando si affonda una nave
            setTimeout(() => {
                if (window.slotMachineManager) {
                    window.slotMachineManager.show();
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
            if (this.ui.currentScreen !== 'setup') {
                this.startSetup();
            }
        });

        this.peerMultiplayer.on('opponent_ready', () => {
            this.opponentReady = true;
            this.ui.showToast('L’avversario ha completato il setup.', 'info');

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
            this.ui.addChatMessage('Avversario', data.message);
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
            this.ui.showToast('Attendi la connessione dell’avversario prima di iniziare.', 'warning');
            return;
        }

        this.peerMultiplayer.sendSetupComplete();
        this.ui.showToast('Setup completato. In attesa dell’avversario...', 'info');

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
        this.ui.toggleChatPanel(true);
        this.toggleOnlineStatus(true);
        this.updateConnectionStatus('Connesso');
        this.setupPeerAttackHandler();
        this.ui.updateTurnIndicators(this.game.isPlayerTurn);
        this.ui.addChatMessage('Sistema', `Partita live avviata. Codice stanza: ${this.roomCode}`);
        this.ui.showToast(this.isHost ? 'Partita iniziata! Tocca a te.' : 'Partita iniziata! Tocca all’avversario.', 'success');
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

        if (this.peerMultiplayer && this.peerMultiplayer.isConnected()) {
            this.peerMultiplayer.sendChatMessage(message);
            this.ui.addChatMessage('Tu', message);
            input.value = '';
        } else {
            this.ui.showToast('Non connesso all’avversario', 'warning');
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

document.addEventListener('DOMContentLoaded', () => {
    const app = new BattleshipApp();
    app.init();
    window.app = app;
});

// Made with Bob
