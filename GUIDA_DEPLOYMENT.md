# 🌐 Guida Deployment - Battaglia Navale Online

## 🎯 Obiettivo

Rendere il gioco accessibile da **qualsiasi posto** via internet, così tu e i tuoi amici potete giocare da case diverse.

---

## 📋 Architettura Deployment

### Soluzione Consigliata (Gratuita)

1. **Frontend** → GitHub Pages (gratuito, facile)
2. **Backend** → Render.com o Railway.app (gratuito con limiti)

### Risultato Finale
- **Frontend**: `https://tuousername.github.io/battaglia-navale`
- **Backend**: `https://battaglia-navale-backend.onrender.com`
- Giocabile da **qualsiasi dispositivo** con internet!

---

## 🚀 PARTE 1: Deploy Frontend su GitHub Pages

### Step 1: Crea Repository GitHub

1. Vai su https://github.com
2. Clicca su "New repository"
3. Nome: `battaglia-navale`
4. Pubblico o Privato (consiglio Pubblico per GitHub Pages gratuito)
5. Clicca "Create repository"

### Step 2: Prepara i File

Crea un file `.gitignore` nella cartella principale:

```bash
cd "Battaglia navale"
```

Crea `.gitignore`:
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temporary
*.tmp
*.bak
backend.log
frontend.log
```

### Step 3: Inizializza Git e Pusha

```bash
cd "Battaglia navale"

# Inizializza repository
git init

# Aggiungi tutti i file
git add .

# Commit iniziale
git commit -m "Initial commit - Battaglia Navale"

# Collega al repository GitHub (sostituisci con il tuo URL)
git remote add origin https://github.com/TUOUSERNAME/battaglia-navale.git

# Pusha su GitHub
git push -u origin main
```

### Step 4: Abilita GitHub Pages

1. Vai su GitHub → Il tuo repository
2. Clicca su "Settings"
3. Nel menu laterale, clicca "Pages"
4. In "Source", seleziona "main" branch
5. In "Folder", seleziona "/frontend"
6. Clicca "Save"
7. Aspetta 1-2 minuti

Il tuo gioco sarà disponibile su:
`https://TUOUSERNAME.github.io/battaglia-navale/`

---

## 🖥️ PARTE 2: Deploy Backend

### Opzione A: Render.com (Consigliato - Più Facile)

#### Step 1: Crea Account
1. Vai su https://render.com
2. Registrati (gratuito)
3. Collega il tuo account GitHub

#### Step 2: Crea Web Service
1. Dashboard → "New" → "Web Service"
2. Seleziona il tuo repository `battaglia-navale`
3. Configura:
   - **Name**: `battaglia-navale-backend`
   - **Region**: Europe (Frankfurt) - più vicino all'Italia
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
   - **Instance Type**: `Free`

4. Clicca "Create Web Service"

#### Step 3: Aspetta il Deploy
- Render installerà le dipendenze e avvierà il server
- Dopo 2-5 minuti, il backend sarà online!
- URL: `https://battaglia-navale-backend.onrender.com`

#### Step 4: Configura Variabili Ambiente (Opzionale)
- Environment → Add Environment Variable
- `PORT`: `8000`
- `PYTHON_VERSION`: `3.11` (se hai problemi con 3.14)

### Opzione B: Railway.app (Alternativa)

#### Step 1: Crea Account
1. Vai su https://railway.app
2. Registrati con GitHub

#### Step 2: Deploy
1. Dashboard → "New Project"
2. "Deploy from GitHub repo"
3. Seleziona `battaglia-navale`
4. Railway rileverà automaticamente Python
5. Configura:
   - **Root Directory**: `backend`
   - **Start Command**: `python main.py`

6. Deploy automatico!

URL: `https://battaglia-navale-backend.up.railway.app`

---

## 🔗 PARTE 3: Collega Frontend e Backend

### Step 1: Aggiorna URL Backend nel Frontend

Modifica `frontend/js/app.js` (riga ~420):

**PRIMA:**
```javascript
const wsUrl = 'ws://localhost:8000/ws';
```

**DOPO (Render):**
```javascript
const wsUrl = 'wss://battaglia-navale-backend.onrender.com/ws';
```

**DOPO (Railway):**
```javascript
const wsUrl = 'wss://battaglia-navale-backend.up.railway.app/ws';
```

⚠️ **IMPORTANTE**: Usa `wss://` (non `ws://`) per connessioni sicure!

### Step 2: Aggiorna CORS nel Backend

Modifica `backend/main.py` (riga ~19):

**PRIMA:**
```python
allow_origins=["*"],  # In produzione, specificare domini
```

**DOPO:**
```python
allow_origins=[
    "https://TUOUSERNAME.github.io",
    "http://localhost:8081",  # Per test locali
],
```

### Step 3: Pusha le Modifiche

```bash
cd "Battaglia navale"
git add .
git commit -m "Update URLs for production"
git push
```

- GitHub Pages si aggiornerà automaticamente (1-2 minuti)
- Render/Railway si aggiornerà automaticamente (2-5 minuti)

---

## ✅ PARTE 4: Test del Deployment

### Test Frontend
1. Apri: `https://TUOUSERNAME.github.io/battaglia-navale/`
2. Verifica che il menu si carichi
3. Prova la modalità offline (vs CPU) - deve funzionare!

### Test Backend
1. Apri: `https://battaglia-navale-backend.onrender.com/docs`
2. Dovresti vedere la documentazione API FastAPI
3. Se vedi la pagina, il backend funziona!

### Test Multiplayer
1. Apri il gioco in **2 dispositivi diversi** (o 2 browser)
2. Clicca "Partita Rapida" in entrambi
3. Se si matchano, tutto funziona! 🎉

---

## 🎮 Come Giocare da Remoto

### Condividi il Link
Invia ai tuoi amici:
```
https://TUOUSERNAME.github.io/battaglia-navale/
```

### Modalità di Gioco

#### 1. Partita Rapida
- Entrambi cliccate "⚡ Partita Rapida"
- Match automatico!

#### 2. Stanza Privata
- **Tu**: "🔒 Stanza Privata" → lascia vuoto → "Continua"
- Ricevi codice: **ABC123**
- **Amico**: "🔒 Stanza Privata" → inserisci **ABC123** → "Continua"
- Match trovato!

---

## 💰 Costi e Limiti

### GitHub Pages (Frontend)
- ✅ **Gratuito** per sempre
- ✅ Banda illimitata
- ✅ SSL/HTTPS automatico
- ⚠️ Solo siti statici (perfetto per noi!)

### Render.com Free Tier (Backend)
- ✅ **Gratuito** con limiti:
  - 750 ore/mese (sufficiente per uso personale)
  - Il server si "addormenta" dopo 15 minuti di inattività
  - Primo avvio dopo sleep: ~30 secondi
- ✅ SSL/HTTPS automatico
- ✅ Deploy automatico da GitHub

### Railway.app Free Tier (Backend)
- ✅ **$5 di credito gratuito/mese**
- ✅ Nessun sleep automatico
- ✅ Deploy automatico
- ⚠️ Dopo $5, serve carta di credito

---

## 🔧 Troubleshooting

### Frontend non si carica
**Problema**: Pagina 404 su GitHub Pages  
**Soluzione**:
1. Verifica che GitHub Pages sia abilitato
2. Controlla che la cartella sia `/frontend`
3. Aspetta 2-3 minuti per la propagazione

### Backend non risponde
**Problema**: Errore connessione WebSocket  
**Soluzione**:
1. Verifica che il backend sia online: `https://TUO-BACKEND.onrender.com/docs`
2. Controlla i log su Render/Railway
3. Se su Render, aspetta 30 secondi (wake-up da sleep)

### CORS Error
**Problema**: "CORS policy blocked"  
**Soluzione**:
1. Verifica `allow_origins` in `backend/main.py`
2. Deve includere il tuo dominio GitHub Pages
3. Pusha le modifiche e aspetta il redeploy

### WebSocket non si connette
**Problema**: "WebSocket connection failed"  
**Soluzione**:
1. Verifica di usare `wss://` (non `ws://`)
2. Controlla che l'URL backend sia corretto
3. Testa l'URL backend direttamente nel browser

---

## 🚀 Deploy Avanzato (Opzionale)

### Dominio Personalizzato

#### Per Frontend (GitHub Pages)
1. Compra un dominio (es: `battaglianavale.com`)
2. GitHub Settings → Pages → Custom domain
3. Aggiungi il tuo dominio
4. Configura DNS del dominio:
   ```
   Type: CNAME
   Name: www
   Value: TUOUSERNAME.github.io
   ```

#### Per Backend (Render)
1. Render Dashboard → Settings → Custom Domain
2. Aggiungi il tuo dominio (es: `api.battaglianavale.com`)
3. Configura DNS:
   ```
   Type: CNAME
   Name: api
   Value: battaglia-navale-backend.onrender.com
   ```

### Monitoraggio

#### Render
- Dashboard → Logs (vedi log in tempo reale)
- Dashboard → Metrics (CPU, memoria, richieste)

#### Railway
- Dashboard → Logs
- Dashboard → Metrics

---

## 📊 Checklist Deployment

### Pre-Deploy
- [ ] Codice testato localmente
- [ ] `.gitignore` creato
- [ ] URL backend aggiornato in `app.js`
- [ ] CORS configurato in `main.py`

### Deploy Frontend
- [ ] Repository GitHub creato
- [ ] Codice pushato su GitHub
- [ ] GitHub Pages abilitato
- [ ] Sito accessibile via HTTPS

### Deploy Backend
- [ ] Account Render/Railway creato
- [ ] Backend deployato
- [ ] URL backend funzionante
- [ ] API docs accessibili

### Test Finale
- [ ] Frontend carica correttamente
- [ ] Modalità offline funziona
- [ ] Modalità online funziona
- [ ] Partita rapida funziona
- [ ] Stanza privata funziona
- [ ] Chat funziona

---

## 🎉 Congratulazioni!

Se hai completato tutti gli step, il tuo gioco è ora **online e accessibile da tutto il mondo**!

### Link da Condividere
```
🎮 Gioca a Battaglia Navale Online!
https://TUOUSERNAME.github.io/battaglia-navale/

Sfidami a una partita! 🚢⚓
```

---

## 📞 Supporto

### Problemi Comuni
- **GitHub Pages**: https://docs.github.com/pages
- **Render**: https://render.com/docs
- **Railway**: https://docs.railway.app

### Community
- GitHub Issues del tuo repository
- Discord/Forum di Render/Railway

---

**Ultimo aggiornamento**: 1 Giugno 2026  
**Versione**: 1.0 - Guida Deployment Completa