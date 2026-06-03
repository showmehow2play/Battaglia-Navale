# 📤 Come Aggiornare il Gioco su GitHub

## ⚠️ Problema Attuale

Il file `app.js` su GitHub è ancora la versione **vecchia con WebSocket**, mentre la versione locale è stata aggiornata con **PeerJS**.

## ✅ Soluzione: Aggiorna i File su GitHub

### Opzione 1: Tramite Interfaccia Web GitHub

1. **Vai su GitHub** al tuo repository
2. **Naviga** a `frontend/js/app.js`
3. **Clicca** sull'icona della matita (Edit)
4. **Sostituisci** tutto il contenuto con il file locale aggiornato:
   - Apri `Battaglia navale/frontend/js/app.js` sul tuo computer
   - Copia tutto il contenuto (Cmd+A, Cmd+C)
   - Incolla su GitHub sostituendo il vecchio contenuto
5. **Commit** le modifiche con messaggio: "Aggiornato a PeerJS per multiplayer P2P"
6. **Attendi** 1-2 minuti che GitHub Pages si aggiorni
7. **Ricarica** la pagina del gioco (Cmd+Shift+R per forzare)

### Opzione 2: Tramite Git Desktop / SourceTree

1. **Clona** il repository GitHub sul tuo computer
2. **Copia** il file `app.js` aggiornato nella cartella clonata
3. **Commit** le modifiche
4. **Push** su GitHub
5. **Attendi** l'aggiornamento di GitHub Pages

### Opzione 3: Tramite Terminale Git

```bash
# Naviga alla cartella del repository GitHub clonato
cd /path/to/your/github/repo

# Copia il file aggiornato
cp "/Users/daviderosa/Documents/Bob Folder/Battaglia navale/frontend/js/app.js" frontend/js/app.js

# Aggiungi e committa
git add frontend/js/app.js
git commit -m "Aggiornato a PeerJS per multiplayer P2P senza server"

# Push su GitHub
git push origin main
```

## 🔍 Come Verificare l'Aggiornamento

1. **Apri** la pagina GitHub del gioco
2. **Apri** la Console del browser (F12 → Console)
3. **Clicca** su "Gioca Online"
4. **Controlla** i messaggi nella console:
   - ✅ **Corretto**: Vedi "PeerJS inizializzato. ID: ..."
   - ❌ **Sbagliato**: Vedi "Errore WebSocket" o "Errore di connessione al server"

## 📋 File da Aggiornare

Assicurati di caricare su GitHub:

- ✅ `frontend/js/app.js` (MODIFICATO - principale)
- ✅ `GUIDA_MULTIPLAYER_P2P.md` (NUOVO - documentazione)
- ✅ `ISTRUZIONI_AGGIORNAMENTO_GITHUB.md` (NUOVO - questo file)

I seguenti file NON sono stati modificati:
- `frontend/index.html` (già ha PeerJS nel CDN)
- `frontend/js/peer-multiplayer.js` (già esistente)
- Altri file JS

## 🚀 Dopo l'Aggiornamento

Una volta caricato il file aggiornato su GitHub:

1. **Attendi** 1-2 minuti per il deploy di GitHub Pages
2. **Svuota** la cache del browser (Cmd+Shift+R su Mac, Ctrl+Shift+R su Windows)
3. **Ricarica** la pagina del gioco
4. **Testa** cliccando su "Gioca Online"
5. **Dovresti vedere** il messaggio "In attesa di avversario..." con un codice stanza

## 💡 Suggerimento Rapido

Se hai accesso al repository GitHub, il modo più veloce è:

1. Vai su GitHub → tuo repository → `frontend/js/app.js`
2. Clicca "Edit" (icona matita)
3. Seleziona tutto (Ctrl+A) e cancella
4. Apri il file locale `app.js` aggiornato
5. Copia tutto (Ctrl+A, Ctrl+C)
6. Incolla su GitHub (Ctrl+V)
7. Scroll in basso → "Commit changes"
8. Attendi 2 minuti e ricarica il gioco

---

**Nota**: Il file locale è già corretto e funziona. Devi solo sincronizzarlo con GitHub!