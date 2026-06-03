# Specifica: Sistema di Posizionamento Duale

## 🎯 Obiettivo

Implementare due modalità di posizionamento delle navi:
1. **Modalità Rapida** (1 click) - Attuale, standard Battaglia Navale
2. **Modalità Manuale** (N click) - Nuova, selezione cella per cella

## 📋 Requisiti

### Modalità Rapida (Attuale)
- ✅ Seleziona nave
- ✅ Clicca su 1 cella
- ✅ Nave si posiziona automaticamente (orizzontale/verticale)
- ✅ Pulsante "Ruota" per cambiare orientamento

### Modalità Manuale (Nuova)
- ⭐ Seleziona nave
- ⭐ Clicca su N celle (dove N = lunghezza nave)
- ⭐ Celle devono essere sulla stessa riga O colonna
- ⭐ Celle devono essere contigue (no buchi)
- ⭐ Feedback visivo durante la selezione
- ⭐ Possibilità di annullare e ricominciare

## 🎨 UI/UX

### Toggle Modalità
Aggiungere un pulsante nel pannello setup:
```
[ ] Modalità Rapida (1 click)
[x] Modalità Manuale (selezione celle)
```

### Feedback Visivo Modalità Manuale
- **Cella selezionata:** Bordo verde
- **Selezione valida:** Tutte le celle verdi
- **Selezione invalida:** Celle rosse
- **Contatore:** "2/5 celle selezionate"

### Controlli
- **Click su cella:** Aggiunge/rimuove dalla selezione
- **Pulsante "Annulla":** Cancella selezione corrente
- **Pulsante "Conferma":** Posiziona nave (solo se selezione valida)

## 🔧 Implementazione

### 1. Aggiungere Stato UI
```javascript
// In UIManager
this.placementMode = 'quick'; // 'quick' o 'manual'
this.selectedCells = []; // Array di {row, col} per modalità manuale
```

### 2. Aggiungere Toggle UI
```html
<div class="placement-mode-toggle">
    <label>
        <input type="radio" name="placementMode" value="quick" checked>
        Rapido (1 click)
    </label>
    <label>
        <input type="radio" name="placementMode" value="manual">
        Manuale (selezione celle)
    </label>
</div>
```

### 3. Modificare Click Handler
```javascript
setupGridClickHandler() {
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (this.ui.placementMode === 'quick') {
                this.handleQuickPlacement(cell);
            } else {
                this.handleManualPlacement(cell);
            }
        });
    });
}
```

### 4. Implementare Modalità Manuale
```javascript
handleManualPlacement(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const ship = this.game.playerFleet[this.ui.selectedShip];
    
    // Aggiungi/rimuovi cella dalla selezione
    const cellKey = `${row},${col}`;
    const index = this.ui.selectedCells.findIndex(c => `${c.row},${c.col}` === cellKey);
    
    if (index >= 0) {
        // Rimuovi cella
        this.ui.selectedCells.splice(index, 1);
    } else {
        // Aggiungi cella
        if (this.ui.selectedCells.length < ship.size) {
            this.ui.selectedCells.push({row, col});
        }
    }
    
    // Valida selezione
    const validation = this.validateManualSelection(ship);
    
    // Aggiorna UI
    this.updateManualSelectionUI(validation);
    
    // Se selezione completa e valida, abilita conferma
    if (this.ui.selectedCells.length === ship.size && validation.valid) {
        document.getElementById('confirmPlacementBtn').disabled = false;
    }
}
```

### 5. Validazione Selezione Manuale
```javascript
validateManualSelection(ship) {
    const cells = this.ui.selectedCells;
    
    // Controlla numero celle
    if (cells.length !== ship.size) {
        return {valid: false, reason: 'Numero celle errato'};
    }
    
    // Controlla che siano sulla stessa riga O colonna
    const rows = cells.map(c => c.row);
    const cols = cells.map(c => c.col);
    const sameRow = rows.every(r => r === rows[0]);
    const sameCol = cols.every(c => c === cols[0]);
    
    if (!sameRow && !sameCol) {
        return {valid: false, reason: 'Celle devono essere sulla stessa riga o colonna'};
    }
    
    // Controlla che siano contigue
    if (sameRow) {
        cols.sort((a, b) => a - b);
        for (let i = 1; i < cols.length; i++) {
            if (cols[i] !== cols[i-1] + 1) {
                return {valid: false, reason: 'Celle devono essere contigue'};
            }
        }
    } else {
        rows.sort((a, b) => a - b);
        for (let i = 1; i < rows.length; i++) {
            if (rows[i] !== rows[i-1] + 1) {
                return {valid: false, reason: 'Celle devono essere contigue'};
            }
        }
    }
    
    // Controlla sovrapposizioni
    for (const cell of cells) {
        if (this.game.playerGrid.cells[cell.row][cell.col].ship) {
            return {valid: false, reason: 'Sovrapposizione con altra nave'};
        }
    }
    
    return {valid: true};
}
```

### 6. Conferma Posizionamento Manuale
```javascript
confirmManualPlacement() {
    const ship = this.game.playerFleet[this.ui.selectedShip];
    const cells = this.ui.selectedCells;
    
    // Determina posizione e orientamento
    const firstCell = cells[0];
    const orientation = cells.every(c => c.row === firstCell.row) ? 'horizontal' : 'vertical';
    
    // Posiziona nave
    const placed = this.game.playerGrid.placeShip(ship, firstCell, orientation);
    
    if (placed) {
        this.ui.showToast(`${ship.name} posizionata!`, 'success');
        this.ui.selectedShip = null;
        this.ui.selectedCells = [];
        this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
        this.ui.renderShipsList(this.game.playerFleet);
    }
}
```

## 🎨 CSS Aggiuntivo

```css
/* Toggle modalità */
.placement-mode-toggle {
    margin: 15px 0;
    padding: 10px;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
}

.placement-mode-toggle label {
    display: block;
    margin: 5px 0;
    cursor: pointer;
}

/* Celle selezionate in modalità manuale */
.grid-cell.manual-selected {
    border: 3px solid #48bb78;
    background: rgba(72, 187, 120, 0.3);
}

.grid-cell.manual-invalid {
    border: 3px solid #f56565;
    background: rgba(245, 101, 101, 0.3);
}

/* Contatore selezione */
.selection-counter {
    margin: 10px 0;
    padding: 8px;
    background: rgba(102, 126, 234, 0.2);
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
}

/* Pulsanti modalità manuale */
.manual-controls {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.manual-controls button {
    flex: 1;
}
```

## 📝 Modifiche HTML

Aggiungere nel pannello setup (dopo la lista navi):

```html
<div class="placement-mode-section">
    <h4>Modalità Posizionamento</h4>
    <div class="placement-mode-toggle">
        <label>
            <input type="radio" name="placementMode" value="quick" checked>
            <span>⚡ Rapido</span>
            <small>Clicca 1 volta, nave si posiziona automaticamente</small>
        </label>
        <label>
            <input type="radio" name="placementMode" value="manual">
            <span>✋ Manuale</span>
            <small>Seleziona ogni cella della nave</small>
        </label>
    </div>
    
    <div id="manualModeControls" style="display: none;">
        <div class="selection-counter" id="selectionCounter">
            0/5 celle selezionate
        </div>
        <div class="manual-controls">
            <button class="btn btn-secondary" id="cancelSelectionBtn">
                ❌ Annulla
            </button>
            <button class="btn btn-primary" id="confirmPlacementBtn" disabled>
                ✓ Conferma
            </button>
        </div>
    </div>
</div>
```

## 🧪 Testing

### Test Modalità Rapida
- [ ] Seleziona nave
- [ ] Click su cella
- [ ] Nave si posiziona correttamente
- [ ] Pulsante ruota funziona
- [ ] Validazione posizione

### Test Modalità Manuale
- [ ] Seleziona nave
- [ ] Click su 5 celle sulla stessa riga → valido
- [ ] Click su 5 celle sulla stessa colonna → valido
- [ ] Click su celle non contigue → invalido
- [ ] Click su celle su righe/colonne diverse → invalido
- [ ] Sovrapposizione → invalido
- [ ] Annulla selezione funziona
- [ ] Conferma posiziona nave

## 🚀 Priorità Implementazione

1. **Prima:** Risolvere bug selezione navi successive
2. **Poi:** Aggiungere toggle modalità
3. **Poi:** Implementare modalità manuale
4. **Infine:** Testing completo

## 📊 Stima Tempo

- Bug fix selezione navi: 10 minuti
- Toggle modalità: 15 minuti
- Modalità manuale: 45 minuti
- CSS e UI: 20 minuti
- Testing: 30 minuti
- **Totale:** ~2 ore

## 💡 Note

- La modalità rapida rimane quella di default (più veloce)
- La modalità manuale è per chi vuole più controllo
- Entrambe devono validare le stesse regole
- Il pulsante "Posizionamento Casuale" usa sempre modalità rapida