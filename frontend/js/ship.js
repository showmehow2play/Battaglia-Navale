/**
 * Ship Class - Rappresenta una nave nel gioco Battaglia Navale
 *
 * @class Ship
 * @description Gestisce lo stato e le operazioni di una singola nave
 */

console.log('📦 Caricamento ship.js...');

class Ship {
    /**
     * Tipi di navi disponibili con le loro dimensioni
     * @static
     */
    static SHIP_TYPES = {
        CARRIER: { name: 'Portaerei', size: 5, emoji: '🚢' },
        BATTLESHIP: { name: 'Corazzata', size: 4, emoji: '⚓' },
        CRUISER: { name: 'Incrociatore', size: 3, emoji: '🛳️' },
        SUBMARINE: { name: 'Sottomarino', size: 3, emoji: '🚤' },
        DESTROYER: { name: 'Cacciatorpediniere', size: 2, emoji: '⛵' }
    };

    /**
     * Orientamenti possibili
     * @static
     */
    static ORIENTATIONS = {
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical'
    };

    /**
     * Crea una nuova nave
     * @param {string} type - Tipo di nave (chiave di SHIP_TYPES)
     * @param {Object} position - Posizione iniziale {row, col}
     * @param {string} orientation - Orientamento (horizontal/vertical)
     */
    constructor(type, position = null, orientation = Ship.ORIENTATIONS.HORIZONTAL) {
        if (!Ship.SHIP_TYPES[type]) {
            throw new Error(`Tipo di nave non valido: ${type}`);
        }

        this.type = type;
        this.name = Ship.SHIP_TYPES[type].name;
        this.size = Ship.SHIP_TYPES[type].size;
        this.emoji = Ship.SHIP_TYPES[type].emoji;
        this.position = position; // {row, col} della cella iniziale
        this.orientation = orientation;
        this.hits = new Set(); // Set di coordinate colpite (es: "0,0", "0,1")
        this.placed = false;
    }

    /**
     * Posiziona la nave sulla griglia
     * @param {Object} position - Posizione {row, col}
     * @param {string} orientation - Orientamento
     */
    place(position, orientation) {
        this.position = position;
        this.orientation = orientation;
        this.placed = true;
    }

    /**
     * Rimuove la nave dalla griglia
     */
    remove() {
        this.position = null;
        this.placed = false;
        this.hits.clear();
    }

    /**
     * Ottiene tutte le coordinate occupate dalla nave
     * @returns {Array<Object>} Array di coordinate {row, col}
     */
    getCoordinates() {
        if (!this.position) return [];

        const coordinates = [];
        const { row, col } = this.position;

        for (let i = 0; i < this.size; i++) {
            if (this.orientation === Ship.ORIENTATIONS.HORIZONTAL) {
                coordinates.push({ row, col: col + i });
            } else {
                coordinates.push({ row: row + i, col });
            }
        }

        return coordinates;
    }

    /**
     * Registra un colpo sulla nave
     * @param {Object} coordinate - Coordinata colpita {row, col}
     * @returns {boolean} true se il colpo è valido, false se già colpita
     */
    hit(coordinate) {
        const key = `${coordinate.row},${coordinate.col}`;
        
        // Verifica se la coordinata appartiene alla nave
        const coordinates = this.getCoordinates();
        const isValidHit = coordinates.some(
            coord => coord.row === coordinate.row && coord.col === coordinate.col
        );

        if (!isValidHit) {
            return false;
        }

        // Verifica se già colpita
        if (this.hits.has(key)) {
            return false;
        }

        this.hits.add(key);
        return true;
    }

    /**
     * Verifica se una coordinata è stata colpita
     * @param {Object} coordinate - Coordinata da verificare {row, col}
     * @returns {boolean} true se colpita
     */
    isHit(coordinate) {
        const key = `${coordinate.row},${coordinate.col}`;
        return this.hits.has(key);
    }

    /**
     * Verifica se la nave è affondata
     * @returns {boolean} true se tutti i segmenti sono colpiti
     */
    isSunk() {
        return this.hits.size === this.size;
    }

    /**
     * Ottiene lo stato della nave
     * @returns {Object} Stato della nave
     */
    getState() {
        return {
            type: this.type,
            name: this.name,
            size: this.size,
            emoji: this.emoji,
            position: this.position,
            orientation: this.orientation,
            placed: this.placed,
            hits: Array.from(this.hits),
            hitCount: this.hits.size,
            isSunk: this.isSunk()
        };
    }

    /**
     * Ruota la nave (cambia orientamento)
     */
    rotate() {
        this.orientation = this.orientation === Ship.ORIENTATIONS.HORIZONTAL
            ? Ship.ORIENTATIONS.VERTICAL
            : Ship.ORIENTATIONS.HORIZONTAL;
    }

    /**
     * Clona la nave
     * @returns {Ship} Nuova istanza della nave
     */
    clone() {
        const cloned = new Ship(this.type, this.position, this.orientation);
        cloned.placed = this.placed;
        this.hits.forEach(hit => cloned.hits.add(hit));
        return cloned;
    }

    /**
     * Serializza la nave per il salvataggio
     * @returns {Object} Dati serializzati
     */
    serialize() {
        return {
            type: this.type,
            position: this.position,
            orientation: this.orientation,
            hits: Array.from(this.hits)
        };
    }

    /**
     * Deserializza i dati per ricreare una nave
     * @static
     * @param {Object} data - Dati serializzati
     * @returns {Ship} Nave ricreata
     */
    static deserialize(data) {
        const ship = new Ship(data.type, data.position, data.orientation);
        ship.placed = !!data.position;
        if (data.hits) {
            data.hits.forEach(hit => ship.hits.add(hit));
        }
        return ship;
    }

    /**
     * Crea un set completo di navi per una nuova partita
     * @static
     * @returns {Array<Ship>} Array di 5 navi
     */
    static createFleet() {
        return [
            new Ship('CARRIER'),
            new Ship('BATTLESHIP'),
            new Ship('CRUISER'),
            new Ship('SUBMARINE'),
            new Ship('DESTROYER')
        ];
    }

    /**
     * Ottiene informazioni su un tipo di nave
     * @static
     * @param {string} type - Tipo di nave
     * @returns {Object} Informazioni sulla nave
     */
    static getShipInfo(type) {
        return Ship.SHIP_TYPES[type] || null;
    }

    /**
     * Verifica se due navi si sovrappongono
     * @static
     * @param {Ship} ship1 - Prima nave
     * @param {Ship} ship2 - Seconda nave
     * @returns {boolean} true se si sovrappongono
     */
    static doShipsOverlap(ship1, ship2) {
        const coords1 = ship1.getCoordinates();
        const coords2 = ship2.getCoordinates();

        return coords1.some(c1 =>
            coords2.some(c2 => c1.row === c2.row && c1.col === c2.col)
        );
    }
}

// Export per uso in moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ship;
}

// Made with Bob
