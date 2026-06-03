# Regola delle Celle Attigue - Battaglia Navale

## Descrizione

È stata implementata la regola classica della Battaglia Navale per cui **le navi non possono essere posizionate in celle attigue** (adiacenti).

## Dettagli Implementazione

### Cosa significa "celle attigue"?

Una cella è considerata attigua se si trova in una delle 8 posizioni adiacenti (incluse le diagonali):

```
╔═══╦═══╦═══╗
║ ↖ ║ ↑ ║ ↗ ║
╠═══╬═══╬═══╣
║ ← ║ X ║ → ║
╠═══╬═══╬═══╣
║ ↙ ║ ↓ ║ ↘ ║
╚═══╩═══╩═══╝
```

### Esempio Valido

```
  A B C D E
1 ■ ■ ■ . .
2 . . . . .
3 . . . ■ .
4 . . . ■ .
5 . . . . .
```

Le navi in A1-C1 e D3-D4 sono separate da almeno una cella vuota.

### Esempio NON Valido

```
  A B C D E
1 ■ ■ ■ . .
2 . . . ■ .
3 . . . ■ .
4 . . . . .
```

La nave in D2-D3 è troppo vicina alla nave in A1-C1 (diagonale).

## Modifiche al Codice

### File: `frontend/js/grid.js`

#### 1. Nuovo Metodo `hasAdjacentShips()`

```javascript
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
        
        if (this.isValidCoordinate({ row: adjRow, col: adjCol })) {
            const cell = this.cells[adjRow][adjCol];
            if (cell.state === Grid.CELL_STATES.SHIP && cell.ship) {
                return true;
            }
        }
    }
    
    return false;
}
```

#### 2. Aggiornamento `canPlaceShip()`

Il metodo ora include un controllo aggiuntivo:

```javascript
// Verifica celle adiacenti (non devono contenere altre navi)
for (const coord of coordinates) {
    if (this.hasAdjacentShips(coord)) {
        return {
            valid: false,
            reason: 'Le navi non possono essere posizionate in celle attigue'
        };
    }
}
```

#### 3. Aggiornamento `placeShipsRandomly()`

Il numero massimo di tentativi è stato aumentato da 100 a 500 per gestire la maggiore difficoltà nel trovare posizioni valide con la nuova regola.

## Impatto sul Gioco

### Posizionamento Manuale

- Il giocatore riceverà un messaggio di errore se tenta di posizionare una nave troppo vicino a un'altra
- Messaggio: "Le navi non possono essere posizionate in celle attigue"

### Posizionamento Automatico

- L'algoritmo di posizionamento casuale rispetta automaticamente la regola
- Potrebbero essere necessari più tentativi per trovare configurazioni valide

### Modalità Duale

Entrambe le modalità (Rapida e Manuale) rispettano la regola:

- **Modalità Rapida**: Il click viene rifiutato se la posizione viola la regola
- **Modalità Manuale**: La selezione viene validata e mostra un errore se non valida

## Vantaggi della Regola

1. **Più Strategico**: Rende il gioco più impegnativo e strategico
2. **Realismo**: Riflette le regole classiche della Battaglia Navale
3. **Bilanciamento**: Evita configurazioni troppo compatte che renderebbero il gioco troppo facile

## Test

Per testare la regola:

1. Avvia il gioco
2. Prova a posizionare due navi adiacenti (anche in diagonale)
3. Verifica che il sistema impedisca il posizionamento
4. Usa il posizionamento casuale e verifica che tutte le navi siano separate

## Note Tecniche

- La regola si applica a tutte le 8 direzioni (incluse le diagonali)
- Il controllo viene effettuato per ogni cella della nave da posizionare
- La regola è retrocompatibile con i salvataggi esistenti (le navi già posizionate non vengono modificate)

---

**Data Implementazione**: 2026-06-03  
**Versione**: 1.0  
**Autore**: Bob