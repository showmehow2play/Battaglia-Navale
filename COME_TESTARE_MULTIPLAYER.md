# 🧪 Come Testare il Multiplayer Online

## ⚠️ Errore Comune

**NON puoi giocare contro te stesso nella stessa finestra!**

Gli errori che vedi:
- "Errore di connessione: Codice stanza mancante"
- "Avversario disconnesso"

Succedono perché stai provando a:
1. Creare una partita
2. Entrare nella stessa partita dalla stessa finestra

**Questo NON funziona!** Serve un secondo dispositivo o browser.

---

## ✅ Metodo Corretto per Testare

### Opzione 1: Due Tab dello Stesso Browser (Più Facile)

#### Tab 1 (Host):
1. Apri: `https://showmehow2play.github.io/Battaglia-Navale/frontend/`
2. Clicca "⚡ Crea Partita Live"
3. Copia il codice che appare (es. `abc123xyz`)
4. **NON chiudere questa tab!**
5. Posiziona le tue navi
6. **Aspetta** che l'altro giocatore si connetta

#### Tab 2 (Guest):
1. Apri una **NUOVA TAB** (Cmd+T o Ctrl+T)
2. Vai su: `https://showmehow2play.github.io/Battaglia-Navale/frontend/`
3. Clicca "🔑 Entra con Codice"
4. Incolla il codice dalla Tab 1
5. Clicca "Entra"
6. Posiziona le tue navi
7. Clicca "Inizia Partita"

#### Risultato:
- Entrambe le tab si connettono
- Entrambi posizionano le navi
- La partita inizia! 🎉

---

### Opzione 2: Due Browser Diversi

#### Browser 1 (es. Chrome):
1. Apri il gioco
2. Clicca "⚡ Crea Partita Live"
3. Copia il codice

#### Browser 2 (es. Firefox/Safari):
1. Apri il gioco
2. Clicca "🔑 Entra con Codice"
3. Incolla il codice
4. Connessione riuscita!

---

### Opzione 3: Due Dispositivi (Test Reale)

#### Dispositivo 1 (es. PC):
1. Apri: `https://showmehow2play.github.io/Battaglia-Navale/frontend/`
2. Clicca "⚡ Crea Partita Live"
3. Copia il codice (es. `abc123xyz`)
4. Invia il codice al secondo dispositivo (WhatsApp, SMS, ecc.)

#### Dispositivo 2 (es. Smartphone):
1. Apri: `https://showmehow2play.github.io/Battaglia-Navale/frontend/`
2. Clicca "🔑 Entra con Codice"
3. Incolla il codice ricevuto
4. Clicca "Entra"
5. Connessione riuscita!

---

## 🔍 Verifica che Funzioni

### Passo 1: Crea Partita (Tab/Dispositivo 1)
Dopo aver cliccato "Crea Partita Live", dovresti vedere:
```
✓ Partita live creata. Condividi questo codice: abc123xyz
```

### Passo 2: Entra con Codice (Tab/Dispositivo 2)
Dopo aver inserito il codice, dovresti vedere:
```
✓ Connesso alla stanza! Attendi il setup.
✓ Avversario connesso! Inizia il setup.
```

### Passo 3: Posiziona le Navi (Entrambi)
- Entrambi i giocatori posizionano le 5 navi
- Entrambi cliccano "Inizia Partita"

### Passo 4: Partita Inizia
Dovresti vedere:
```
✓ Partita iniziata! Tocca a te. (o "Tocca all'avversario")
```

---

## 🐛 Troubleshooting

### Errore: "Codice stanza mancante"
**Causa**: Stai provando a entrare senza inserire un codice
**Soluzione**: 
1. Un giocatore deve prima creare la partita
2. L'altro giocatore deve inserire il codice ricevuto

### Errore: "Avversario disconnesso"
**Causa**: L'altro giocatore ha chiuso la tab o perso la connessione
**Soluzione**: 
1. Riapri entrambe le tab/dispositivi
2. Ricrea la partita da zero

### Errore: "Could not connect to peer"
**Causa**: Il codice è sbagliato o la stanza non esiste più
**Soluzione**: 
1. Verifica di aver copiato il codice corretto
2. Assicurati che l'host non abbia chiuso la tab
3. Ricrea la partita

### Errore: "Timeout connessione stanza"
**Causa**: Problemi di rete o firewall
**Soluzione**: 
1. Controlla la connessione internet
2. Prova con un'altra rete (es. hotspot mobile)
3. Disabilita VPN se attiva

---

## 📋 Checklist Test Completo

### Test 1: Due Tab Stesso Browser
- [ ] Tab 1: Crea partita → Codice generato
- [ ] Tab 2: Entra con codice → Connesso
- [ ] Entrambi: Posiziona navi
- [ ] Entrambi: Clicca "Inizia Partita"
- [ ] Partita inizia correttamente
- [ ] Turni alternati funzionano
- [ ] Chat funziona
- [ ] Partita termina correttamente

### Test 2: Due Dispositivi
- [ ] Dispositivo 1: Crea partita
- [ ] Dispositivo 2: Entra con codice
- [ ] Connessione riuscita
- [ ] Partita completa funziona

---

## 💡 Consigli per il Test

### 1. Usa la Console per Debug
Apri Console (F12) in entrambe le tab per vedere i log:
```
🚢 Battaglia Navale - Inizializzazione...
🌐 Inizializzazione PeerJS...
✓ PeerJS inizializzato. Peer ID: abc123xyz
✓ Connesso con: xyz789abc
```

### 2. Testa la Chat
Durante la partita, prova a inviare messaggi nella chat per verificare che la connessione P2P funzioni.

### 3. Testa la Disconnessione
Chiudi una tab durante la partita per verificare che l'altra riceva il messaggio "Avversario disconnesso".

### 4. Testa su Rete Mobile
Se hai problemi su WiFi, prova con hotspot mobile per escludere problemi di firewall.

---

## 🎮 Flusso Completo di una Partita

```
GIOCATORE 1 (Host)                    GIOCATORE 2 (Guest)
─────────────────────────────────────────────────────────────
1. Apre il gioco
2. Clicca "Crea Partita Live"
3. Riceve codice: abc123xyz
4. Condivide il codice ────────────→  5. Riceve il codice
                                      6. Apre il gioco
                                      7. Clicca "Entra con Codice"
                                      8. Inserisce: abc123xyz
                                      9. Clicca "Entra"
10. Vede "Avversario connesso" ←────  11. Vede "Connesso alla stanza"
12. Posiziona le 5 navi               13. Posiziona le 5 navi
14. Clicca "Inizia Partita"           15. Clicca "Inizia Partita"
16. Partita inizia! ←─────────────→   17. Partita inizia!
18. Tocca al Giocatore 1              19. Aspetta il turno
20. Attacca una cella ────────────→   21. Riceve l'attacco
22. Riceve il risultato ←────────────  23. Invia il risultato
24. Aspetta il turno                  25. Tocca al Giocatore 2
26. Riceve l'attacco ←────────────────  27. Attacca una cella
... e così via fino alla fine ...
```

---

## ✅ Quando il Test è Riuscito

Il multiplayer funziona correttamente quando:
- ✅ Due giocatori si connettono senza errori
- ✅ Entrambi posizionano le navi
- ✅ La partita inizia per entrambi
- ✅ I turni si alternano correttamente
- ✅ Gli attacchi vengono ricevuti in tempo reale
- ✅ La chat funziona
- ✅ La partita termina correttamente
- ✅ Nessun errore nella console

---

## 🎉 Condividi il Gioco

Una volta testato, condividi con gli amici:

```
🎮 Gioca a Battaglia Navale Online!
https://showmehow2play.github.io/Battaglia-Navale/frontend/

Come giocare insieme:
1. Io apro il link e clicco "Crea Partita Live"
2. Ti mando il codice stanza (6 caratteri)
3. Tu apri il link e clicchi "Entra con Codice"
4. Inserisci il codice che ti ho mandato
5. Giochiamo! ⚓🚢

Regole:
- 5 navi da posizionare
- Turni alternati
- Vince chi affonda per primo tutte le navi avversarie
```

---

**Ultimo aggiornamento**: 3 Giugno 2026  
**Versione**: 1.0 - Guida Test Multiplayer