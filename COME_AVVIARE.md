# 🚀 Come Avviare Battaglia Navale

## 📋 Prerequisiti

- **Browser moderno** (Chrome, Firefox, Safari, Edge)
- **Python 3.8+** (opzionale, per server HTTP locale)

---

## 🎮 Avvio Rapido

### Opzione 1: Apertura Diretta ⭐ PIÙ SEMPLICE

**Tutti i sistemi operativi:**
1. Vai nella cartella `frontend/`
2. Fai doppio click su `index.html`
3. Il gioco si apre nel browser!

---

### Opzione 2: Con Server HTTP Locale (Consigliato)

**Mac/Linux:**
```bash
./avvia-gioco.sh
```

**Windows:**
```
Doppio click su: avvia-gioco.bat
```

Poi apri il browser su: **http://localhost:8081**

---

## 🎯 Modalità di Gioco

### 🤖 Vs Computer
1. Avvia il gioco
2. Scegli difficoltà: 😊 Facile, 😐 Medio, 😈 Difficile
3. Posiziona le navi
4. Gioca!

**Difficoltà:**
- **😊 Facile**: Tiri completamente casuali
- **😐 Medio**: Strategia "Hunt & Target" (cerca e colpisci)
- **😈 Difficile**: Algoritmo probabilistico avanzato

---

## 🛑 Come Fermare il Server

### Mac/Linux
Premi **CTRL+C** nel terminale

### Windows
Chiudi la finestra del prompt dei comandi

---

## ❓ Problemi Comuni

### "Python non trovato"
**Soluzione**: 
- Installa Python da https://www.python.org/downloads/
- Oppure usa l'Opzione 1 (apertura diretta)

### "Porta già in uso"
**Soluzione**: 
- Chiudi altri server in esecuzione
- Oppure modifica la porta negli script (8081 → 8082)

### Il gioco non si carica
**Soluzione**:
1. Verifica che il browser sia aggiornato
2. Controlla la console del browser (F12) per errori
3. Prova a ricaricare la pagina (CTRL+R o CMD+R)
4. Prova con un altro browser

### Errori CORS
**Soluzione**: Usa un server HTTP locale (Opzione 2) invece dell'apertura diretta

---

## 📱 Gioca su Mobile

### Stesso Network WiFi

1. Trova l'IP del tuo computer:
   - **Mac/Linux**: `ifconfig | grep inet`
   - **Windows**: `ipconfig`

2. Avvia il server:
   ```bash
   ./avvia-gioco.sh
   ```

3. Sul telefono, apri: `http://TUO_IP:8081`
   (es: http://192.168.1.100:8081)

### Accesso da Internet (ngrok)

```bash
# Installa ngrok: https://ngrok.com/download

# Avvia il gioco
./avvia-gioco.sh

# In un altro terminale
ngrok http 8081
```

Usa l'URL fornito da ngrok sul tuo telefono.

---

## 🎨 Personalizzazione

### Cambiare Porta

Modifica negli script: `8081` → `NUOVA_PORTA`

**avvia-gioco.sh:**
```bash
python3 -m http.server 8081  # Cambia qui
```

**avvia-gioco.bat:**
```batch
python -m http.server 8081  # Cambia qui
```

### Cambiare Colori

Modifica `frontend/css/style.css`:
```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #14b8a6;
  /* ... */
}
```

### Modificare Difficoltà AI

Modifica `frontend/js/ai.js` per rendere l'AI più o meno difficile.

---

## 📚 Documentazione Completa

- **README.md** - Documentazione tecnica completa
- **GUIDA_AVVIO.md** - Guida dettagliata con troubleshooting
- **DESIGN-MODERNO.md** - Guida al design UI

---

## 🎉 Buon Divertimento!

Ora sei pronto per giocare! La difficoltà "Difficile" è molto impegnativa! 😈

**Suggerimento**: Usa il posizionamento casuale per iniziare velocemente!

---

## 🎮 Come Giocare

### Posizionamento Navi
1. Seleziona una nave dalla lista
2. Clicca sulla griglia per posizionarla
3. Usa "🔄 Ruota" per cambiare orientamento
4. Oppure "🎲 Casuale" per posizionamento automatico
5. Clicca "▶️ Inizia Partita"

### Durante la Partita
- **Tuo turno**: Clicca su una cella della griglia nemica
- **Turno CPU**: Aspetta che il computer attacchi
- **Esiti**:
  - 💧 Cerchio = Acqua (mancato)
  - ✕ X rossa = Colpito
  - 💥 Esplosione = Affondato

### Vittoria
Affonda tutte le 5 navi avversarie per vincere!

---

**Ultimo aggiornamento**: 3 Giugno 2026  
**Versione**: 1.0 - Offline Only