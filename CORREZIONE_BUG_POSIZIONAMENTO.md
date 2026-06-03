# Correzione Bug: Posizionamento Navi

## 🐛 Problema Riscontrato

Quando si prova a posizionare la prima nave sulla griglia durante il setup, appare l'errore:
```
❌ Posizione non valida!
```

Anche se la posizione è valida e la nave dovrebbe essere posizionabile.

## 🔍 Causa del Bug

Il metodo `placeShip()` della classe `Grid` si aspetta 3 parametri:
```javascript
placeShip(ship, position, orientation)
```

Dove:
- `ship` - L'oggetto nave da posizionare
- `position` - Un **oggetto** con formato `{row, col}`
- `orientation` - Una **stringa** `'horizontal'` o `'vertical'`

Ma nel codice di `app.js` (riga 187-192), i parametri venivano passati in modo errato:
```javascript
// ❌ SBAGLIATO
const placed = this.game.playerGrid.placeShip(
    ship,
    row,              // ❌ Passato come numero, non come oggetto
    col,              // ❌ Passato come numero separato
    this.ui.isHorizontal  // ❌ Passato come boolean, non come stringa
);
```

## ✅ Soluzione

Corretto il passaggio dei parametri in `app.js`:

```javascript
// ✅ CORRETTO
const orientation = this.ui.isHorizontal ? 'horizontal' : 'vertical';
const placed = this.game.playerGrid.placeShip(
    ship,
    { row, col },     // ✅ Oggetto con row e col
    orientation       // ✅ Stringa 'horizontal' o 'vertical'
);
```

## 📝 File Modificato

**File:** `frontend/js/app.js`  
**Righe:** 182-192  
**Metodo:** `setupGridClickHandler()`

### Prima (Errato)
```javascript
const row = parseInt(cell.dataset.row);
const col = parseInt(cell.dataset.col);
const ship = this.game.playerFleet[this.ui.selectedShip];

// Prova a posizionare la nave
const placed = this.game.playerGrid.placeShip(
    ship,
    row,
    col,
    this.ui.isHorizontal
);
```

### Dopo (Corretto)
```javascript
const row = parseInt(cell.dataset.row);
const col = parseInt(cell.dataset.col);
const ship = this.game.playerFleet[this.ui.selectedShip];

// Prova a posizionare la nave
const orientation = this.ui.isHorizontal ? 'horizontal' : 'vertical';
const placed = this.game.playerGrid.placeShip(
    ship,
    { row, col },
    orientation
);
```

## 🧪 Come Testare

1. Avvia il gioco: `./avvia-gioco.sh` o `avvia-gioco.bat`
2. Scegli "Gioca vs Computer" (qualsiasi difficoltà)
3. Clicca su "Portaerei" nella lista navi
4. Clicca su una cella della griglia
5. ✅ La nave dovrebbe essere posizionata correttamente
6. Ripeti per tutte le 5 navi
7. ✅ Il pulsante "Inizia Partita" dovrebbe attivarsi

## 🔍 Verifica Altri Usi

Ho verificato tutti gli altri usi di `placeShip()` nel codice:

### ✅ grid.js (riga 313) - Corretto
```javascript
placed = this.placeShip(ship, { row, col }, orientation);
```

### ✅ grid.js (riga 421) - Corretto
```javascript
grid.placeShip(ship, ship.position, ship.orientation);
```

### ✅ game-engine.js (riga 147) - Corretto
```javascript
const placed = this.playerGrid.placeShip(ship, position, orientation);
```

Tutti gli altri usi erano già corretti!

## 📊 Impatto

- **Gravità:** 🔴 Critica (impediva di giocare)
- **Componenti affetti:** Setup navi
- **Utenti impattati:** 100% (tutti)
- **Tempo per fix:** ~2 minuti
- **Testing richiesto:** Posizionamento manuale e casuale

## ✅ Risultato

Ora il posizionamento delle navi funziona correttamente:
- ✅ Click su nave → seleziona
- ✅ Click su griglia → posiziona
- ✅ Validazione corretta (dentro griglia, no sovrapposizioni)
- ✅ Feedback visivo (nave appare sulla griglia)
- ✅ Toast notification di successo
- ✅ Pulsante "Inizia Partita" si attiva quando tutte le navi sono posizionate

## 🎯 Lezioni Apprese

1. **Verificare sempre le firme dei metodi** prima di chiamarli
2. **TypeScript avrebbe prevenuto questo errore** con type checking
3. **Test unitari** avrebbero catturato il bug prima del deploy
4. **Console.log** durante lo sviluppo aiuta a debuggare

## 📚 Riferimenti

- **Classe Grid:** `frontend/js/grid.js` (riga 126)
- **Metodo placeShip:** Documentato con JSDoc
- **Classe Ship:** `frontend/js/ship.js`
- **Orientamenti:** Definiti in `Ship.ORIENTATIONS`

## 🔄 Storia Bug

1. **Scoperto:** 2026-06-03 durante test utente
2. **Causa identificata:** Parametri errati in `setupGridClickHandler()`
3. **Fix applicato:** 2026-06-03
4. **Testato:** ✅ Funziona correttamente
5. **Documentato:** Questo file

---

**Nota:** Questo è il secondo bug critico risolto. Il primo era "Navi non visualizzate" (vedi `CORREZIONE_BUG_NAVI.md`).