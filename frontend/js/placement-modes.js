/**
 * Placement Modes - Gestione modalità posizionamento duale
 * Questo file estende BattleshipApp con i metodi per la modalità manuale
 */

// Metodi da aggiungere alla classe BattleshipApp

/**
 * Setup listeners per la modalità duale
 * Chiamare questo metodo in setupSetupListeners() dopo il listener di startGameBtn
 */
function setupDualModeListeners() {
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
}

/**
 * Setup click handler modificato per supportare entrambe le modalità
 * SOSTITUISCE il metodo setupGridClickHandler() esistente
 */
function setupGridClickHandler() {
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

/**
 * Gestisce il posizionamento rapido (1 click)
 */
function handleQuickPlacement(row, col) {
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
function handleManualPlacement(row, col) {
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
    const isIncompleteSelection = this.ui.selectedCells.length > 0 && this.ui.selectedCells.length < ship.size;
    if (isIncompleteSelection) {
        hintEl.textContent = 'Inserisci cella successiva';
        hintEl.style.background = 'rgba(16, 185, 129, 0.15)';
        hintEl.style.borderColor = '#10b981';
    } else if (!validation.valid && this.ui.selectedCells.length > 0) {
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
function validateManualSelection(ship) {
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
function updateManualSelectionUI(validation) {
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
            cell.classList.add('manual-selected');
        }
    });
}

/**
 * Annulla la selezione manuale corrente
 */
function cancelManualSelection() {
    this.ui.selectedCells = [];
    this.ui.renderGrid(this.ui.setupGridElement, this.game.playerGrid, true, true);
    this.updateManualSelectionUI({ valid: true });
    
    const ship = this.game.playerFleet[this.ui.selectedShip];
    document.getElementById('selectionCounter').textContent = `0/${ship ? ship.size : 5} celle selezionate`;
    document.getElementById('confirmPlacementBtn').disabled = true;
    this.ui.showToast('Selezione annullata', 'info');
}

/**
 * Conferma il posizionamento manuale
 */
function confirmManualPlacement() {
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

// Esporta i metodi
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupDualModeListeners,
        setupGridClickHandler,
        handleQuickPlacement,
        handleManualPlacement,
        validateManualSelection,
        updateManualSelectionUI,
        cancelManualSelection,
        confirmManualPlacement
    };
}

// Made with Bob
