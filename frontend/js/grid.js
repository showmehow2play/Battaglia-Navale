/**
 * Grid Class - Rappresenta una griglia di gioco 10x10
 * 
 * @class Grid
 * @description Gestisce il posizionamento delle navi e il tracking dei colpi
 */

class Grid {
    /**
     * Dimensione della griglia (10x10)
     * @static
     */
    static SIZE = 10;

    /**
     * Stati possibili di una cella
     * @static
     */
    static CELL_STATES = {
        EMPTY: 'empty',        // Cella vuota
        SHIP: 'ship',          // Cella con nave
        MISS: 'miss',          // Colpo mancato
        HIT: 'hit',            // Nave colpita
        SUNK: 'sunk'           // Nave affondata
    };

    /**
     * Lettere per le colonne (A-J)
     * @static
     */
    static COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    /**
     * Crea una nuova griglia
     * @param {string} owner - Proprietario della griglia ('player' o 'opponent')
     */
    constructor(owner = 'player') {
        this.owner = owner;
        this.cells = this.initializeCells();
        this.ships = [];
        this.shots = new Set(); // Set di coordinate sparate (es: "0,0")
        this.hits = new Set();  // Set di coordinate colpite
        this.misses = new Set(); // Set di coordinate mancate
    }

    /**
     * Inizializza la griglia vuota
     * @private
     * @returns {Array<Array>} Matrice 10x10
     */
    initializeCells() {
        const cells = [];
        for (let row = 0; row < Grid.SIZE; row++) {
            cells[row] = [];
            for (let col = 0; col < Grid.SIZE; col++) {
                cells[row][col] = {
                    state: Grid.CELL_STATES.EMPTY,
                    ship: null // Riferimento alla nave se presente
                };
            }
        }
        return cells;
    }

    /**
     * Verifica se una coordinata è valida
     * @param {Object} coord - Coordinata {row, col}
     * @returns {boolean} true se valida
     */
    isValidCoordinate(coord) {
        return coord.row >= 0 && coord.row < Grid.SIZE &&
               coord.col >= 0 && coord.col < Grid.SIZE;
    }

    /**
     * Verifica se una nave può essere posizionata
     * @param {Ship} ship - Nave da posizionare
     * @param {Object} position - Posizione {row, col}
     * @param {string} orientation - Orientamento
     * @returns {Object} {valid: boolean, reason: string}
     */
    canPlaceShip(ship, position, orientation) {
        // Crea una nave temporanea per ottenere le coordinate
        const tempShip = ship.clone();
        tempShip.place(position, orientation);
        const coordinates = tempShip.getCoordinates();

        // Verifica che tutte le coordinate siano valide
        for (const coord of coordinates) {
            if (!this.isValidCoordinate(coord)) {
                return {
                    valid: false,
                    reason: 'La nave esce dalla griglia'
                };
            }

            // Verifica che la cella sia vuota
            if (this.cells[coord.row][coord.col].state !== Grid.CELL_STATES.EMPTY) {
                return {
                    valid: false,
                    reason: 'La posizione è già occupata'
                };
            }
        }

        // Verifica sovrapposizione con altre navi
        for (const existingShip of this.ships) {
            if (Ship.doShipsOverlap(tempShip, existingShip)) {
                return {
                    valid: false,
                    reason: 'La nave si sovrappone ad un\'altra nave'
                };
            }
        }

        // Verifica celle adiacenti (non devono contenere altre navi)
        for (const coord of coordinates) {
            if (this.hasAdjacentShips(coord)) {
                return {
                    valid: false,
                    reason: 'Le navi non possono essere posizionate in celle attigue'
                };
            }
        }

        return { valid: true, reason: '' };
    }

    /**
     * Verifica se ci sono navi nelle celle adiacenti
     * @param {Object} coordinate - Coordinata da verificare {row, col}
     * @returns {boolean} true se ci sono navi adiacenti
     */
    hasAdjacentShips(coordinate) {
        const { row, col } = coordinate;
        
        // Controlla tutte le 8 celle adiacenti (incluse le diagonali)
        const adjacentOffsets = [
            { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
            { row: 0,  col: -1 },                       { row: 0,  col: 1 },
            { row: 1,  col: -1 }, { row: 1,  col: 0 },  { row: 1,  col: 1 }
        ];

        for (const offset of adjacentOffsets) {
            const adjRow = row + offset.row;
            const adjCol = col + offset.col;
            
            // Verifica se la coordinata adiacente è valida
            if (this.isValidCoordinate({ row: adjRow, col: adjCol })) {
                const cell = this.cells[adjRow][adjCol];
                // Se c'è una nave nella cella adiacente, ritorna true
                if (cell.state === Grid.CELL_STATES.SHIP && cell.ship) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Posiziona una nave sulla griglia
     * @param {Ship} ship - Nave da posizionare
     * @param {Object} position - Posizione {row, col}
     * @param {string} orientation - Orientamento
     * @returns {boolean} true se posizionata con successo
     */
    placeShip(ship, position, orientation) {
        const validation = this.canPlaceShip(ship, position, orientation);
        
        if (!validation.valid) {
            console.warn('Impossibile posizionare la nave:', validation.reason);
            return false;
        }

        // Posiziona la nave
        ship.place(position, orientation);
        const coordinates = ship.getCoordinates();

        // Aggiorna le celle
        for (const coord of coordinates) {
            this.cells[coord.row][coord.col] = {
                state: Grid.CELL_STATES.SHIP,
                ship: ship
            };
        }

        this.ships.push(ship);
        return true;
    }

    /**
     * Rimuove una nave dalla griglia
     * @param {Ship} ship - Nave da rimuovere
     * @returns {boolean} true se rimossa con successo
     */
    removeShip(ship) {
        const index = this.ships.indexOf(ship);
        if (index === -1) return false;

        const coordinates = ship.getCoordinates();

        // Pulisci le celle
        for (const coord of coordinates) {
            if (this.isValidCoordinate(coord)) {
                this.cells[coord.row][coord.col] = {
                    state: Grid.CELL_STATES.EMPTY,
                    ship: null
                };
            }
        }

        this.ships.splice(index, 1);
        ship.remove();
        return true;
    }

    /**
     * Riceve un attacco su una coordinata
     * @param {Object} coordinate - Coordinata attaccata {row, col}
     * @returns {Object} Risultato dell'attacco {result, ship, sunk}
     */
    receiveAttack(coordinate) {
        if (!this.isValidCoordinate(coordinate)) {
            return {
                result: 'invalid',
                message: 'Coordinata non valida'
            };
        }

        const key = `${coordinate.row},${coordinate.col}`;

        // Verifica se già sparato
        if (this.shots.has(key)) {
            return {
                result: 'already_shot',
                message: 'Hai già sparato qui'
            };
        }

        this.shots.add(key);
        const cell = this.cells[coordinate.row][coordinate.col];

        // Colpo mancato
        if (cell.state === Grid.CELL_STATES.EMPTY || cell.state === Grid.CELL_STATES.MISS) {
            cell.state = Grid.CELL_STATES.MISS;
            this.misses.add(key);
            
            return {
                result: 'miss',
                message: 'Acqua!',
                coordinate
            };
        }

        // Colpo a segno
        if (cell.state === Grid.CELL_STATES.SHIP) {
            const ship = cell.ship;
            ship.hit(coordinate);
            this.hits.add(key);

            // Verifica se la nave è affondata
            if (ship.isSunk()) {
                // Aggiorna tutte le celle della nave affondata
                const shipCoords = ship.getCoordinates();
                for (const coord of shipCoords) {
                    this.cells[coord.row][coord.col].state = Grid.CELL_STATES.SUNK;
                }

                return {
                    result: 'sunk',
                    message: `${ship.name} affondata!`,
                    ship: ship,
                    coordinate,
                    allShipsSunk: this.areAllShipsSunk()
                };
            }

            cell.state = Grid.CELL_STATES.HIT;
            return {
                result: 'hit',
                message: 'Colpito!',
                ship: ship,
                coordinate
            };
        }

        // Colpo su nave già affondata
        return {
            result: 'already_sunk',
            message: 'Nave già affondata',
            coordinate
        };
    }

    /**
     * Verifica se tutte le navi sono affondate
     * @returns {boolean} true se tutte affondate
     */
    areAllShipsSunk() {
        return this.ships.length > 0 && this.ships.every(ship => ship.isSunk());
    }

    /**
     * Ottiene lo stato di una cella
     * @param {Object} coordinate - Coordinata {row, col}
     * @returns {string} Stato della cella
     */
    getCellState(coordinate) {
        if (!this.isValidCoordinate(coordinate)) return null;
        return this.cells[coordinate.row][coordinate.col].state;
    }

    /**
     * Ottiene la nave in una cella
     * @param {Object} coordinate - Coordinata {row, col}
     * @returns {Ship|null} Nave se presente
     */
    getShipAt(coordinate) {
        if (!this.isValidCoordinate(coordinate)) return null;
        return this.cells[coordinate.row][coordinate.col].ship;
    }

    /**
     * Verifica se una cella è stata colpita
     * @param {Object} coordinate - Coordinata {row, col}
     * @returns {boolean} true se colpita
     */
    isCellShot(coordinate) {
        const key = `${coordinate.row},${coordinate.col}`;
        return this.shots.has(key);
    }

    /**
     * Posiziona le navi casualmente
     * @param {Array<Ship>} ships - Array di navi da posizionare
     * @returns {boolean} true se tutte posizionate
     */
    placeShipsRandomly(ships) {
        // Rimuovi tutte le navi esistenti
        this.clear();

        for (const ship of ships) {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 500; // Aumentato per gestire la regola delle celle attigue

            while (!placed && attempts < maxAttempts) {
                const row = Math.floor(Math.random() * Grid.SIZE);
                const col = Math.floor(Math.random() * Grid.SIZE);
                const orientation = Math.random() < 0.5
                    ? Ship.ORIENTATIONS.HORIZONTAL
                    : Ship.ORIENTATIONS.VERTICAL;

                placed = this.placeShip(ship, { row, col }, orientation);
                attempts++;
            }

            if (!placed) {
                console.error('Impossibile posizionare tutte le navi con la regola delle celle attigue');
                this.clear();
                return false;
            }
        }

        return true;
    }

    /**
     * Pulisce la griglia
     */
    clear() {
        // Rimuovi tutte le navi
        while (this.ships.length > 0) {
            this.removeShip(this.ships[0]);
        }

        // Resetta le celle
        this.cells = this.initializeCells();
        this.shots.clear();
        this.hits.clear();
        this.misses.clear();
    }

    /**
     * Ottiene statistiche della griglia
     * @returns {Object} Statistiche
     */
    getStats() {
        return {
            totalShips: this.ships.length,
            shipsAfloat: this.ships.filter(s => !s.isSunk()).length,
            shipsSunk: this.ships.filter(s => s.isSunk()).length,
            totalShots: this.shots.size,
            hits: this.hits.size,
            misses: this.misses.size,
            accuracy: this.shots.size > 0 
                ? Math.round((this.hits.size / this.shots.size) * 100) 
                : 0
        };
    }

    /**
     * Converte coordinate alfanumeriche (es: "A1") in {row, col}
     * @static
     * @param {string} coord - Coordinata alfanumerica
     * @returns {Object|null} {row, col} o null se invalida
     */
    static parseCoordinate(coord) {
        if (!coord || coord.length < 2) return null;

        const col = Grid.COLUMNS.indexOf(coord[0].toUpperCase());
        const row = parseInt(coord.substring(1)) - 1;

        if (col === -1 || isNaN(row) || row < 0 || row >= Grid.SIZE) {
            return null;
        }

        return { row, col };
    }

    /**
     * Converte {row, col} in coordinata alfanumerica (es: "A1")
     * @static
     * @param {Object} coord - Coordinata {row, col}
     * @returns {string} Coordinata alfanumerica
     */
    static formatCoordinate(coord) {
        if (!coord || coord.row < 0 || coord.row >= Grid.SIZE ||
            coord.col < 0 || coord.col >= Grid.SIZE) {
            return '';
        }
        return `${Grid.COLUMNS[coord.col]}${coord.row + 1}`;
    }

    /**
     * Serializza la griglia
     * @returns {Object} Dati serializzati
     */
    serialize() {
        return {
            owner: this.owner,
            ships: this.ships.map(ship => ship.serialize()),
            shots: Array.from(this.shots),
            hits: Array.from(this.hits),
            misses: Array.from(this.misses)
        };
    }

    /**
     * Deserializza i dati per ricreare una griglia
     * @static
     * @param {Object} data - Dati serializzati
     * @returns {Grid} Griglia ricreata
     */
    static deserialize(data) {
        const grid = new Grid(data.owner);
        
        // Ricrea le navi
        for (const shipData of data.ships) {
            const ship = Ship.deserialize(shipData);
            if (ship.placed) {
                grid.placeShip(ship, ship.position, ship.orientation);
            }
        }

        // Ricrea i colpi
        if (data.shots) {
            data.shots.forEach(shot => grid.shots.add(shot));
        }
        if (data.hits) {
            data.hits.forEach(hit => grid.hits.add(hit));
        }
        if (data.misses) {
            data.misses.forEach(miss => grid.misses.add(miss));
        }

        return grid;
    }
}

// Export per uso in moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Grid;
}

// Made with Bob
