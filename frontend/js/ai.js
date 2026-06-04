/**
 * AI System - Intelligenza Artificiale per modalità vs CPU
 *
 * @module ai
 * @description Implementa 3 livelli di difficoltà: Easy, Medium, Hard
 */

console.log('📦 Caricamento ai.js...');

/**
 * Classe base per l'AI
 * @class AIPlayer
 */
class AIPlayer {
    /**
     * Livelli di difficoltà
     * @static
     */
    static DIFFICULTY = {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    };

    /**
     * Crea un nuovo AI player
     * @param {string} difficulty - Livello di difficoltà
     * @param {Grid} targetGrid - Griglia target (del giocatore)
     */
    constructor(difficulty = AIPlayer.DIFFICULTY.MEDIUM, targetGrid) {
        this.difficulty = difficulty;
        this.targetGrid = targetGrid;
        this.shotHistory = new Set(); // Coordinate già sparate
        this.hitQueue = []; // Coda di celle da targetizzare dopo un hit
        this.lastHit = null; // Ultimo colpo andato a segno
        this.currentTarget = null; // Nave attualmente targetizzata
        this.huntMode = true; // true = cerca, false = target
        
        // Per modalità difficile: traccia direzione identificata
        this.hitStreak = []; // Array di colpi consecutivi sulla stessa nave
        this.identifiedDirection = null; // Direzione identificata: 'horizontal' o 'vertical'
        
        // Statistiche
        this.stats = {
            totalShots: 0,
            hits: 0,
            misses: 0,
            shipsDestroyed: 0
        };
    }

    /**
     * Ottiene la prossima mossa
     * @returns {Object} Coordinata {row, col}
     */
    getNextMove() {
        switch (this.difficulty) {
            case AIPlayer.DIFFICULTY.EASY:
                return this.getEasyMove();
            case AIPlayer.DIFFICULTY.MEDIUM:
                return this.getMediumMove();
            case AIPlayer.DIFFICULTY.HARD:
                return this.getHardMove();
            default:
                return this.getMediumMove();
        }
    }

    /**
     * Registra il risultato di un attacco
     * @param {Object} coordinate - Coordinata attaccata
     * @param {Object} result - Risultato dell'attacco
     */
    recordShot(coordinate, result) {
        const key = Utils.coordToKey(coordinate);
        this.shotHistory.add(key);
        this.stats.totalShots++;

        if (result.result === 'hit') {
            this.stats.hits++;
            this.onHit(coordinate, result);
        } else if (result.result === 'sunk') {
            this.stats.hits++;
            this.stats.shipsDestroyed++;
            this.onSunk(coordinate, result);
        } else if (result.result === 'miss') {
            this.stats.misses++;
            this.onMiss(coordinate);
        }
    }

    /**
     * Gestisce un colpo andato a segno
     * @protected
     * @param {Object} coordinate - Coordinata
     * @param {Object} result - Risultato
     */
    onHit(coordinate, result) {
        this.lastHit = coordinate;
        this.huntMode = false;
        
        // Aggiungi alla serie di colpi consecutivi
        this.hitStreak.push(coordinate);
        
        // Se abbiamo 2+ colpi, identifica la direzione (solo in modalità difficile)
        if (this.difficulty === AIPlayer.DIFFICULTY.HARD && this.hitStreak.length >= 2) {
            const prev = this.hitStreak[this.hitStreak.length - 2];
            const curr = this.hitStreak[this.hitStreak.length - 1];
            
            // Identifica direzione
            if (prev.row === curr.row) {
                this.identifiedDirection = 'horizontal';
            } else if (prev.col === curr.col) {
                this.identifiedDirection = 'vertical';
            }
            
            // Pulisci la coda e aggiungi solo celle nella direzione identificata
            if (this.identifiedDirection) {
                this.hitQueue = [];
                this.addDirectionalTargets(curr);
                return;
            }
        }
        
        // Comportamento standard: aggiungi celle adiacenti alla coda
        const adjacent = Utils.getAdjacentCells(coordinate, Grid.SIZE);
        for (const cell of adjacent) {
            const key = Utils.coordToKey(cell);
            if (!this.shotHistory.has(key) && !this.isInQueue(cell)) {
                this.hitQueue.push(cell);
            }
        }
    }
    
    /**
     * Aggiunge target nella direzione identificata
     * @private
     * @param {Object} coordinate - Ultima coordinata colpita
     */
    addDirectionalTargets(coordinate) {
        const targets = [];
        
        if (this.identifiedDirection === 'horizontal') {
            // Aggiungi celle a sinistra e destra
            const left = { row: coordinate.row, col: coordinate.col - 1 };
            const right = { row: coordinate.row, col: coordinate.col + 1 };
            
            if (this.isValidTarget(left)) targets.push(left);
            if (this.isValidTarget(right)) targets.push(right);
        } else if (this.identifiedDirection === 'vertical') {
            // Aggiungi celle sopra e sotto
            const up = { row: coordinate.row - 1, col: coordinate.col };
            const down = { row: coordinate.row + 1, col: coordinate.col };
            
            if (this.isValidTarget(up)) targets.push(up);
            if (this.isValidTarget(down)) targets.push(down);
        }
        
        // Aggiungi i target alla coda (priorità alle estremità)
        this.hitQueue.unshift(...targets);
    }
    
    /**
     * Verifica se un target è valido
     * @private
     * @param {Object} cell - Cella da verificare
     * @returns {boolean} true se valida
     */
    isValidTarget(cell) {
        if (cell.row < 0 || cell.row >= Grid.SIZE || cell.col < 0 || cell.col >= Grid.SIZE) {
            return false;
        }
        const key = Utils.coordToKey(cell);
        return !this.shotHistory.has(key);
    }

    /**
     * Gestisce una nave affondata
     * @protected
     * @param {Object} coordinate - Coordinata
     * @param {Object} result - Risultato
     */
    onSunk(coordinate, result) {
        // Pulisci la coda e torna in hunt mode
        this.hitQueue = [];
        this.lastHit = null;
        this.currentTarget = null;
        this.huntMode = true;
        
        // Reset direzione identificata e serie di colpi
        this.hitStreak = [];
        this.identifiedDirection = null;
    }

    /**
     * Gestisce un colpo mancato
     * @protected
     * @param {Object} coordinate - Coordinata
     */
    onMiss(coordinate) {
        // Rimuovi dalla coda se presente
        this.hitQueue = this.hitQueue.filter(
            cell => !Utils.coordsEqual(cell, coordinate)
        );
        
        // In modalità difficile, se abbiamo una direzione identificata e manchiamo,
        // prova l'altra estremità della nave
        if (this.difficulty === AIPlayer.DIFFICULTY.HARD &&
            this.identifiedDirection &&
            this.hitStreak.length > 0) {
            
            // Rimuovi target nella direzione corrente che hanno fallito
            // e aggiungi target dall'altra parte
            const firstHit = this.hitStreak[0];
            this.addDirectionalTargets(firstHit);
        }
    }

    /**
     * Verifica se una cella è nella coda
     * @private
     * @param {Object} cell - Cella da verificare
     * @returns {boolean} true se in coda
     */
    isInQueue(cell) {
        return this.hitQueue.some(c => Utils.coordsEqual(c, cell));
    }

    /**
     * Ottiene tutte le celle disponibili
     * @protected
     * @returns {Array<Object>} Array di coordinate disponibili
     */
    getAvailableCells() {
        const available = [];
        for (let row = 0; row < Grid.SIZE; row++) {
            for (let col = 0; col < Grid.SIZE; col++) {
                const key = `${row},${col}`;
                if (!this.shotHistory.has(key)) {
                    available.push({ row, col });
                }
            }
        }
        return available;
    }

    /**
     * Mossa facile - completamente casuale
     * @private
     * @returns {Object} Coordinata {row, col}
     */
    getEasyMove() {
        const available = this.getAvailableCells();
        return Utils.randomChoice(available);
    }

    /**
     * Mossa media - Hunt & Target
     * @private
     * @returns {Object} Coordinata {row, col}
     */
    getMediumMove() {
        // Se ci sono celle da targetizzare, usale
        if (this.hitQueue.length > 0) {
            return this.hitQueue.shift();
        }

        // Altrimenti spara casualmente
        return this.getEasyMove();
    }

    /**
     * Mossa difficile - Probability map + Checkerboard
     * @private
     * @returns {Object} Coordinata {row, col}
     */
    getHardMove() {
        // Se ci sono celle da targetizzare, usale con priorità
        if (this.hitQueue.length > 0) {
            return this.hitQueue.shift();
        }

        // Calcola mappa probabilità
        const probMap = this.calculateProbabilityMap();
        
        // Filtra con pattern a scacchiera
        const checkerboard = this.getCheckerboardCells();
        
        // Trova la cella con probabilità massima
        let maxProb = -1;
        let bestCell = null;

        for (const cell of checkerboard) {
            const prob = probMap[cell.row][cell.col];
            if (prob > maxProb) {
                maxProb = prob;
                bestCell = cell;
            }
        }

        // Se non trovata, usa qualsiasi cella disponibile
        if (!bestCell) {
            const available = this.getAvailableCells();
            bestCell = Utils.randomChoice(available);
        }

        return bestCell;
    }

    /**
     * Calcola la mappa di probabilità per ogni cella
     * @private
     * @returns {Array<Array<number>>} Matrice di probabilità
     */
    calculateProbabilityMap() {
        const probMap = Array(Grid.SIZE).fill(0).map(() => Array(Grid.SIZE).fill(0));
        
        // Ottieni le navi ancora a galla
        const remainingShips = this.getRemainingShips();
        
        // Per ogni nave rimanente
        for (const shipSize of remainingShips) {
            // Prova ogni posizione e orientamento
            for (let row = 0; row < Grid.SIZE; row++) {
                for (let col = 0; col < Grid.SIZE; col++) {
                    // Orizzontale
                    if (this.canFitShip(row, col, shipSize, 'horizontal')) {
                        for (let i = 0; i < shipSize; i++) {
                            probMap[row][col + i]++;
                        }
                    }
                    
                    // Verticale
                    if (this.canFitShip(row, col, shipSize, 'vertical')) {
                        for (let i = 0; i < shipSize; i++) {
                            probMap[row + i][col]++;
                        }
                    }
                }
            }
        }

        return probMap;
    }

    /**
     * Verifica se una nave può essere posizionata
     * @private
     * @param {number} row - Riga iniziale
     * @param {number} col - Colonna iniziale
     * @param {number} size - Dimensione nave
     * @param {string} orientation - Orientamento
     * @returns {boolean} true se può essere posizionata
     */
    canFitShip(row, col, size, orientation) {
        for (let i = 0; i < size; i++) {
            const r = orientation === 'vertical' ? row + i : row;
            const c = orientation === 'horizontal' ? col + i : col;
            
            // Fuori dalla griglia
            if (r >= Grid.SIZE || c >= Grid.SIZE) {
                return false;
            }
            
            // Già sparato
            const key = `${r},${c}`;
            if (this.shotHistory.has(key)) {
                const state = this.targetGrid.getCellState({ row: r, col: c });
                // Se è un miss, la nave non può stare qui
                if (state === Grid.CELL_STATES.MISS) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Ottiene le dimensioni delle navi ancora a galla
     * @private
     * @returns {Array<number>} Array di dimensioni
     */
    getRemainingShips() {
        const allShips = [5, 4, 3, 3, 2]; // Dimensioni standard
        const sunkShips = [];
        
        // Identifica le navi affondate
        for (const ship of this.targetGrid.ships) {
            if (ship.isSunk()) {
                sunkShips.push(ship.size);
            }
        }
        
        // Rimuovi le navi affondate
        const remaining = [...allShips];
        for (const size of sunkShips) {
            const index = remaining.indexOf(size);
            if (index > -1) {
                remaining.splice(index, 1);
            }
        }
        
        return remaining;
    }

    /**
     * Ottiene le celle con pattern a scacchiera
     * @private
     * @returns {Array<Object>} Array di coordinate
     */
    getCheckerboardCells() {
        const available = this.getAvailableCells();
        
        // Filtra solo le celle "nere" della scacchiera
        // (quelle dove row + col è pari)
        return available.filter(cell => (cell.row + cell.col) % 2 === 0);
    }

    /**
     * Ottiene le statistiche dell'AI
     * @returns {Object} Statistiche
     */
    getStats() {
        return {
            ...this.stats,
            accuracy: this.stats.totalShots > 0 
                ? Math.round((this.stats.hits / this.stats.totalShots) * 100) 
                : 0,
            difficulty: this.difficulty
        };
    }

    /**
     * Resetta l'AI
     */
    reset() {
        this.shotHistory.clear();
        this.hitQueue = [];
        this.lastHit = null;
        this.currentTarget = null;
        this.huntMode = true;
        this.hitStreak = [];
        this.identifiedDirection = null;
        this.stats = {
            totalShots: 0,
            hits: 0,
            misses: 0,
            shipsDestroyed: 0
        };
    }

    /**
     * Factory method per creare un'AI
     * @static
     * @param {string} difficulty - Livello di difficoltà
     * @param {Grid} targetGrid - Griglia target
     * @returns {AIPlayer} Istanza AI
     */
    static create(difficulty, targetGrid) {
        return new AIPlayer(difficulty, targetGrid);
    }
}

/**
 * AI Manager - Gestisce l'AI durante la partita
 * @class AIManager
 */
class AIManager {
    /**
     * Crea un nuovo AI Manager
     * @param {BattleshipGame} game - Istanza del gioco
     * @param {string} difficulty - Livello di difficoltà
     */
    constructor(game, difficulty = AIPlayer.DIFFICULTY.MEDIUM) {
        this.game = game;
        this.ai = new AIPlayer(difficulty, game.playerGrid);
        this.isThinking = false;
        this.thinkingDelay = this.getThinkingDelay(difficulty);
    }

    /**
     * Ottiene il delay di "pensiero" in base alla difficoltà
     * @private
     * @param {string} difficulty - Difficoltà
     * @returns {number} Millisecondi di delay
     */
    getThinkingDelay(difficulty) {
        switch (difficulty) {
            case AIPlayer.DIFFICULTY.EASY:
                return 1000; // 1 secondo
            case AIPlayer.DIFFICULTY.MEDIUM:
                return 1500; // 1.5 secondi
            case AIPlayer.DIFFICULTY.HARD:
                return 2000; // 2 secondi
            default:
                return 1500;
        }
    }

    /**
     * Esegue il turno dell'AI
     * @returns {Promise<Object>} Risultato dell'attacco
     */
    async makeMove() {
        if (this.isThinking) {
            return null;
        }

        this.isThinking = true;

        // Simula "pensiero"
        await new Promise(resolve => setTimeout(resolve, this.thinkingDelay));

        // Ottieni la mossa
        const move = this.ai.getNextMove();

        // Esegui l'attacco
        const result = this.game.opponentAttack(move);

        // Registra il risultato
        if (result) {
            this.ai.recordShot(move, result);
        }

        this.isThinking = false;

        return result;
    }

    /**
     * Verifica se l'AI sta "pensando"
     * @returns {boolean} true se sta pensando
     */
    isAIThinking() {
        return this.isThinking;
    }

    /**
     * Ottiene le statistiche dell'AI
     * @returns {Object} Statistiche
     */
    getStats() {
        return this.ai.getStats();
    }

    /**
     * Resetta l'AI
     */
    reset() {
        this.ai.reset();
        this.isThinking = false;
    }

    /**
     * Cambia la difficoltà
     * @param {string} difficulty - Nuova difficoltà
     */
    setDifficulty(difficulty) {
        this.ai = new AIPlayer(difficulty, this.game.playerGrid);
        this.thinkingDelay = this.getThinkingDelay(difficulty);
    }
}

// Export per uso in moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIPlayer, AIManager };
}

// Made with Bob
