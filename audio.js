
class AudioManager {
    constructor() {
        this.soundEnabled = this.getSetting('sound-enabled', true);
        this.speechEnabled = this.getSetting('speech-enabled', true);
        this.autoSpeak = this.getSetting('auto-speak', true);
        
        this.setupEventListeners();
    }
    
    getSetting(key, defaultValue) {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    }
    
    setSetting(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    
    setupEventListeners() {
        
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target.tagName === 'BUTTON' || target.closest('button')) {
                this.playButtonSound();
            }
        });
    }
    
    playButtonSound() {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Audio context not available:', error);
        }
    }
    
    playNotificationSound() {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio context not available:', error);
        }
    }
    
    speak(text) {
        if (!this.autoSpeak || !('speechSynthesis' in window)) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Try to use a more natural voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.name.includes('Natural') || 
            voice.name.includes('Enhanced') ||
            voice.name.includes('Premium')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    }
    
    // Speech Recognition
    setupSpeechRecognition() {
        if (!this.speechEnabled || !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            return null;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        return recognition;
    }
    
    updateSettings(settings) {
        this.soundEnabled = settings.soundEnabled;
        this.speechEnabled = settings.speechEnabled;
        this.autoSpeak = settings.autoSpeak;
        
        this.setSetting('sound-enabled', this.soundEnabled);
        this.setSetting('speech-enabled', this.speechEnabled);
        this.setSetting('auto-speak', this.autoSpeak);
    }
}

// Initialize audio manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.audioManager = new AudioManager();
});