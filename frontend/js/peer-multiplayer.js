console.log('📦 Caricamento peer-multiplayer.js...');

class PeerMultiplayer {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.call = null; // Per gestire le chiamate video
        this.eventHandlers = {};
        this.peerId = null;
        this.pendingHostCode = null;
        this.isHost = false;
        this.chatEnabled = true; // Default: chat abilitata
        this.webcamEnabled = false; // Webcam disabilitata di default
        this.localStream = null;
        this.remoteStream = null;
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    emit(event, data = {}) {
        if (!this.eventHandlers[event]) return;
        this.eventHandlers[event].forEach(handler => handler(data));
    }

    async initialize() {
        if (typeof Peer === 'undefined') {
            throw new Error('PeerJS non disponibile');
        }

        return new Promise((resolve, reject) => {
            this.peer = new Peer();

            this.peer.on('open', (id) => {
                this.peerId = id;
                this.setupPeerListeners();
                resolve(id);
            });

            this.peer.on('connection', (conn) => {
                if (!this.isHost) {
                    conn.close();
                    return;
                }

                if (this.connection && this.connection.open) {
                    conn.close();
                    this.emit('error', { error: 'Stanza già occupata' });
                    return;
                }

                this.attachConnection(conn);
            });

            this.peer.on('error', (error) => {
                reject(error);
            });
        });
    }

    setupPeerListeners() {
        if (!this.peer) return;

        this.peer.on('disconnected', () => {
            this.emit('disconnected');
        });

        this.peer.on('close', () => {
            this.emit('disconnected');
        });
    }

    getPeerId() {
        return this.peerId;
    }

    hostGame() {
        this.isHost = true;
        this.pendingHostCode = this.peerId;
        return this.peerId;
    }

    async joinGame(roomCode) {
        if (!roomCode) {
            throw new Error('Codice stanza mancante');
        }

        this.isHost = false;

        return new Promise((resolve, reject) => {
            const conn = this.peer.connect(roomCode, {
                reliable: true
            });

            const timeout = setTimeout(() => {
                reject(new Error('Timeout connessione stanza'));
            }, 15000);

            conn.on('open', () => {
                clearTimeout(timeout);
                this.attachConnection(conn);
                resolve();
            });

            conn.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    attachConnection(conn) {
        this.connection = conn;

        if (conn.open) {
            this.emit('connected', { peerId: conn.peer });
        } else {
            conn.on('open', () => {
                this.emit('connected', { peerId: conn.peer });
            });
        }

        conn.on('data', (data) => {
            if (!data || !data.type) return;
            this.emit(data.type, data.payload || {});
        });

        conn.on('close', () => {
            this.emit('disconnected');
        });

        conn.on('error', (error) => {
            this.emit('error', { error: error.message || 'Errore connessione peer' });
        });
    }

    send(type, payload = {}) {
        if (!this.connection || !this.connection.open) {
            throw new Error('Connessione peer non attiva');
        }

        this.connection.send({ type, payload });
    }

    sendSetupComplete() {
        this.send('opponent_ready', {});
    }

    sendChatConfig(chatEnabled) {
        this.chatEnabled = chatEnabled;
        this.send('chat_config', { chatEnabled });
    }

    sendAttack(row, col) {
        this.send('opponent_attack', { row, col });
    }

    sendAttackResult(payload) {
        this.send('attack_result', payload);
    }

    sendChatMessage(message) {
        if (!this.chatEnabled) {
            console.warn('Chat disabilitata, messaggio non inviato');
            return;
        }
        this.send('chat_message', { message });
    }

    sendSlotMachineStart() {
        this.send('slot_machine_start', {});
    }

    sendSlotMachineResult(result, isLastShip = false) {
        this.send('slot_machine_result', { result, isLastShip });
    }

    sendSlotMachineClosed() {
        this.send('slot_machine_closed', {});
    }

    sendGameOver(payload) {
        this.send('game_over', payload);
    }

    isConnected() {
        return !!(this.connection && this.connection.open);
    }

    disconnect() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }

        // Chiudi la chiamata video se attiva
        if (this.call) {
            this.call.close();
            this.call = null;
        }

        // Ferma lo stream locale
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        this.remoteStream = null;
    }

    // ==================== WEBCAM METHODS ====================

    /**
     * Abilita la webcam e configura lo streaming
     */
    enableWebcam(enabled) {
        this.webcamEnabled = enabled;
    }

    /**
     * Avvia lo streaming video con il peer connesso
     */
    async startVideoCall(localStream) {
        if (!this.peer || !this.connection || !this.connection.open) {
            throw new Error('Connessione peer non attiva');
        }

        if (!localStream) {
            throw new Error('Stream locale non disponibile');
        }

        this.localStream = localStream;

        console.log('📹 Avvio chiamata video con peer:', this.connection.peer);

        // Effettua la chiamata video
        this.call = this.peer.call(this.connection.peer, localStream);

        // Gestisci lo stream remoto
        this.call.on('stream', (remoteStream) => {
            console.log('📹 Stream remoto ricevuto');
            this.remoteStream = remoteStream;
            this.emit('remote_stream', { stream: remoteStream });
        });

        this.call.on('close', () => {
            console.log('📹 Chiamata video chiusa');
            this.remoteStream = null;
            this.emit('video_call_closed');
        });

        this.call.on('error', (error) => {
            console.error('❌ Errore chiamata video:', error);
            this.emit('video_call_error', { error: error.message });
        });
    }

    /**
     * Risponde a una chiamata video in arrivo
     */
    answerVideoCall(incomingCall, localStream) {
        if (!localStream) {
            console.warn('Stream locale non disponibile, rispondo senza video');
        }

        this.call = incomingCall;
        this.localStream = localStream;

        console.log('📹 Rispondo a chiamata video');

        // Rispondi con il tuo stream
        this.call.answer(localStream);

        // Gestisci lo stream remoto
        this.call.on('stream', (remoteStream) => {
            console.log('📹 Stream remoto ricevuto (answer)');
            this.remoteStream = remoteStream;
            this.emit('remote_stream', { stream: remoteStream });
        });

        this.call.on('close', () => {
            console.log('📹 Chiamata video chiusa');
            this.remoteStream = null;
            this.emit('video_call_closed');
        });

        this.call.on('error', (error) => {
            console.error('❌ Errore chiamata video:', error);
            this.emit('video_call_error', { error: error.message });
        });
    }

    /**
     * Setup listener per chiamate video in arrivo
     */
    setupVideoCallListener() {
        if (!this.peer) return;

        this.peer.on('call', (incomingCall) => {
            console.log('📹 Chiamata video in arrivo');
            this.emit('incoming_video_call', { call: incomingCall });
        });
    }

    /**
     * Ottiene lo stream remoto
     */
    getRemoteStream() {
        return this.remoteStream;
    }

    /**
     * Ottiene lo stream locale
     */
    getLocalStream() {
        return this.localStream;
    }

    /**
     * Verifica se la webcam è abilitata
     */
    isWebcamEnabled() {
        return this.webcamEnabled;
    }
}

window.PeerMultiplayer = PeerMultiplayer;

// Made with Bob
