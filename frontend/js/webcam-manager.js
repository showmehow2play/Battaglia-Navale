console.log('📦 Caricamento webcam-manager.js...');

/**
 * WebcamManager - Gestisce la webcam per la modalità Face-to-Face
 * Supporta solo video (no audio) per privacy
 */
class WebcamManager {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.isEnabled = false;
        this.localVideoElement = null;
        this.remoteVideoElement = null;
        this.eventHandlers = {};
    }

    /**
     * Registra un event handler
     */
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    /**
     * Emette un evento
     */
    emit(event, data = {}) {
        if (!this.eventHandlers[event]) return;
        this.eventHandlers[event].forEach(handler => handler(data));
    }

    /**
     * Verifica se la webcam è supportata
     */
    async isWebcamSupported() {
        try {
            // Verifica HTTPS o localhost
            const isSecure = window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1';
            
            if (!isSecure) {
                console.warn('Webcam richiede HTTPS');
                return false;
            }

            // Verifica API disponibile
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('getUserMedia non supportato');
                return false;
            }

            // Verifica presenza dispositivi video
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideoDevice = devices.some(device => device.kind === 'videoinput');
            
            return hasVideoDevice;
        } catch (error) {
            console.error('Errore verifica webcam:', error);
            return false;
        }
    }

    /**
     * Richiede permessi e avvia la webcam
     */
    async enableWebcam() {
        try {
            console.log('🎥 Richiesta accesso webcam...');
            
            // Richiedi solo video, no audio
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            this.isEnabled = true;
            console.log('✓ Webcam attivata');
            
            // Collega al video element se disponibile
            if (this.localVideoElement) {
                this.localVideoElement.srcObject = this.localStream;
            }

            this.emit('webcam_enabled', { stream: this.localStream });
            return this.localStream;

        } catch (error) {
            console.error('❌ Errore attivazione webcam:', error);
            this.isEnabled = false;
            
            let errorMessage = 'Impossibile accedere alla webcam';
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Permesso webcam negato';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'Nessuna webcam trovata';
            }
            
            this.emit('webcam_error', { error: errorMessage });
            throw new Error(errorMessage);
        }
    }

    /**
     * Disabilita la webcam
     */
    disableWebcam() {
        if (this.localStream) {
            console.log('🎥 Disattivazione webcam...');
            this.localStream.getTracks().forEach(track => {
                track.stop();
            });
            
            if (this.localVideoElement) {
                this.localVideoElement.srcObject = null;
            }
            
            this.localStream = null;
            this.isEnabled = false;
            
            this.emit('webcam_disabled');
            console.log('✓ Webcam disattivata');
        }
    }

    /**
     * Toggle video on/off (mantiene lo stream attivo)
     */
    toggleVideo() {
        if (!this.localStream) return false;
        
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            this.emit('video_toggled', { enabled: videoTrack.enabled });
            return videoTrack.enabled;
        }
        return false;
    }

    /**
     * Collega lo stream locale a un video element
     */
    attachLocalVideo(videoElement) {
        this.localVideoElement = videoElement;
        if (this.localStream && videoElement) {
            videoElement.srcObject = this.localStream;
            videoElement.muted = true; // Sempre muted per video locale
        }
    }

    /**
     * Collega lo stream remoto a un video element
     */
    attachRemoteVideo(videoElement, stream) {
        this.remoteVideoElement = videoElement;
        this.remoteStream = stream;
        
        if (videoElement && stream) {
            videoElement.srcObject = stream;
            this.emit('remote_video_attached', { stream });
        }
    }

    /**
     * Ottiene lo stream locale
     */
    getLocalStream() {
        return this.localStream;
    }

    /**
     * Ottiene lo stream remoto
     */
    getRemoteStream() {
        return this.remoteStream;
    }

    /**
     * Verifica se la webcam è attiva
     */
    isActive() {
        return this.isEnabled && this.localStream !== null;
    }

    /**
     * Cleanup completo
     */
    cleanup() {
        console.log('🧹 Cleanup webcam manager...');
        
        this.disableWebcam();
        
        if (this.remoteVideoElement) {
            this.remoteVideoElement.srcObject = null;
        }
        
        this.remoteStream = null;
        this.localVideoElement = null;
        this.remoteVideoElement = null;
        this.eventHandlers = {};
    }
}

window.WebcamManager = WebcamManager;

// Made with Bob