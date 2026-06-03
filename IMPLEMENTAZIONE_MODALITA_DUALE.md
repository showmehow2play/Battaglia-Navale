# Implementazione Modalità Duale - Codice Completo

## 🎯 Panoramica

Questo documento contiene tutto il codice necessario per implementare la modalità di posizionamento duale (Rapida + Manuale). Basta copiare e incollare i blocchi di codice nei file indicati.

## ⚠️ Importante

Ho già aggiunto le proprietà necessarie a `UIManager`:
```javascript
this.placementMode = 'quick'; // 'quick' o 'manual'
this.selectedCells = []; // Array di {row, col}
this.manualPlacementActive = false;
```

## 📝 Step 1: Modificare HTML

Apri `frontend/index.html` e trova la sezione con id `shipsList` (circa riga 119).

**DOPO** il div `ships-selection`, aggiungi:

```html
<!-- Modalità Posizionamento -->
<div class="placement-mode-section">
    <h3 style="margin: 20px 0 10px 0; font-size: 1rem;">Modalità Posizionamento</h3>
    <div class="placement-mode-toggle">
        <label class="mode-option">
            <input type="radio" name="placementMode" value="quick" checked>
            <div class="mode-content">
                <span class="mode-icon">⚡</span>
                <div>
                    <strong>Rapido</strong>
                    <small>1 click, posizionamento automatico</small>
                </div>
            </div>
        </label>
        <label class="mode-option">
            <input type="radio" name="placementMode" value="manual">
            <div class="mode-content">
                <span class="mode-icon">✋</span>
                <div>
                    <strong>Manuale</strong>
                    <small>Seleziona ogni cella della nave</small>
                </div>
            </div>
        </label>
    </div>
    
    <!-- Controlli modalità manuale -->
    <div id="manualModeControls" style="display: none;">
        <div class="selection-counter" id="selectionCounter">
            0/5 celle selezionate
        </div>
        <div class="selection-hint" id="selectionHint">
            Seleziona le celle sulla stessa riga o colonna
        </div>
        <div class="manual-controls">
            <button class="btn btn-secondary" id="cancelSelectionBtn">
                ❌ Annulla
            </button>
            <button class="btn btn-primary" id="confirmPlacementBtn" disabled>
                ✓ Conferma Posizionamento
            </button>
        </div>
    </div>
</div>
```

## 🎨 Step 2: Aggiungere CSS

Apri `frontend/css/style.css` e aggiungi alla fine:

```css
/* ============================================
   MODALITÀ POSIZIONAMENTO DUALE
   ============================================ */

.placement-mode-section {
    margin-top: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.placement-mode-toggle {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.mode-option {
    display: block;
    padding: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.mode-option:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(102, 126, 234, 0.3);
}

.mode-option input[type="radio"] {
    display: none;
}

.mode-option input[type="radio"]:checked + .mode-content {
    color: #667eea;
}

.mode-option input[type="radio"]:checked ~ * {
    border-color: #667eea;
}

.mode-option:has(input:checked) {
    background: rgba(102, 126, 234, 0.15);
    border-color: #667eea;
}

.mode-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.mode-icon {
    font-size: 24px;
    min-width: 30px;
    text-align: center;
}

.mode-content strong {
    display: block;
    font-size: 0.95rem;
    margin-bottom: 2px;
}

.mode-content small {
    display: block;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
}

/* Controlli modalità manuale */
#manualModeControls {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.selection-counter {
    padding: 10px;
    background: rgba(102, 126, 234, 0.2);
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 8px;
}

.selection-hint {
    padding: 8px;
    background: rgba(255, 193, 7, 0.15);
    border-left: 3px solid #ffc107;
    border-radius: 4px;
    font-size: 0.85rem;
    margin-bottom: 12px;
    color: rgba(255, 255, 255, 0.9);
}

.manual-controls {
    display: flex;
    gap: 10px;
}

.manual-controls button {
    flex: 1;
}

/* Celle selezionate in modalità manuale */
.grid-cell.manual-selected {
    border: 3px solid #48bb78 !important;
    background: rgba(72, 187, 120, 0.3) !important;
    box-shadow: 0 0 15px rgba(72, 187, 120, 0.5);
    animation: pulse-green 1s infinite;
}

.grid-cell.manual-invalid {
    border: 3px solid #f56565 !important;
    background: rgba(245, 101, 101, 0.3) !important;
    box-shadow: 0 0 15px rgba(245, 101, 101, 0.5);
    animation: shake 0.5s;
}

@keyframes pulse-green {
    0%, 100% {
        box-shadow: 0 0 15px rgba(72, 187, 120, 0.5);
    }
    50% {
        box-shadow: 0 0 25px rgba(72, 187, 120, 0.8);
    }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

/* Responsive */
@media (max-width: 768px) {
    .mode-content {
        font-size: 0.9rem;
    }
    
    .mode-icon {
        font-size: 20px;
    }
    
    .manual-controls {
        flex-direction: column;
    }
}
```

## 💻 Step 3: Aggiungere Metodi a app.js

Apri `frontend/js/app.js` e trova il metodo `setupSetupListeners()` (circa riga 68).

**DOPO** il listener del pulsante `startGameBtn`, aggiungi:

```javascript
// Listener toggle modalità posizionamento
document.querySelectorAll('input[name="placementMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        this.ui.placementMode = e.target.value;
        this.ui.selectedCells = [];
        
        // Mostra/nascondi controlli modalità manuale
        const manualControls = document.getElementById('manualModeControls');
        if (e.target.value === 'manual') {
            manualControls.style.display = 'block';
            this.ui.showToast('Modalità Manuale: seleziona ogni cella della nave', 'info', 3000);
        } else {
            manualControls.style.display = 'none';
            this.ui.showToast('Modalità Rapida: 1 click per posizionare', 'info', 2000);
        }
        
        // Aggiorna griglia per rimuovere selezioni
        if (this.game && this.game.playerGrid) {
            this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
        }
    });
});

// Pulsante annulla selezione manuale
document.getElementById('cancelSelectionBtn').addEventListener('click', () => {
    this.cancelManualSelection();
});

// Pulsante conferma posizionamento manuale
document.getElementById('confirmPlacementBtn').addEventListener('click', () => {
    this.confirmManualPlacement();
});
```

Ora trova il metodo `setupGridClickHandler()` (circa riga 172) e **SOSTITUISCI COMPLETAMENTE** con:

```javascript
/**
 * Setup click handler per la griglia di setup
 */
setupGridClickHandler() {
    const cells = this.ui.setupGridElement.querySelectorAll('.grid-cell');
    
    cells.forEach(cell => {
        const clickHandler = () => {
            if (this.ui.selectedShip === null) {
                this.ui.showToast('Seleziona prima una nave!', 'warning');
                return;
            }
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            // Gestisci in base alla modalità
            if (this.ui.placementMode === 'quick') {
                this.handleQuickPlacement(row, col);
            } else {
                this.handleManualPlacement(row, col);
            }
        };
        
        cell.addEventListener('click', clickHandler);
    });
}
```

Ora aggiungi questi nuovi metodi **ALLA FINE** della classe `BattleshipApp` (prima della chiusura della classe):

```javascript
/**
 * Gestisce il posizionamento rapido (1 click)
 */
handleQuickPlacement(row, col) {
    const ship = this.game.playerFleet[this.ui.selectedShip];
    const orientation = this.ui.isHorizontal ? 'horizontal' : 'vertical';
    
    const placed = this.game.playerGrid.placeShip(
        ship,
        { row, col },
        orientation
    );
    
    if (placed) {
        this.ui.showToast(`${ship.name} posizionata!`, 'success');
        this.ui.selectedShip = null;
        
        // Aggiorna UI
        this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
        this.ui.renderShipsList(this.game.playerFleet);
        
        // Controlla se tutte le navi sono posizionate
        if (this.game.playerFleet.every(s => s.placed)) {
            document.getElementById('startGameBtn').disabled = false;
            this.ui.showToast('Tutte le navi posizionate! Pronto per iniziare.', 'success');
        }
    } else {
        this.ui.showToast('Posizione non valida!', 'error');
    }
}

/**
 * Gestisce il posizionamento manuale (N click)
 */
handleManualPlacement(row, col) {
    const ship = this.game.playerFleet[this.ui.selectedShip];
    const cellKey = `${row},${col}`;
    
    // Controlla se la cella è già selezionata
    const index = this.ui.selectedCells.findIndex(c => `${c.row},${c.col}` === cellKey);
    
    if (index >= 0) {
        // Rimuovi cella
        this.ui.selectedCells.splice(index, 1);
        this.ui.showToast('Cella rimossa dalla selezione', 'info', 1000);
    } else {
        // Aggiungi cella
        if (this.ui.selectedCells.length < ship.size) {
            this.ui.selectedCells.push({row, col});
            this.ui.showToast(`Cella aggiunta (${this.ui.selectedCells.length}/${ship.size})`, 'info', 1000);
        } else {
            this.ui.showToast(`Massimo ${ship.size} celle per questa nave!`, 'warning');
            return;
        }
    }
    
    // Valida selezione
    const validation = this.validateManualSelection(ship);
    
    // Aggiorna UI
    this.updateManualSelectionUI(validation);
    
    // Aggiorna contatore
    document.getElementById('selectionCounter').textContent = 
        `${this.ui.selectedCells.length}/${ship.size} celle selezionate`;
    
    // Abilita/disabilita pulsante conferma
    const confirmBtn = document.getElementById('confirmPlacementBtn');
    if (this.ui.selectedCells.length === ship.size && validation.valid) {
        confirmBtn.disabled = false;
        this.ui.showToast('Selezione valida! Clicca Conferma', 'success', 2000);
    } else {
        confirmBtn.disabled = true;
    }
    
    // Aggiorna hint
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

/**
 * Valida la selezione manuale delle celle
 */
validateManualSelection(ship) {
    const cells = this.ui.selectedCells;
    
    if (cells.length === 0) {
        return {valid: true, reason: ''};
    }
    
    if (cells.length !== ship.size) {
        return {valid: false, reason: `Seleziona ${ship.size} celle`};
    }
    
    // Controlla che siano sulla stessa riga O colonna
    const rows = cells.map(c => c.row);
    const cols = cells.map(c => c.col);
    const sameRow = rows.every(r => r === rows[0]);
    const sameCol = cols.every(c => c === cols[0]);
    
    if (!sameRow && !sameCol) {
        return {valid: false, reason: 'Le celle devono essere sulla stessa riga o colonna'};
    }
    
    // Controlla che siano contigue
    if (sameRow) {
        const sortedCols = [...cols].sort((a, b) => a - b);
        for (let i = 1; i < sortedCols.length; i++) {
            if (sortedCols[i] !== sortedCols[i-1] + 1) {
                return {valid: false, reason: 'Le celle devono essere contigue (senza buchi)'};
            }
        }
    } else {
        const sortedRows = [...rows].sort((a, b) => a - b);
        for (let i = 1; i < sortedRows.length; i++) {
            if (sortedRows[i] !== sortedRows[i-1] + 1) {
                return {valid: false, reason: 'Le celle devono essere contigue (senza buchi)'};
            }
        }
    }
    
    // Controlla sovrapposizioni
    for (const cell of cells) {
        const gridCell = this.game.playerGrid.cells[cell.row][cell.col];
        if (gridCell.ship) {
            return {valid: false, reason: 'Sovrapposizione con altra nave'};
        }
    }
    
    return {valid: true, reason: ''};
}

/**
 * Aggiorna l'UI della selezione manuale
 */
updateManualSelectionUI(validation) {
    const cells = this.ui.setupGridElement.querySelectorAll('.grid-cell');
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellKey = `${row},${col}`;
        const isSelected = this.ui.selectedCells.some(c => `${c.row},${c.col}` === cellKey);
        
        // Rimuovi classi precedenti
        cell.classList.remove('manual-selected', 'manual-invalid');
        
        // Aggiungi classe appropriata
        if (isSelected) {
            if (validation.valid || this.ui.selectedCells.length < 2) {
                cell.classList.add('manual-selected');
            } else {
                cell.classList.add('manual-invalid');
            }
        }
    });
}

/**
 * Annulla la selezione manuale corrente
 */
cancelManualSelection() {
    this.ui.selectedCells = [];
    this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
    document.getElementById('selectionCounter').textContent = '0/5 celle selezionate';
    document.getElementById('confirmPlacementBtn').disabled = true;
    this.ui.showToast('Selezione annullata', 'info');
}

/**
 * Conferma il posizionamento manuale
 */
confirmManualPlacement() {
    const ship = this.game.playerFleet[this.ui.selectedShip];
    const cells = this.ui.selectedCells;
    
    if (cells.length !== ship.size) {
        this.ui.showToast('Selezione incompleta!', 'error');
        return;
    }
    
    // Determina posizione iniziale e orientamento
    const rows = cells.map(c => c.row);
    const cols = cells.map(c => c.col);
    const sameRow = rows.every(r => r === rows[0]);
    
    // Ordina le celle
    const sortedCells = sameRow 
        ? [...cells].sort((a, b) => a.col - b.col)
        : [...cells].sort((a, b) => a.row - b.row);
    
    const firstCell = sortedCells[0];
    const orientation = sameRow ? 'horizontal' : 'vertical';
    
    // Posiziona nave
    const placed = this.game.playerGrid.placeShip(ship, firstCell, orientation);
    
    if (placed) {
        this.ui.showToast(`${ship.name} posizionata!`, 'success');
        this.ui.selectedShip = null;
        this.ui.selectedCells = [];
        
        // Aggiorna UI
        this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
        this.ui.renderShipsList(this.game.playerFleet);
        
        // Reset controlli manuali
        document.getElementById('selectionCounter').textContent = '0/5 celle selezionate';
        document.getElementById('confirmPlacementBtn').disabled = true;
        
        // Controlla se tutte le navi sono posizionate
        if (this.game.playerFleet.every(s => s.placed)) {
            document.getElementById('startGameBtn').disabled = false;
            this.ui.showToast('Tutte le navi posizionate! Pronto per iniziare.', 'success');
        }
    } else {
        this.ui.showToast('Errore nel posizionamento!', 'error');
    }
}
```

## ✅ Testing

Dopo aver applicato tutte le modifiche:

1. Ricarica la pagina (F5)
2. Scegli "Gioca vs Computer"
3. Vedrai il toggle "Modalità Posizionamento"
4. Prova entrambe le modalità:
   - **Rapido:** Seleziona nave → 1 click → posizionata
   - **Manuale:** Seleziona nave → click su N celle → Conferma

## 🎉 Fatto!

Ora hai entrambe le modalità di posizionamento funzionanti!