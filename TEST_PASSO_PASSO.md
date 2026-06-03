# 🧪 Test Passo-Passo - Multiplayer

## ⚠️ IMPORTANTE: Hard Refresh!

Dopo il push su GitHub, **DEVI** fare hard refresh per vedere le modifiche:
- **Windows/Linux**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R

Oppure:
- Apri DevTools (F12) → Network → Spunta "Disable cache"
- Oppure: Modalità Incognito

---

## 📋 Test Completo - Segui Esattamente Questi Passi

### PASSO 1: Prepara i Browser

#### Browser 1 (Chrome):
1. Apri Chrome
2. Vai su: `https://showmehow2play.github.io/Battaglia-Navale/frontend/`
3. Premi **Ctrl+Shift+R** (o Cmd+Shift+R su Mac)
4. Aspetta che la pagina si carichi completamente
5. Apri Console (F12) per vedere eventuali errori

#### Browser 2 (Firefox o Safari):
1. Apri Firefox/Safari
2. Vai su: `https://showmehow2play.github.io/Battaglia-Navale/frontend/`
3. Premi **Ctrl+Shift+R** (o Cmd+Shift+R su Mac)
4. Aspetta che la pagina si carichi completamente
5. Apri Console (F12) per vedere eventuali errori

---

### PASSO 2: Verifica PeerJS (IMPORTANTE!)

In **entrambi i browser**, apri la Console (F12) e scrivi:
```javascript
typeof Peer
```

**Deve rispondere**: `"function"`

Se risponde `"undefined"`:
- ❌ PeerJS non è caricato
- Fai hard refresh di nuovo
- Controlla che `frontend/js/peerjs.min.js` esista su GitHub

---

### PASSO 3: Crea Partita (Browser 1)

#### Nel Browser 1 (Chrome):
1. Clicca "⚡ Crea Partita Live"
2. **Aspetta 2-3 secondi**
3. Dovresti vedere:
   - ✅ Toast: "Partita live creata. Condividi questo codice: [CODICE]"
   - ✅ La schermata cambia e vedi la griglia per posizionare le navi
   - ✅ In alto vedi: "Partita live: condividi il codice [CODICE]"

4. **COPIA IL CODICE** (es. `abc123xyz`)
5. **NON posizionare ancora le navi**
6. **Lascia questa finestra aperta**

#### Se NON vedi la schermata di setup:
- ❌ Le modifiche non sono state caricate
- Fai hard refresh (Ctrl+Shift+R)
- Controlla la Console per errori

---

### PASSO 4: Entra con Codice (Browser 2)

#### Nel Browser 2 (Firefox/Safari):
1. Clicca "🔑 Entra con Codice"
2. Si apre un modal
3. **Incolla il codice** copiato dal Browser 1
4. Clicca "Entra"
5. **Aspetta 2-3 secondi**
6. Dovresti vedere:
   - ✅ Toast: "Connesso alla stanza!"
   - ✅ La schermata cambia e vedi la griglia per posizionare le navi

#### Se vedi "Errore di connessione: Codice stanza mancante":
- ❌ Il codice non è stato inserito correttamente
- Riprova: copia di nuovo il codice e incollalo
- Assicurati di non avere spazi prima/dopo il codice

#### Se vedi "Timeout connessione stanza":
- ❌ Il Browser 1 ha chiuso la connessione
- Ricomincia da PASSO 3

---

### PASSO 5: Connessione Stabilita

#### In ENTRAMBI i browser dovresti vedere:
- ✅ Browser 1: Toast "Avversario connesso! Inizia il setup."
- ✅ Browser 2: Toast "Connesso alla stanza!"
- ✅ Entrambi: Schermata di setup con griglia e navi

---

### PASSO 6: Posiziona le Navi

#### Browser 1:
1. Clicca su una nave (es. Portaerei)
2. Clicca sulla griglia per posizionarla
3. Ripeti per tutte le 5 navi
4. Clicca "Inizia Partita"
5. Vedi: "Setup completato. In attesa dell'avversario..."

#### Browser 2:
1. Clicca su una nave
2. Clicca sulla griglia per posizionarla
3. Ripeti per tutte le 5 navi
4. Clicca "Inizia Partita"

---

### PASSO 7: Partita Inizia!

#### Entrambi i browser dovrebbero:
- ✅ Mostrare la schermata di gioco con 2 griglie
- ✅ Griglia sinistra: Griglia Nemica (per attaccare)
- ✅ Griglia destra: La Mia Flotta (le tue navi)
- ✅ Chat attiva
- ✅ Indicatore turno: "È il tuo turno" o "Turno avversario"

---

## 🐛 Troubleshooting

### Problema: "Errore di connessione: Codice stanza mancante"

**Causa**: Il codice non è stato inserito o è vuoto

**Soluzione**:
1. Assicurati di aver copiato il codice completo
2. Incolla nel campo e verifica che non ci siano spazi
3. Il codice dovrebbe essere tipo: `abc123xyz` (lungo, senza spazi)

---

### Problema: "Avversario disconnesso" (ripetuto)

**Causa**: Stai provando a connetterti a te stesso o il Browser 1 ha chiuso

**Soluzione**:
1. Usa DUE browser diversi (Chrome + Firefox)
2. NON chiudere il Browser 1 mentre il Browser 2 si connette
3. Aspetta che entrambi vedano "Avversario connesso"

---

### Problema: Schermata setup non appare

**Causa**: Cache del browser o modifiche non caricate

**Soluzione**:
1. Hard refresh: Ctrl+Shift+R
2. Oppure: Modalità Incognito
3. Verifica su GitHub che `frontend/js/app.js` sia aggiornato

---

### Problema: "typeof Peer" risponde "undefined"

**Causa**: PeerJS non è caricato

**Soluzione**:
1. Verifica che `frontend/js/peerjs.min.js` esista su GitHub
2. Verifica che `frontend/index.html` contenga:
   ```html
   <script src="js/peerjs.min.js"></script>
   ```
3. Hard refresh
4. Controlla Network tab (F12) per vedere se `peerjs.min.js` viene caricato

---

## ✅ Checklist Veloce

Prima di testare:
- [ ] Fatto push su GitHub
- [ ] Aspettato 5 minuti
- [ ] Aperto 2 browser DIVERSI
- [ ] Fatto hard refresh in ENTRAMBI (Ctrl+Shift+R)
- [ ] Verificato `typeof Peer` in entrambi → risponde `"function"`

Durante il test:
- [ ] Browser 1: Crea Partita → Vede schermata setup
- [ ] Browser 1: Copia il codice
- [ ] Browser 2: Entra con Codice → Incolla codice
- [ ] Browser 2: Vede schermata setup
- [ ] Entrambi: Vedono "Avversario connesso"
- [ ] Entrambi: Posizionano navi
- [ ] Entrambi: Cliccano "Inizia Partita"
- [ ] Partita inizia! 🎉

---

## 📸 Screenshot Attesi

### Dopo "Crea Partita Live":
```
┌─────────────────────────────────────┐
│ ✓ Partita live creata.              │
│   Condividi questo codice: abc123xyz│
└─────────────────────────────────────┘

Posiziona le tue navi
Partita live: condividi il codice abc123xyz

[Griglia 10x10 con navi da posizionare]
```

### Dopo "Entra con Codice":
```
┌─────────────────────────────────────┐
│ ✓ Connesso alla stanza!             │
└─────────────────────────────────────┘

Posiziona le tue navi

[Griglia 10x10 con navi da posizionare]
```

### Dopo entrambi pronti:
```
┌─────────────────────────────────────┐
│ ✓ Partita iniziata! Tocca a te.    │
└─────────────────────────────────────┘

[Griglia Nemica]  [La Mia Flotta]
[Chat attiva]
```

---

## 🎯 Se Ancora Non Funziona

Manda questi dettagli:
1. Screenshot della Console (F12) di entrambi i browser
2. Risultato di `typeof Peer` in entrambi
3. Screenshot del Network tab (F12) → cerca `peerjs.min.js`
4. Esatto messaggio di errore che vedi

---

**Ultimo aggiornamento**: 3 Giugno 2026  
**Versione**: 1.0 - Test Passo-Passo