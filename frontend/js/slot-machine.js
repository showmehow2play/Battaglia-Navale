/**
 * Slot Machine Manager - Gestisce la slot machine quando una nave viene affondata
 * Versione con un solo rullo e pulsante START/STOP
 */

console.log('📦 Caricamento slot-machine.js...');

class SlotMachineManager {
    constructor() {
        this.modal = null;
        this.reel = null;
        this.isSpinning = false;
        this.spinInterval = null;
        this.options = ['Dimmi', 'Dammi', 'Comanda'];
        this.finalResult = null;
        this.onResultCallback = null; // Callback per notificare il risultato
    }

    /**
     * Inizializza la slot machine
     */
    init() {
        this.modal = document.getElementById('slotMachineModal');
        
        if (!this.modal) {
            console.error('Slot machine modal non trovato!');
            return;
        }
        
        this.reel = document.getElementById('slotReel1');

        if (!this.reel) {
            console.error('Reel non trovato!');
            return;
        }

        // Setup event listeners
        const startStopBtn = document.getElementById('startStopSlotBtn');
        const closeBtn = document.getElementById('closeSlotBtn');
        
        if (startStopBtn) {
            startStopBtn.addEventListener('click', () => {
                if (!this.isSpinning) {
                    this.startSpin();
                } else {
                    this.stopSlot();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
    }

    /**
     * Mostra la slot machine
     * @param {Function} onResult - Callback chiamato quando viene estratto un risultato
     */
    show(onResult = null) {
        if (!this.modal) {
            this.init();
            if (!this.modal) {
                console.error('Impossibile inizializzare il modal');
                return;
            }
        }

        // Reset stato
        this.isSpinning = false;
        this.finalResult = null;
        this.spinInterval = null;
        this.onResultCallback = onResult;

        // Nascondi risultato e pulsante chiudi
        const slotResult = document.getElementById('slotResult');
        const closeBtn = document.getElementById('closeSlotBtn');
        const startStopBtn = document.getElementById('startStopSlotBtn');
        
        if (slotResult) slotResult.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';
        if (startStopBtn) {
            startStopBtn.style.display = 'inline-block';
            startStopBtn.disabled = false;
            startStopBtn.textContent = 'START';
            startStopBtn.classList.remove('stop-button');
            startStopBtn.classList.add('start-button');
        }

        // Reset reel
        if (this.reel) {
            this.reel.classList.remove('spinning', 'stopping');
            this.resetReelPosition(this.reel);
        }

        // Mostra modal
        this.modal.style.display = 'flex';
    }

    /**
     * Resetta la posizione del reel
     */
    resetReelPosition(reel) {
        const items = reel.querySelectorAll('.slot-item');
        items.forEach((item, index) => {
            item.textContent = this.options[index % 3];
        });
    }

    /**
     * Inizia lo spin della slot machine
     */
    startSpin() {
        if (this.isSpinning) return;

        this.isSpinning = true;

        // Cambia il pulsante da START a STOP
        const startStopBtn = document.getElementById('startStopSlotBtn');
        if (startStopBtn) {
            startStopBtn.textContent = 'STOP';
            startStopBtn.classList.remove('start-button');
            startStopBtn.classList.add('stop-button');
        }

        // Avvia lo spin del reel
        this.reel.classList.add('spinning');
        
        // Crea un intervallo per cambiare i valori rapidamente
        this.spinInterval = setInterval(() => {
            const items = this.reel.querySelectorAll('.slot-item');
            items.forEach(item => {
                item.textContent = this.options[Math.floor(Math.random() * 3)];
            });
        }, 100);
    }

    /**
     * Ferma la slot machine
     */
    stopSlot() {
        if (!this.isSpinning) return;

        // Disabilita il pulsante STOP
        const startStopBtn = document.getElementById('startStopSlotBtn');
        if (startStopBtn) {
            startStopBtn.disabled = true;
        }

        // Ferma il reel
        this.stopReel();

        // Dopo che il reel si è fermato, mostra il risultato E notifica il callback
        setTimeout(() => {
            this.showResult();
            
            // FIX 1: Notifica il risultato quando si preme STOP, non alla chiusura del modal
            if (this.onResultCallback && typeof this.onResultCallback === 'function') {
                this.onResultCallback(this.finalResult);
                this.onResultCallback = null; // Reset callback per evitare chiamate multiple
            }
        }, 800);
    }

    /**
     * Ferma il reel
     */
    stopReel() {
        // Ferma l'intervallo
        if (this.spinInterval) {
            clearInterval(this.spinInterval);
            this.spinInterval = null;
        }

        // Rimuovi classe spinning
        this.reel.classList.remove('spinning');

        // Scegli un risultato casuale
        this.finalResult = this.options[Math.floor(Math.random() * 3)];

        // Imposta tutti gli item del reel sullo stesso valore
        const items = this.reel.querySelectorAll('.slot-item');
        items.forEach(item => {
            item.textContent = this.finalResult;
        });

        // Aggiungi animazione di bounce
        this.reel.classList.add('stopping');
        setTimeout(() => {
            this.reel.classList.remove('stopping');
        }, 500);

        // Effetto sonoro (opzionale - puoi aggiungere un suono)
        this.playStopSound();
    }

    /**
     * Mostra il risultato finale
     */
    showResult() {
        this.isSpinning = false;

        // Mostra il risultato
        const resultElement = document.getElementById('slotResult');
        const resultTextElement = resultElement.querySelector('.slot-result-text');
        resultTextElement.innerHTML = `🎉 ${this.finalResult.toUpperCase()}! 🎉`;
        resultElement.style.display = 'block';

        // Nascondi pulsante START/STOP e mostra pulsante Chiudi
        const startStopBtn = document.getElementById('startStopSlotBtn');
        if (startStopBtn) {
            startStopBtn.style.display = 'none';
        }
        
        const closeBtn = document.getElementById('closeSlotBtn');
        if (closeBtn) {
            closeBtn.style.display = 'inline-block';
        }

        // Effetto confetti
        this.createConfetti();
    }

    /**
     * Chiude il modal
     */
    closeModal() {
        // Ferma l'intervallo se ancora attivo
        if (this.spinInterval) {
            clearInterval(this.spinInterval);
            this.spinInterval = null;
        }

        // Nascondi modal
        this.modal.style.display = 'none';
        this.isSpinning = false;
        
        // FIX 1: Non chiamare più il callback qui - viene chiamato quando si preme STOP
        // Il callback è già stato chiamato in stopSlot()
    }

    /**
     * Effetto sonoro quando si ferma il reel (placeholder)
     */
    playStopSound() {
        // Puoi aggiungere un suono qui se vuoi
        // const audio = new Audio('sounds/slot-stop.mp3');
        // audio.play();
    }

    /**
     * Crea effetto confetti
     */
    createConfetti() {
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '10000';
                confetti.style.animation = 'confetti 3s ease-out forwards';

                document.body.appendChild(confetti);

                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 30);
        }
    }
}

// Crea istanza globale
window.slotMachineManager = new SlotMachineManager();

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    window.slotMachineManager.init();
});

// Made with Bob
