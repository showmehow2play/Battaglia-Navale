/**
 * Utility Functions - Funzioni di utilità per il gioco
 * 
 * @module utils
 * @description Funzioni helper comuni utilizzate in tutto il progetto
 */

const Utils = {
    /**
     * Genera un ID univoco
     * @param {string} prefix - Prefisso opzionale
     * @returns {string} ID univoco
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Formatta il tempo in mm:ss
     * @param {number} milliseconds - Millisecondi
     * @returns {string} Tempo formattato
     */
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    /**
     * Formatta la durata in formato leggibile
     * @param {number} milliseconds - Millisecondi
     * @returns {string} Durata formattata
     */
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    },

    /**
     * Debounce function
     * @param {Function} func - Funzione da debounce
     * @param {number} wait - Millisecondi di attesa
     * @returns {Function} Funzione debounced
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     * @param {Function} func - Funzione da throttle
     * @param {number} limit - Millisecondi di limite
     * @returns {Function} Funzione throttled
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Deep clone di un oggetto
     * @param {*} obj - Oggetto da clonare
     * @returns {*} Oggetto clonato
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (obj instanceof Set) return new Set(Array.from(obj).map(item => Utils.deepClone(item)));
        if (obj instanceof Map) {
            return new Map(Array.from(obj.entries()).map(([key, val]) => 
                [Utils.deepClone(key), Utils.deepClone(val)]
            ));
        }
        
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = Utils.deepClone(obj[key]);
            }
        }
        return clonedObj;
    },

    /**
     * Salva dati nel localStorage
     * @param {string} key - Chiave
     * @param {*} data - Dati da salvare
     * @returns {boolean} true se salvato con successo
     */
    saveToLocalStorage(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Errore nel salvataggio localStorage:', error);
            return false;
        }
    },

    /**
     * Carica dati dal localStorage
     * @param {string} key - Chiave
     * @param {*} defaultValue - Valore di default se non trovato
     * @returns {*} Dati caricati o default
     */
    loadFromLocalStorage(key, defaultValue = null) {
        try {
            const serialized = localStorage.getItem(key);
            if (serialized === null) return defaultValue;
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Errore nel caricamento localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Rimuove dati dal localStorage
     * @param {string} key - Chiave
     */
    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Errore nella rimozione localStorage:', error);
        }
    },

    /**
     * Pulisce tutto il localStorage
     */
    clearLocalStorage() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Errore nella pulizia localStorage:', error);
        }
    },

    /**
     * Verifica se il localStorage è disponibile
     * @returns {boolean} true se disponibile
     */
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Genera un numero casuale tra min e max (inclusi)
     * @param {number} min - Minimo
     * @param {number} max - Massimo
     * @returns {number} Numero casuale
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Sceglie un elemento casuale da un array
     * @param {Array} array - Array
     * @returns {*} Elemento casuale
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Mescola un array (Fisher-Yates shuffle)
     * @param {Array} array - Array da mescolare
     * @returns {Array} Array mescolato
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Calcola la distanza Manhattan tra due punti
     * @param {Object} p1 - Punto 1 {row, col}
     * @param {Object} p2 - Punto 2 {row, col}
     * @returns {number} Distanza
     */
    manhattanDistance(p1, p2) {
        return Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col);
    },

    /**
     * Ottiene le celle adiacenti (4 direzioni)
     * @param {Object} coord - Coordinata {row, col}
     * @param {number} gridSize - Dimensione griglia
     * @returns {Array<Object>} Array di coordinate adiacenti
     */
    getAdjacentCells(coord, gridSize = 10) {
        const adjacent = [];
        const directions = [
            { row: -1, col: 0 },  // Su
            { row: 1, col: 0 },   // Giù
            { row: 0, col: -1 },  // Sinistra
            { row: 0, col: 1 }    // Destra
        ];

        for (const dir of directions) {
            const newRow = coord.row + dir.row;
            const newCol = coord.col + dir.col;
            
            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                adjacent.push({ row: newRow, col: newCol });
            }
        }

        return adjacent;
    },

    /**
     * Ottiene le celle adiacenti diagonali (8 direzioni)
     * @param {Object} coord - Coordinata {row, col}
     * @param {number} gridSize - Dimensione griglia
     * @returns {Array<Object>} Array di coordinate adiacenti
     */
    getAllAdjacentCells(coord, gridSize = 10) {
        const adjacent = [];
        const directions = [
            { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
            { row: 0, col: -1 },                        { row: 0, col: 1 },
            { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
        ];

        for (const dir of directions) {
            const newRow = coord.row + dir.row;
            const newCol = coord.col + dir.col;
            
            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                adjacent.push({ row: newRow, col: newCol });
            }
        }

        return adjacent;
    },

    /**
     * Verifica se due coordinate sono uguali
     * @param {Object} coord1 - Coordinata 1 {row, col}
     * @param {Object} coord2 - Coordinata 2 {row, col}
     * @returns {boolean} true se uguali
     */
    coordsEqual(coord1, coord2) {
        return coord1.row === coord2.row && coord1.col === coord2.col;
    },

    /**
     * Converte coordinate in stringa chiave
     * @param {Object} coord - Coordinata {row, col}
     * @returns {string} Chiave "row,col"
     */
    coordToKey(coord) {
        return `${coord.row},${coord.col}`;
    },

    /**
     * Converte stringa chiave in coordinate
     * @param {string} key - Chiave "row,col"
     * @returns {Object} Coordinata {row, col}
     */
    keyToCoord(key) {
        const [row, col] = key.split(',').map(Number);
        return { row, col };
    },

    /**
     * Copia testo negli appunti
     * @param {string} text - Testo da copiare
     * @returns {Promise<boolean>} true se copiato
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback per browser più vecchi
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            }
        } catch (error) {
            console.error('Errore nella copia negli appunti:', error);
            return false;
        }
    },

    /**
     * Mostra una notifica toast
     * @param {string} message - Messaggio
     * @param {string} type - Tipo (success, error, info, warning)
     * @param {number} duration - Durata in ms
     */
    showToast(message, type = 'info', duration = 3000) {
        // Crea elemento toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        // Rimuovi dopo duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    },

    /**
     * Valida un indirizzo email
     * @param {string} email - Email da validare
     * @returns {boolean} true se valida
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Sanitizza una stringa HTML
     * @param {string} str - Stringa da sanitizzare
     * @returns {string} Stringa sanitizzata
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Ottiene parametri URL
     * @returns {Object} Oggetto con parametri URL
     */
    getURLParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    },

    /**
     * Aggiorna parametri URL senza ricaricare
     * @param {Object} params - Parametri da aggiornare
     */
    updateURLParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, params[key]);
            }
        });
        window.history.pushState({}, '', url);
    },

    /**
     * Verifica se il dispositivo è mobile
     * @returns {boolean} true se mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Verifica se il dispositivo è touch
     * @returns {boolean} true se touch
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * Ottiene informazioni sul browser
     * @returns {Object} Info browser
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') > -1) browser = 'Safari';
        else if (ua.indexOf('Edge') > -1) browser = 'Edge';
        else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browser = 'IE';
        
        return {
            browser,
            userAgent: ua,
            isMobile: Utils.isMobile(),
            isTouch: Utils.isTouchDevice()
        };
    }
};

// Export per uso in moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Made with Bob
