# 🔧 Troubleshooting Connessione P2P e Webcam

## Problema: Join non funziona

### Possibili Cause

1. **PeerJS Server Issues**
   - Il server PeerJS pubblico potrebbe essere temporaneamente non disponibile
   - Timeout di connessione

2. **Firewall/Network**
   - Firewall che blocca connessioni WebRTC
   - NAT traversal issues

3. **Browser Compatibility**
   - Alcuni browser hanno limitazioni WebRTC

### Soluzioni

#### Soluzione 1: Verifica Console Browser

Apri la console del browser (F12) e cerca errori come:
```
PeerJS: Error connecting to peer
Connection timeout
```

#### Soluzione 2: Prova con HTTPS

La webcam richiede HTTPS. Per testare in locale:

**Opzione A - Usa ngrok:**
```bash
# Installa ngrok
brew install ngrok  # macOS
# oppure scarica da https://ngrok.com

# Avvia server locale
cd "Battaglia navale"
python3 -m http.server 8000

# In un altro terminale, esponi con ngrok
ngrok http 8000

# Usa l'URL HTTPS fornito da ngrok
```

**Opzione B - Usa localhost (Chrome):**
```bash
# Chrome permette webcam su localhost senza HTTPS
cd "Battaglia navale"
python3 -m http.server 8000

# Apri: http://localhost:8000/frontend/index.html
```

#### Soluzione 3: Verifica Permessi Webcam

1. Vai nelle impostazioni del browser
2. Cerca "Permessi sito" o "Site permissions"
3. Trova "Fotocamera"
4. Assicurati che il sito abbia i permessi

#### Soluzione 4: Test Passo-Passo

1. **Test Base (senza webcam)**:
   - Avvia partita online normale
   - Verifica che la connessione P2P funzioni
   - Prova a giocare senza attivare "guardami"

2. **Test Webcam**:
   - Solo dopo che la connessione P2P funziona
   - Scrivi "guardami" nella chat
   - Concedi permessi quando richiesto

## Problema: "Impossibile abilitare webcam"

### Cause Comuni

1. **No HTTPS**
   - La webcam richiede HTTPS (o localhost)
   - Errore: `NotAllowedError` o `NotSupportedError`

2. **Permessi Negati**
   - L'utente ha negato i permessi
   - Errore: `NotAllowedError`

3. **Webcam in Uso**
   - Un'altra applicazione sta usando la webcam
   - Errore: `NotReadableError`

4. **Nessuna Webcam**
   - Il dispositivo non ha una webcam
   - Errore: `NotFoundError`

### Soluzioni

#### Per Sviluppo Locale

```bash
# Usa localhost (funziona senza HTTPS in Chrome)
cd "Battaglia navale"
python3 -m http.server 8000

# Apri Chrome:
open -a "Google Chrome" http://localhost:8000/frontend/index.html
```

#### Per Testing con HTTPS

**Deploy su GitHub Pages:**
```bash
# Commit e push
git add .
git commit -m "Add webcam feature"
git push origin main

# Abilita GitHub Pages nelle impostazioni del repo
# Accedi a: https://username.github.io/repository-name/frontend/
```

#### Verifica Manuale Webcam

Apri la console del browser e prova:
```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    console.log('✅ Webcam OK!', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error('❌ Errore:', error.name, error.message);
  });
```

## Checklist Debug

### Prima di Testare

- [ ] Browser moderno (Chrome 80+, Firefox 75+, Safari 14+)
- [ ] HTTPS attivo (o localhost)
- [ ] Webcam collegata e funzionante
- [ ] Permessi webcam concessi
- [ ] Nessun'altra app usa la webcam
- [ ] Connessione internet stabile

### Test Connessione P2P

1. [ ] Apri due finestre/tab del browser
2. [ ] Finestra 1: Crea partita live
3. [ ] Copia il codice stanza
4. [ ] Finestra 2: Entra con codice
5. [ ] Verifica che entrambi vedano "Avversario connesso"
6. [ ] Posiziona navi in entrambe le finestre
7. [ ] Inizia a giocare

### Test Easter Egg Webcam

1. [ ] Connessione P2P funzionante
2. [ ] Chat abilitata
3. [ ] Scrivi "guardami" nella chat
4. [ ] Verifica apparizione pannello webcam
5. [ ] Click su "Attiva Webcam"
6. [ ] Concedi permessi
7. [ ] Verifica video locale visibile
8. [ ] L'altro giocatore scrive "guardami"
9. [ ] Verifica video remoto visibile

## Errori Comuni e Fix

### Errore: "PeerJS: Could not connect to peer"

**Causa**: Server PeerJS non raggiungibile

**Fix**:
```javascript
// In peer-multiplayer.js, puoi specificare un server custom
this.peer = new Peer({
    host: 'peerjs-server.herokuapp.com',
    port: 443,
    path: '/',
    secure: true
});
```

### Errore: "NotAllowedError: Permission denied"

**Causa**: Permessi webcam negati

**Fix**:
1. Click sull'icona lucchetto nella barra URL
2. Permetti accesso alla fotocamera
3. Ricarica la pagina

### Errore: "NotFoundError: Requested device not found"

**Causa**: Nessuna webcam disponibile

**Fix**:
- Collega una webcam
- Oppure usa un dispositivo con webcam integrata

### Errore: "NotReadableError: Could not start video source"

**Causa**: Webcam in uso da altra app

**Fix**:
- Chiudi altre app che usano la webcam (Zoom, Skype, etc.)
- Riavvia il browser

## Test Rapido

Per un test rapido senza complicazioni:

1. **Deploy su GitHub Pages** (HTTPS automatico)
2. **Apri due tab** dello stesso browser
3. **Tab 1**: Crea partita
4. **Tab 2**: Entra con codice
5. **Gioca** normalmente
6. **Scrivi "guardami"** in entrambi i tab
7. **Goditi** il Face-to-Face mode!

## Supporto Browser

| Browser | P2P | Webcam | Note |
|---------|-----|--------|------|
| Chrome 80+ | ✅ | ✅ | Consigliato |
| Firefox 75+ | ✅ | ✅ | Ottimo |
| Safari 14+ | ✅ | ⚠️ | Richiede iOS 14.3+ |
| Edge 80+ | ✅ | ✅ | Basato su Chromium |

## Contatti

Se i problemi persistono, verifica:
1. Console del browser per errori specifici
2. Network tab per problemi di connessione
3. Permessi del sito nelle impostazioni browser

---

**Nota**: La funzionalità webcam è un Easter Egg opzionale. Il gioco funziona perfettamente anche senza attivarla!