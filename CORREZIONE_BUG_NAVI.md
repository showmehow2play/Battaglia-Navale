# Correzione Bug: Navi Non Visualizzate nel Setup

## Problema Riscontrato
Quando si apriva la modalità gioco, la schermata di setup chiedeva di posizionare le navi ma non mostrava la lista delle navi disponibili, causando un errore.

## Causa del Bug
Il bug era causato da due problemi nel codice:

### 1. Riferimento Errato all'Array delle Navi
In `frontend/js/app.js`, il metodo `startSetup()` chiamava:
```javascript
this.ui.renderShipsList(this.game.playerGrid.ships);
```

Ma `playerGrid.ships` è un array vuoto all'inizio! Le navi non posizionate sono in `playerFleet`.

**Architettura Corretta:**
- `game.playerFleet` = array con TUTTE le 5 navi (posizionate o no)
- `grid.ships` = array con solo le navi GIÀ posizionate sulla griglia
- Quando si chiama `grid.placeShip(ship)`, la nave viene aggiunta a `grid.ships` ma rimane anche in `playerFleet`

### 2. Nome Proprietà Errato
In `frontend/js/ui.js`, il metodo `renderShipsList()` usava:
```javascript
if (ship.isPlaced) { ... }
```

Ma la proprietà corretta è `ship.placed`, non `ship.isPlaced`.

## Correzioni Applicate

### File: `frontend/js/app.js`
Corretti 6 riferimenti da `playerGrid.ships` / `opponentGrid.ships` / `enemyGrid.ships` a `playerFleet` / `opponentFleet`:

1. **Riga 158** - `startSetup()`: 
   - Prima: `this.ui.renderShipsList(this.game.playerGrid.ships)`
   - Dopo: `this.ui.renderShipsList(this.game.playerFleet)`

2. **Riga 182** - `setupGridClickHandler()`:
   - Prima: `const ship = this.game.playerGrid.ships[this.ui.selectedShip]`
   - Dopo: `const ship = this.game.playerFleet[this.ui.selectedShip]`

3. **Riga 198** - Aggiornamento UI dopo posizionamento:
   - Prima: `this.ui.renderShipsList(this.game.playerGrid.ships)`
   - Dopo: `this.ui.renderShipsList(this.game.playerFleet)`

4. **Riga 228** - Posizionamento casuale:
   - Prima: `this.ui.renderShipsList(this.game.playerGrid.ships)`
   - Dopo: `this.ui.renderShipsList(this.game.playerFleet)`

5. **Riga 270** - Inizio partita:
   - Prima: `this.ui.renderEnemyShipsList(this.game.enemyGrid.ships)`
   - Dopo: `this.ui.renderEnemyShipsList(this.game.opponentFleet)`

6. **Riga 303** - Aggiornamento dopo attacco:
   - Prima: `this.ui.renderEnemyShipsList(this.game.enemyGrid.ships)`
   - Dopo: `this.ui.renderEnemyShipsList(this.game.opponentFleet)`

7. **Riga 534** - Serializzazione setup online:
   - Prima: `ships: this.game.playerGrid.ships.map(...)`
   - Dopo: `ships: this.game.playerFleet.map(...)`

### File: `frontend/js/ui.js`
Corretti 4 riferimenti da `ship.isPlaced` a `ship.placed`:

1. **Riga 176** - Check per classe CSS:
   - Prima: `if (ship.isPlaced) { shipItem.classList.add('placed'); }`
   - Dopo: `if (ship.placed) { shipItem.classList.add('placed'); }`

2. **Riga 188** - Icona stato nave:
   - Prima: `${ship.isPlaced ? '✓' : '○'}`
   - Dopo: `${ship.placed ? '✓' : '○'}`

3. **Riga 192** - Event listener condizionale:
   - Prima: `if (!ship.isPlaced) { ... }`
   - Dopo: `if (!ship.placed) { ... }`

4. **Riga 213** - Metodo `selectShip()`:
   - Prima: `if (shipItem && !ships[index].isPlaced) { ... }`
   - Dopo: `if (shipItem && !ships[index].placed) { ... }`

## Risultato
Ora quando si apre la modalità gioco:
1. ✅ Vengono visualizzate tutte e 5 le navi disponibili
2. ✅ Si può cliccare su una nave per selezionarla
3. ✅ Si può posizionare la nave sulla griglia
4. ✅ Le navi posizionate mostrano il segno ✓
5. ✅ Le navi non posizionate mostrano il segno ○
6. ✅ Il pulsante "Inizia Partita" si abilita quando tutte le navi sono posizionate

## Test Consigliati
1. Avviare il gioco con `./avvia-gioco.sh`
2. Selezionare "Gioca vs Computer"
3. Verificare che appaiano le 5 navi: Portaerei (5), Corazzata (4), Incrociatore (3), Sottomarino (3), Cacciatorpediniere (2)
4. Posizionare manualmente tutte le navi
5. Provare il pulsante "Posizionamento Casuale"
6. Verificare che il pulsante "Inizia Partita" si abiliti correttamente