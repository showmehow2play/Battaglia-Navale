# 🚀 Istruzioni per Aggiornare GitHub Pages

## ✅ Modifiche Effettuate

Ho risolto il problema del menu online non visibile su GitHub Pages:

1. ✅ Scaricato PeerJS localmente in `frontend/js/peerjs.min.js`
2. ✅ Modificato `frontend/index.html` per usare PeerJS locale invece del CDN

---

## 📤 Come Fare il Push su GitHub

### Passo 1: Apri il Terminale
```bash
cd "Battaglia navale"
```

### Passo 2: Verifica le Modifiche
```bash
git status
```

Dovresti vedere:
```
modified:   frontend/index.html
untracked:  frontend/js/peerjs.min.js
```

### Passo 3: Aggiungi i File
```bash
git add frontend/index.html
git add frontend/js/peerjs.min.js
git add SOLUZIONE_GITHUB_PAGES.md
git add VERIFICA_MULTIPLAYER_ONLINE.md
git add ISTRUZIONI_PUSH_GITHUB.md
```

### Passo 4: Commit
```bash
git commit -m "Fix: Include PeerJS locally for GitHub Pages compatibility"
```

### Passo 5: Push
```bash
git push origin main
```

(Se il branch si chiama `master` invece di `main`, usa `git push origin master`)

---

## ⏱️ Attendi il Deploy

Dopo il push:
1. Vai su GitHub → Il tuo repository
2. Clicca sulla tab "Actions" (se disponibile)
3. Vedrai il deploy in corso
4. Aspetta **1-2 minuti** per il completamento

---

## 🧪 Test Finale

### Passo 1: Apri l'URL Corretto
```
https://showmehow2play.github.io/Battaglia-Navale/frontend/
```

⚠️ **IMPORTANTE**: Usa `/frontend/` alla fine, non solo `/`!

### Passo 2: Hard Refresh
Premi **Ctrl+Shift+R** (o **Cmd+Shift+R** su Mac) per forzare il reload della pagina.

### Passo 3: Verifica il Menu
Dovresti vedere:
- 🤖 Gioca vs Computer
- 🌐 Gioca Online in 2 ← **Questo DEVE essere visibile!**

### Passo 4: Test PeerJS
1. Apri Console (F12)
2. Scrivi: `typeof Peer`
3. Deve rispondere: `"function"`

### Passo 5: Test Completo
1. Clicca "⚡ Crea Partita Live"
2. Dovresti vedere un codice stanza (es. `abc123xyz`)
3. Copia il codice
4. Apri il gioco in un altro dispositivo/browser
5. Clicca "🔑 Entra con Codice"
6. Incolla il codice
7. Entrambi i giocatori si connettono! 🎉

---

## 🔧 Se Ancora Non Funziona

### Problema 1: Cache del Browser
**Soluzione**: Hard refresh con **Ctrl+Shift+R**

### Problema 2: URL Sbagliato
**Soluzione**: Usa `https://showmehow2play.github.io/Battaglia-Navale/frontend/` (con `/frontend/`)

### Problema 3: Deploy Non Completato
**Soluzione**: Aspetta 2-3 minuti dopo il push

### Problema 4: File Non Caricato
**Verifica**: Vai su GitHub → Repository → `frontend/js/` → Deve esserci `peerjs.min.js`

---

## 📋 Checklist Completa

- [ ] Aperto terminale nella cartella "Battaglia navale"
- [ ] Eseguito `git status` per vedere le modifiche
- [ ] Eseguito `git add` per i file modificati
- [ ] Eseguito `git commit` con messaggio
- [ ] Eseguito `git push origin main`
- [ ] Aspettato 2 minuti per il deploy
- [ ] Aperto `https://showmehow2play.github.io/Battaglia-Navale/frontend/`
- [ ] Fatto hard refresh (Ctrl+Shift+R)
- [ ] Verificato che il menu "Gioca Online in 2" sia visibile
- [ ] Testato `typeof Peer` nella console → risponde `"function"`
- [ ] Testato "Crea Partita Live" → genera codice stanza
- [ ] Tutto funziona! 🎉

---

## 🎮 Come Condividere il Gioco

Una volta che funziona, condividi questo link:

```
🎮 Gioca a Battaglia Navale Online!
https://showmehow2play.github.io/Battaglia-Navale/frontend/

Per giocare insieme:
1. Io clicco "⚡ Crea Partita Live"
2. Ti mando il codice stanza
3. Tu clicchi "🔑 Entra con Codice" e inserisci il codice
4. Giochiamo! ⚓🚢
```

---

## 💡 Perché Ora Funziona?

**Prima**: PeerJS veniva caricato da un CDN esterno (`unpkg.com`)
- Alcuni browser/reti bloccano CDN esterni
- GitHub Pages potrebbe avere problemi CORS con CDN

**Ora**: PeerJS è incluso localmente nel repository
- Nessuna dipendenza esterna
- Tutto viene servito da GitHub Pages
- Funziona sempre, ovunque! ✅

---

## 📞 Supporto

Se dopo il push il menu online ancora non appare:

1. Verifica che `frontend/js/peerjs.min.js` sia su GitHub
2. Controlla la Console (F12) per errori
3. Prova con un altro browser
4. Aspetta 5 minuti e riprova (cache GitHub)

---

**Ultimo aggiornamento**: 3 Giugno 2026  
**Versione**: 1.0 - Istruzioni Push GitHub