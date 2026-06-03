# 🔧 Soluzione: Menu Online Non Visibile su GitHub Pages

## 🎯 Problema Identificato

Il menu "Gioca Online in 2" **non appare** quando apri il gioco da GitHub Pages, ma **funziona in locale**.

**URL GitHub Pages**: https://showmehow2play.github.io/Battaglia-Navale/

## 🔍 Causa del Problema

Ci sono 3 possibili cause:

### 1. **Stai guardando il launcher, non il gioco**
- URL launcher: `https://showmehow2play.github.io/Battaglia-Navale/`
- URL gioco: `https://showmehow2play.github.io/Battaglia-Navale/frontend/`

Il launcher (`index.html` nella root) è solo una pagina di benvenuto. Il gioco vero è in `frontend/index.html`.

### 2. **PeerJS non si carica da CDN**
Il file `frontend/index.html` carica PeerJS da:
```html
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
```

Se GitHub Pages blocca questo CDN o c'è un errore CORS, il menu online non appare.

### 3. **JavaScript nasconde il menu se PeerJS non è disponibile**
Il codice potrebbe nascondere automaticamente il menu online se rileva che PeerJS non è caricato.

---

## ✅ Soluzione 1: Verifica l'URL Corretto

### Passo 1: Apri l'URL Completo
Invece di:
```
https://showmehow2play.github.io/Battaglia-Navale/
```

Apri:
```
https://showmehow2play.github.io/Battaglia-Navale/frontend/
```

### Passo 2: Verifica il Menu
Dovresti vedere:
- 🤖 Gioca vs Computer
- 🌐 Gioca Online in 2 ← **Questo deve essere visibile!**

---

## ✅ Soluzione 2: Verifica PeerJS nella Console

### Passo 1: Apri la Console
1. Vai su: https://showmehow2play.github.io/Battaglia-Navale/frontend/
2. Premi **F12** (o Cmd+Option+I su Mac)
3. Vai alla tab **Console**

### Passo 2: Controlla gli Errori
Cerca errori tipo:
```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
Uncaught ReferenceError: Peer is not defined
```

### Passo 3: Testa PeerJS
Nella console, scrivi:
```javascript
typeof Peer
```

**Risultato atteso**: `"function"`
**Se vedi**: `"undefined"` → PeerJS non è caricato!

---

## ✅ Soluzione 3: Scarica PeerJS Localmente

Se il CDN è bloccato, scarica PeerJS e includilo nel repository.

### Passo 1: Scarica PeerJS
```bash
cd "Battaglia navale/frontend/js"
curl -o peerjs.min.js https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js
```

### Passo 2: Modifica index.html
Cambia la riga 346 in `frontend/index.html`:

**PRIMA:**
```html
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
```

**DOPO:**
```html
<script src="js/peerjs.min.js"></script>
```

### Passo 3: Commit e Push
```bash
cd "Battaglia navale"
git add frontend/js/peerjs.min.js
git add frontend/index.html
git commit -m "Fix: Include PeerJS locally for GitHub Pages"
git push
```

Aspetta 1-2 minuti per il deploy automatico.

---

## ✅ Soluzione 4: Controlla il Codice JavaScript

Verifica che il menu online non sia nascosto da JavaScript.

### File da Controllare: `frontend/js/app.js`

Cerca codice tipo:
```javascript
if (typeof Peer === 'undefined') {
    // Nascondi menu online
    document.querySelector('[data-mode="online-quick"]').style.display = 'none';
}
```

Se trovi questo codice, è normale che il menu sia nascosto quando PeerJS non è disponibile.

---

## 🧪 Test Completo

### Test 1: URL Corretto
✅ Apri: `https://showmehow2play.github.io/Battaglia-Navale/frontend/`
✅ Vedi il menu con "Gioca Online in 2"?

### Test 2: Console Browser
✅ Apri Console (F12)
✅ Scrivi: `typeof Peer`
✅ Risponde: `"function"`?

### Test 3: Network Tab
✅ Apri DevTools → Network
✅ Ricarica pagina
✅ Cerca `peerjs.min.js`
✅ Status: `200 OK`?

### Test 4: Funzionalità
✅ Clicca "⚡ Crea Partita Live"
✅ Appare un codice stanza?
✅ Puoi copiare il codice?

---

## 📋 Checklist Rapida

Segui questi passi in ordine:

1. [ ] Apri `https://showmehow2play.github.io/Battaglia-Navale/frontend/` (non solo `/`)
2. [ ] Apri Console (F12) e controlla errori
3. [ ] Scrivi `typeof Peer` nella console
4. [ ] Se `undefined`, scarica PeerJS localmente (Soluzione 3)
5. [ ] Commit e push le modifiche
6. [ ] Aspetta 2 minuti per il deploy
7. [ ] Ricarica la pagina (Ctrl+Shift+R per hard refresh)
8. [ ] Testa di nuovo

---

## 🎯 Soluzione Rapida (Più Probabile)

**Il problema più comune è che stai guardando l'URL sbagliato!**

### URL Sbagliato (Launcher):
```
https://showmehow2play.github.io/Battaglia-Navale/
```
Questo mostra solo il launcher con il pulsante "Gioca Ora".

### URL Corretto (Gioco):
```
https://showmehow2play.github.io/Battaglia-Navale/frontend/
```
Questo mostra il gioco completo con il menu online!

---

## 🔧 Se Ancora Non Funziona

### Opzione A: Sposta tutto nella root
Invece di avere `frontend/`, sposta tutti i file nella root:

```bash
cd "Battaglia navale"
mv frontend/* .
rm -rf frontend
git add .
git commit -m "Move frontend to root"
git push
```

Poi configura GitHub Pages per pubblicare dalla root `/`.

### Opzione B: Usa un branch gh-pages
Crea un branch dedicato solo per GitHub Pages:

```bash
cd "Battaglia navale"
git checkout -b gh-pages
mv frontend/* .
rm -rf frontend
git add .
git commit -m "Setup gh-pages branch"
git push -u origin gh-pages
```

Poi in GitHub Settings → Pages, seleziona il branch `gh-pages`.

---

## 📞 Prossimi Passi

1. **Apri l'URL corretto**: `https://showmehow2play.github.io/Battaglia-Navale/frontend/`
2. **Controlla la console** per errori
3. **Testa `typeof Peer`** nella console
4. **Se serve, scarica PeerJS localmente** (Soluzione 3)

Se dopo questi passi il menu online ancora non appare, mandami:
- Screenshot della console (F12)
- Screenshot della Network tab
- Il risultato di `typeof Peer`

---

**Ultimo aggiornamento**: 3 Giugno 2026  
**Versione**: 1.0 - Soluzione GitHub Pages