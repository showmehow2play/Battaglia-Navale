/**
 * BattleshipGame Class - Game Engine principale
 *
 * @class BattleshipGame
 * @description Gestisce lo stato della partita, i turni e la logica di gioco
 */

console.log('📦 Caricamento game-engine.js...');

class BattleshipGame {
    /**
     * Stati possibili della partita
     * @static
     */
    static GAME_STATES = {
        SETUP: 'setup',           // Posizionamento navi
        READY: 'ready',           // Pronto per iniziare
        PLAYING: 'playing',       // Partita in corso
        PAUSED: 'paused',         // In pausa
        GAME_OVER: 'game_over'    // Partita terminata
    };

    /**
     * Modalità di gioco
     * @static
     */
    static GAME_MODES = {
        VS_CPU: 'vs_cpu',
        ONLINE: 'online'
    };

    /**
     * Turni
     * @static
     */
    static TURNS = {
        PLAYER: 'player',
        OPPONENT: 'opponent'
    };

    /**
     * Crea una nuova partita
     * @param {string} mode - Modalità di gioco
     * @param {Object} options - Opzioni aggiuntive
     */
    constructor(mode = BattleshipGame.GAME_MODES.VS_CPU, options = {}) {
        this.mode = mode;
        this.state = BattleshipGame.GAME_STATES.SETUP;
        this.currentTurn = BattleshipGame.TURNS.PLAYER;
        
        // Griglie
        this.playerGrid = new Grid('player');
        this.opponentGrid = new Grid('opponent');
        
        // Flotte
        this.playerFleet = Ship.createFleet();
        this.opponentFleet = Ship.createFleet();
        
        // Opzioni
        this.options = {
            difficulty: options.difficulty || 'medium', // easy, medium, hard
            turnTimeout: options.turnTimeout || 60000,  // 60 secondi
            allowReconnect: options.allowReconnect !== false,
            ...options
        };
        
        // Statistiche
        this.stats = {
            startTime: null,
            endTime: null,
            totalTurns: 0,
            playerShots: 0,
            opponentShots: 0,
            winner: null
        };
        
        // Eventi
        this.eventHandlers = {};
        
        // Timer turno
        this.turnTimer = null;
        this.turnTimeRemaining = this.options.turnTimeout;
        
        // Storia mosse
        this.moveHistory = [];
        
        // ID partita
        this.gameId = this.generateGameId();
    }

    /**
     * Genera un ID univoco per la partita
     * @private
     * @returns {string} ID partita
     */
    generateGameId() {
        return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Registra un event handler
     * @param {string} event - Nome evento
     * @param {Function} handler - Handler function
     */
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    /**
     * Rimuove un event handler
     * @param {string} event - Nome evento
     * @param {Function} handler - Handler function
     */
    off(event, handler) {
        if (!this.eventHandlers[event]) return;
        const index = this.eventHandlers[event].indexOf(handler);
        if (index > -1) {
            this.eventHandlers[event].splice(index, 1);
        }
    }

    /**
     * Emette un evento
     * @private
     * @param {string} event - Nome evento
     * @param {*} data - Dati evento
     */
    emit(event, data) {
        if (!this.eventHandlers[event]) return;
        this.eventHandlers[event].forEach(handler => handler(data));
    }

    /**
     * Posiziona una nave del giocatore
     * @param {Ship} ship - Nave da posizionare
     * @param {Object} position - Posizione {row, col}
     * @param {string} orientation - Orientamento
     * @returns {boolean} true se posizionata
     */
    placePlayerShip(ship, position, orientation) {
        if (this.state !== BattleshipGame.GAME_STATES.SETUP) {
            console.warn('Impossibile posizionare navi: partita già iniziata');
            return false;
        }

        const placed = this.playerGrid.placeShip(ship, position, orientation);
        
        if (placed) {
            this.emit('shipPlaced', { ship, position, orientation });
            
            // Verifica se tutte le navi sono posizionate
            if (this.areAllPlayerShipsPlaced()) {
                this.emit('allShipsPlaced', { player: 'player' });
            }
        }
        
        return placed;
    }

    /**
     * Rimuove una nave del giocatore
     * @param {Ship} ship - Nave da rimuovere
     * @returns {boolean} true se rimossa
     */
    removePlayerShip(ship) {
        if (this.state !== BattleshipGame.GAME_STATES.SETUP) {
            return false;
        }

        const removed = this.playerGrid.removeShip(ship);
        
        if (removed) {
            this.emit('shipRemoved', { ship });
        }
        
        return removed;
    }

    /**
     * Posiziona automaticamente le navi del giocatore
     * @returns {boolean} true se posizionate
     */
    autoPlacePlayerShips() {
        return this.playerGrid.placeShipsRandomly(this.playerFleet);
    }

    /**
     * Posiziona automaticamente le navi dell'avversario
     * @returns {boolean} true se posizionate
     */
    autoPlaceOpponentShips() {
        return this.opponentGrid.placeShipsRandomly(this.opponentFleet);
    }

    /**
     * Verifica se tutte le navi del giocatore sono posizionate
     * @returns {boolean} true se tutte posizionate
     */
    areAllPlayerShipsPlaced() {
        return this.playerFleet.every(ship => ship.placed);
    }

    /**
     * Verifica se tutte le navi dell'avversario sono posizionate
     * @returns {boolean} true se tutte posizionate
     */
    areAllOpponentShipsPlaced() {
        return this.opponentFleet.every(ship => ship.placed);
    }

    /**
     * Inizia la partita
     * @returns {boolean} true se iniziata
     */
    startGame() {
        if (this.state !== BattleshipGame.GAME_STATES.SETUP) {
            console.warn('Impossibile iniziare: stato non valido');
            return false;
        }

        if (!this.areAllPlayerShipsPlaced()) {
            console.warn('Impossibile iniziare: posiziona tutte le navi');
            return false;
        }

        // Posiziona le navi dell'avversario se non già fatto
        if (!this.areAllOpponentShipsPlaced()) {
            this.autoPlaceOpponentShips();
        }

        this.state = BattleshipGame.GAME_STATES.PLAYING;
        this.stats.startTime = Date.now();
        this.currentTurn = BattleshipGame.TURNS.PLAYER;
        
        this.emit('gameStarted', {
            mode: this.mode,
            difficulty: this.options.difficulty
        });
        
        this.startTurnTimer();
        
        return true;
    }

    /**
     * Getter per verificare se è il turno del giocatore
     * @returns {boolean} true se è il turno del giocatore
     */
    get isPlayerTurn() {
        return this.currentTurn === BattleshipGame.TURNS.PLAYER;
    }

    /**
     * Esegue un attacco del giocatore
     * @param {Object} coordinate - Coordinata {row, col}
     * @returns {Object|null} Risultato attacco o null se non valido
     */
    playerAttack(coordinate) {
        if (this.state !== BattleshipGame.GAME_STATES.PLAYING) {
            return null;
        }

        if (this.currentTurn !== BattleshipGame.TURNS.PLAYER) {
            return null;
        }

        const result = this.opponentGrid.receiveAttack(coordinate);
        
        if (result.result === 'invalid' || result.result === 'already_shot') {
            return result;
        }

        this.stats.playerShots++;
        this.stats.totalTurns++;
        
        this.moveHistory.push({
            turn: this.stats.totalTurns,
            player: 'player',
            coordinate,
            result: result.result,
            timestamp: Date.now()
        });

        this.emit('playerAttack', result);

        // FIX: Non chiamare più endGame automaticamente - viene gestito in app.js dopo la slot machine
        // Verifica vittoria
        // if (result.allShipsSunk) {
        //     this.endGame('player');
        //     return result;
        // }

        // Cambia turno solo se non tutte le navi sono affondate
        if (!result.allShipsSunk) {
            this.switchTurn();
        }
        
        return result;
    }

    /**
     * Esegue un attacco dell'avversario (CPU o online)
     * @param {Object} coordinate - Coordinata {row, col}
     * @returns {Object|null} Risultato attacco
     */
    opponentAttack(coordinate) {
        if (this.state !== BattleshipGame.GAME_STATES.PLAYING) {
            return null;
        }

        if (this.currentTurn !== BattleshipGame.TURNS.OPPONENT) {
            return null;
        }

        const result = this.playerGrid.receiveAttack(coordinate);
        
        if (result.result === 'invalid' || result.result === 'already_shot') {
            return result;
        }

        this.stats.opponentShots++;
        
        this.moveHistory.push({
            turn: this.stats.totalTurns,
            player: 'opponent',
            coordinate,
            result: result.result,
            timestamp: Date.now()
        });

        this.emit('opponentAttack', result);

        // FIX: Non chiamare più endGame automaticamente - viene gestito in app.js dopo la slot machine
        // Verifica vittoria
        // if (result.allShipsSunk) {
        //     this.endGame('opponent');
        //     return result;
        // }

        // Cambia turno solo se non tutte le navi sono affondate
        if (!result.allShipsSunk) {
            this.switchTurn();
        }
        
        return result;
    }

    /**
     * Cambia il turno
     * @private
     */
    switchTurn() {
        this.currentTurn = this.currentTurn === BattleshipGame.TURNS.PLAYER
            ? BattleshipGame.TURNS.OPPONENT
            : BattleshipGame.TURNS.PLAYER;
        
        this.resetTurnTimer();
        
        this.emit('turnChanged', {
            currentTurn: this.currentTurn,
            turnNumber: this.stats.totalTurns,
            isPlayerTurn: this.isPlayerTurn
        });
    }

    /**
     * Avvia il timer del turno
     * @private
     */
    startTurnTimer() {
        this.stopTurnTimer();
        this.turnTimeRemaining = this.options.turnTimeout;
        
        this.turnTimer = setInterval(() => {
            this.turnTimeRemaining -= 1000;
            
            this.emit('turnTimerTick', {
                timeRemaining: this.turnTimeRemaining,
                currentTurn: this.currentTurn
            });
            
            if (this.turnTimeRemaining <= 0) {
                this.handleTurnTimeout();
            }
        }, 1000);
    }

    /**
     * Ferma il timer del turno
     * @private
     */
    stopTurnTimer() {
        if (this.turnTimer) {
            clearInterval(this.turnTimer);
            this.turnTimer = null;
        }
    }

    /**
     * Resetta il timer del turno
     * @private
     */
    resetTurnTimer() {
        this.startTurnTimer();
    }

    /**
     * Gestisce il timeout del turno
     * @private
     */
    handleTurnTimeout() {
        this.emit('turnTimeout', { currentTurn: this.currentTurn });
        
        // In modalità vs CPU, fai sparare automaticamente
        if (this.mode === BattleshipGame.GAME_MODES.VS_CPU) {
            if (this.currentTurn === BattleshipGame.TURNS.PLAYER) {
                // Spara casualmente per il giocatore
                const availableCells = this.getAvailableTargets(this.opponentGrid);
                if (availableCells.length > 0) {
                    const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
                    this.playerAttack(randomCell);
                }
            }
        } else {
            // In modalità online, considera come forfait
            const winner = this.currentTurn === BattleshipGame.TURNS.PLAYER
                ? 'opponent'
                : 'player';
            this.endGame(winner, 'timeout');
        }
    }

    /**
     * Ottiene le celle disponibili per sparare
     * @private
     * @param {Grid} grid - Griglia target
     * @returns {Array<Object>} Array di coordinate disponibili
     */
    getAvailableTargets(grid) {
        const available = [];
        for (let row = 0; row < Grid.SIZE; row++) {
            for (let col = 0; col < Grid.SIZE; col++) {
                if (!grid.isCellShot({ row, col })) {
                    available.push({ row, col });
                }
            }
        }
        return available;
    }

    /**
     * Termina la partita
     * @param {string} winner - Vincitore ('player' o 'opponent')
     * @param {string} reason - Motivo (opzionale)
     */
    endGame(winner, reason = 'all_ships_sunk') {
        this.state = BattleshipGame.GAME_STATES.GAME_OVER;
        this.stats.endTime = Date.now();
        this.stats.winner = winner;
        
        this.stopTurnTimer();
        
        const duration = this.stats.endTime - this.stats.startTime;
        const playerStats = this.playerGrid.getStats();
        const opponentStats = this.opponentGrid.getStats();
        
        this.emit('gameOver', {
            winner,
            reason,
            duration,
            stats: {
                player: playerStats,
                opponent: opponentStats,
                totalTurns: this.stats.totalTurns
            }
        });
    }

    /**
     * Mette in pausa la partita
     */
    pauseGame() {
        if (this.state === BattleshipGame.GAME_STATES.PLAYING) {
            this.state = BattleshipGame.GAME_STATES.PAUSED;
            this.stopTurnTimer();
            this.emit('gamePaused', {});
        }
    }

    /**
     * Riprende la partita
     */
    resumeGame() {
        if (this.state === BattleshipGame.GAME_STATES.PAUSED) {
            this.state = BattleshipGame.GAME_STATES.PLAYING;
            this.startTurnTimer();
            this.emit('gameResumed', {});
        }
    }

    /**
     * Resetta la partita
     */
    resetGame() {
        this.stopTurnTimer();
        
        this.state = BattleshipGame.GAME_STATES.SETUP;
        this.currentTurn = BattleshipGame.TURNS.PLAYER;
        
        this.playerGrid.clear();
        this.opponentGrid.clear();
        
        this.playerFleet = Ship.createFleet();
        this.opponentFleet = Ship.createFleet();
        
        this.stats = {
            startTime: null,
            endTime: null,
            totalTurns: 0,
            playerShots: 0,
            opponentShots: 0,
            winner: null
        };
        
        this.moveHistory = [];
        
        this.emit('gameReset', {});
    }

    /**
     * Ottiene lo stato completo della partita
     * @returns {Object} Stato partita
     */
    getGameState() {
        return {
            gameId: this.gameId,
            mode: this.mode,
            state: this.state,
            currentTurn: this.currentTurn,
            turnTimeRemaining: this.turnTimeRemaining,
            stats: this.stats,
            playerGrid: this.playerGrid.getStats(),
            opponentGrid: this.opponentGrid.getStats(),
            playerShips: this.playerFleet.map(s => s.getState()),
            opponentShips: this.opponentFleet.map(s => s.getState())
        };
    }

    /**
     * Serializza la partita per il salvataggio
     * @returns {Object} Dati serializzati
     */
    serialize() {
        return {
            gameId: this.gameId,
            mode: this.mode,
            state: this.state,
            currentTurn: this.currentTurn,
            options: this.options,
            stats: this.stats,
            playerGrid: this.playerGrid.serialize(),
            opponentGrid: this.opponentGrid.serialize(),
            moveHistory: this.moveHistory,
            turnTimeRemaining: this.turnTimeRemaining
        };
    }

    /**
     * Deserializza i dati per ripristinare una partita
     * @static
     * @param {Object} data - Dati serializzati
     * @returns {BattleshipGame} Partita ripristinata
     */
    static deserialize(data) {
        const game = new BattleshipGame(data.mode, data.options);
        game.gameId = data.gameId;
        game.state = data.state;
        game.currentTurn = data.currentTurn;
        game.stats = data.stats;
        game.moveHistory = data.moveHistory || [];
        game.turnTimeRemaining = data.turnTimeRemaining || game.options.turnTimeout;
        
        game.playerGrid = Grid.deserialize(data.playerGrid);
        game.opponentGrid = Grid.deserialize(data.opponentGrid);
        
        game.playerFleet = game.playerGrid.ships;
        game.opponentFleet = game.opponentGrid.ships;
        
        return game;
    }
}

// Export per uso in moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleshipGame;
}

// Made with Bob
