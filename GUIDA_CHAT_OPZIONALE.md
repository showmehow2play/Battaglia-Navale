# Guida: Chat Opzionale nelle Partite Online

## 📋 Panoramica

È stata implementata una nuova funzionalità che permette all'host (chi crea la partita) di decidere se abilitare o disabilitare la chat durante le partite online.

## 🎯 Funzionalità Implementate

### 1. **Checkbox nel Menu Principale**
- Quando si crea una partita online, è presente un checkbox "💬 Abilita chat durante la partita"
- Il checkbox è **selezionato di default** (chat abilitata)
- L'host può deselezionarlo prima di creare la partita per disabilitare la chat

### 2. **Sincronizzazione Automatica**
- Quando l'host crea la partita, la configurazione della chat viene inviata automaticamente al guest
- Il guest riceve e applica la stessa configurazione dell'host
- Non è necessaria alcuna azione da parte del guest

### 3. **Comportamento della Chat**

#### **Chat Abilitata** (default)
- Il pannello chat è visibile durante la partita
- Entrambi i giocatori possono inviare e ricevere messaggi
- Funziona esattamente come prima

#### **Chat Disabilitata**
- Il pannello chat rimane nascosto durante tutta la partita
- I tentativi di inviare messaggi vengono bloccati con un avviso
- Nessun messaggio viene trasmesso via P2P

## 🔧 Dettagli Tecnici

### File Modificati

1. **`index.html`** (righe 61-73)
   - Aggiunto checkbox per abilitare/disabilitare chat
   - Posizionato sopra i pulsanti di creazione partita

2. **`style.css`** (righe 1390-1427)
   - Stili per il container del checkbox
   - Design coerente con il resto dell'interfaccia

3. **`app.js`**
   - Aggiunta proprietà `chatEnabled` (default: `true`)
   - Lettura dello stato del checkbox quando si crea la partita
   - Invio configurazione chat all'avversario
   - Gestione evento `chat_config` per ricevere la configurazione
   - Controllo stato chat prima di mostrare il pannello
   - Validazione prima dell'invio messaggi

4. **`peer-multiplayer.js`**
   - Aggiunta proprietà `chatEnabled`
   - Nuovo metodo `sendChatConfig(chatEnabled)`
   - Controllo in `sendChatMessage()` per bloccare invio se disabilitata

### Flusso di Comunicazione

```
HOST                                    GUEST
  │                                       │
  │ 1. Seleziona/deseleziona checkbox    │
  │                                       │
  │ 2. Crea partita                       │
  │    (chatEnabled = checkbox.checked)  │
  │                                       │
  │ 3. Guest si connette                  │
  │────────────────────────────────────>  │
  │                                       │
  │ 4. Invia chat_config                  │
  │────────────────────────────────────>  │
  │    { chatEnabled: true/false }       │
  │                                       │
  │                                       │ 5. Applica configurazione
  │                                       │    (chatEnabled = data.chatEnabled)
  │                                       │
  │ 6. Partita inizia                     │
  │    Chat visibile solo se abilitata    │
  │<─────────────────────────────────────>│
```

## 🎮 Come Usare

### Per l'Host (chi crea la partita)

1. Nel menu principale, clicca su "Gioca Online in 2"
2. **Seleziona o deseleziona** il checkbox "💬 Abilita chat durante la partita"
   - ✅ Selezionato = Chat abilitata
   - ☐ Deselezionato = Chat disabilitata
3. Clicca su "⚡ Crea Partita Live"
4. Condividi il codice stanza con l'altro giocatore
5. Durante la partita, la chat sarà visibile/nascosta in base alla tua scelta

### Per il Guest (chi entra nella partita)

1. Clicca su "🔑 Entra con Codice"
2. Inserisci il codice ricevuto dall'host
3. La configurazione della chat viene applicata automaticamente
4. Non è necessaria alcuna azione: la chat sarà abilitata/disabilitata come deciso dall'host

## 🔍 Messaggi e Notifiche

### Chat Abilitata
- Nessun messaggio particolare
- La chat funziona normalmente

### Chat Disabilitata
- Se si tenta di inviare un messaggio: **"Chat disabilitata per questa partita"**
- Il pannello chat non è visibile nell'interfaccia

## 🐛 Risoluzione Problemi

### La chat non appare anche se abilitata
- Verifica che la connessione P2P sia attiva
- Controlla la console del browser per eventuali errori
- Ricarica la pagina e riprova

### Il guest vede la chat ma l'host no (o viceversa)
- Questo non dovrebbe accadere: la configurazione è sincronizzata
- Se succede, è un bug: segnalalo con i dettagli della console

### Il checkbox non mantiene lo stato
- È normale: il checkbox si resetta ad ogni caricamento della pagina
- Lo stato di default è "abilitata" (checkbox selezionato)

## 📝 Note Importanti

1. **Solo l'host decide**: Il guest non può modificare la configurazione della chat
2. **Decisione permanente**: Una volta iniziata la partita, non è possibile cambiare la configurazione
3. **Default sicuro**: Se non specificato, la chat è sempre abilitata (comportamento originale)
4. **Retrocompatibilità**: Le partite create prima di questo aggiornamento avranno la chat abilitata

## 🎨 Aspetto Visivo

Il checkbox appare in un pannello dedicato sopra i pulsanti di creazione partita:

```
┌─────────────────────────────────────┐
│ 🌐 Gioca Online in 2                │
│                                     │
│ Crea una partita live e condividi   │
│ il codice stanza...                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ☑ 💬 Abilita chat durante la    │ │
│ │      partita                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [⚡ Crea Partita Live]              │
│ [🔑 Entra con Codice]               │
└─────────────────────────────────────┘
```

## 🚀 Vantaggi

- **Privacy**: Possibilità di giocare senza chat se preferito
- **Concentrazione**: Meno distrazioni durante la partita
- **Flessibilità**: L'host decide in base alle preferenze
- **Semplicità**: Un solo click per abilitare/disabilitare

---

**Implementato il**: 3 Giugno 2026  
**Versione**: 1.0  
**Compatibilità**: Tutte le versioni del gioco Battaglia Navale