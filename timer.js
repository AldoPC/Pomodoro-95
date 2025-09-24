const { ipcRenderer } = require('electron');

class SoundManager {
    constructor() {
        // Determine correct path based on environment
        const isDev = process.env.NODE_ENV === 'development';
        const soundPath = isDev ? './sounds/' : '../sounds/';
        
        this.sounds = {
            chord: new Audio(soundPath + 'CHORD.WAV'),
            ding: new Audio(soundPath + 'DING.WAV'),
            tada: new Audio(soundPath + 'TADA.WAV')
        };
        
        // Preload sounds
        Object.values(this.sounds).forEach(sound => {
            sound.preload = 'auto';
            sound.volume = 0.7; // Set volume to 70%
        });
    }
    
    play(soundName) {
        try {
            if (this.sounds[soundName]) {
                this.sounds[soundName].currentTime = 0; // Reset to beginning
                this.sounds[soundName].play().catch(error => {
                    console.log('Sound playback failed:', error);
                });
            }
        } catch (error) {
            console.log('Sound error:', error);
        }
    }
}

class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.totalTime = 0;
        this.currentSession = 1;
        this.totalSessions = 4;
        this.isWorkSession = true;
        this.intervalId = null;
        this.settings = {
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            sessionsPerCycle: 4
        };
        
        this.soundManager = new SoundManager();
        this.initializeElements();
        this.loadSettings();
        this.initializeTimer();
    }

    initializeElements() {
        this.sessionTypeEl = document.getElementById('sessionType');
        this.sessionCountEl = document.getElementById('sessionCount');
        this.progressFillEl = document.getElementById('progressFill');
        this.titleBarTextEl = document.getElementById('titleBarText');
        this.startButtonEl = document.getElementById('startButton');
    }

    async loadSettings() {
        try {
            this.settings = await ipcRenderer.invoke('get-settings');
            this.totalSessions = this.settings.sessionsPerCycle;
            console.log('Loaded settings:', this.settings);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    initializeTimer() {
        // Set up the initial work session
        this.isWorkSession = true;
        this.currentSession = 1;
        this.totalTime = this.settings.workDuration * 60;
        this.currentTime = 0;
        this.sessionTypeEl.textContent = 'Work Session';
        document.body.className = 'work-session';
        this.updateDisplay();
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startButtonEl.textContent = 'Pause';
            this.startButtonEl.classList.add('running');
            
            this.intervalId = setInterval(() => {
                this.tick();
            }, 1000);
        } else if (!this.isPaused) {
            this.pauseTimer();
        } else {
            this.resumeTimer();
        }
    }

    pauseTimer() {
        this.isPaused = true;
        this.startButtonEl.textContent = 'Resume';
        clearInterval(this.intervalId);
        this.soundManager.play('chord');
    }

    resumeTimer() {
        this.isPaused = false;
        this.startButtonEl.textContent = 'Pause';
        this.startButtonEl.classList.add('running');
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    }

    stopTimer() {
        this.isRunning = false;
        this.isPaused = false;
        this.startButtonEl.textContent = 'Start';
        this.startButtonEl.classList.remove('running');
        clearInterval(this.intervalId);
    }

    resetTimer() {
        this.stopTimer();
        this.initializeTimer();
    }

    tick() {
        this.currentTime++;
        this.updateDisplay();
        
        if (this.currentTime >= this.totalTime) {
            this.completeSession();
        }
    }

    completeSession() {
        this.stopTimer();
        
        // Show notification
        this.showNotification();
        
        // Move to next session
        if (this.isWorkSession) {
            this.isWorkSession = false;
            // Determine if it's a long break (only after completing all work sessions)
            if (this.currentSession >= this.settings.sessionsPerCycle) {
                this.totalTime = this.settings.longBreakDuration * 60;
                this.sessionTypeEl.textContent = 'Long Break';
                document.body.className = 'long-break-session';
                // Play TADA when completing the final work session of a cycle
                this.soundManager.play('tada');
            } else {
                this.totalTime = this.settings.breakDuration * 60;
                this.sessionTypeEl.textContent = 'Break';
                document.body.className = 'break-session';
                // Play DING for regular work session completion
                this.soundManager.play('ding');
            }
        } else {
            // Break session completed - check if we should start a new cycle
            if (this.currentSession >= this.settings.sessionsPerCycle) {
                // Cycle completed - reset to session 1
                this.currentSession = 1;
                this.isWorkSession = true;
                this.totalTime = this.settings.workDuration * 60;
                this.sessionTypeEl.textContent = 'Work Session';
                document.body.className = 'work-session';
            } else {
                // Continue with next work session
                this.isWorkSession = true;
                this.currentSession++;
                this.totalTime = this.settings.workDuration * 60;
                this.sessionTypeEl.textContent = 'Work Session';
                document.body.className = 'work-session';
            }
            // Play DING for break completion
            this.soundManager.play('ding');
        }
        
        this.currentTime = 0;
        this.updateDisplay();
        
        // Auto-start next session after 2 seconds
        setTimeout(() => {
            this.startTimer();
        }, 2000);
    }

    async showNotification() {
        const isWorkSession = this.isWorkSession;
        const title = isWorkSession ? 'Work Session Complete!' : 'Break Time!';
        const body = isWorkSession ? 
            'Take a well-deserved break. You\'ve earned it!' : 
            'Time to get back to work. Let\'s be productive!';
        
        try {
            await ipcRenderer.invoke('show-notification', {
                title: title,
                body: body
            });
        } catch (error) {
            console.log('Notification failed:', error);
            // Fallback to a simple alert if notifications aren't supported
            alert(`${title}\n${body}`);
        }
    }

    updateDisplay() {
        // Update session count
        this.sessionCountEl.textContent = `Session ${this.currentSession} of ${this.totalSessions}`;
        
        // Update progress bar
        const progress = this.totalTime > 0 ? (this.currentTime / this.totalTime) * 100 : 0;
        this.progressFillEl.style.width = `${progress}%`;
        
        // Add animation class for segmented effect
        if (this.isRunning && !this.isPaused) {
            this.progressFillEl.classList.add('animating');
        } else {
            this.progressFillEl.classList.remove('animating');
        }
        
        // Update title bar with time display
        const remainingTime = this.totalTime - this.currentTime;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.titleBarTextEl.textContent = `Pomodoro 95 - ${timeString}`;
    }

    setSessionType(type) {
        this.isWorkSession = type === 'work';
        this.sessionTypeEl.textContent = type === 'work' ? 'Work Session' : 'Break';
        
        if (type === 'work') {
            this.totalTime = this.settings.workDuration * 60;
            document.body.className = 'work-session';
        } else {
            this.totalTime = this.settings.breakDuration * 60;
            document.body.className = 'break-session';
        }
        
        this.currentTime = 0;
        this.updateDisplay();
    }
}

// Global timer instance
let timer;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    timer = new PomodoroTimer();
});

// Global functions for button clicks
function toggleTimer() {
    timer.startTimer();
}

function resetTimer() {
    timer.resetTimer();
}

function showSettings() {
    ipcRenderer.invoke('show-settings');
}

function closeApp() {
    window.close();
}

// Listen for settings updates
ipcRenderer.on('settings-updated', (event, newSettings) => {
    console.log('Settings updated:', newSettings);
    timer.settings = newSettings;
    timer.totalSessions = newSettings.sessionsPerCycle;
    
    // If timer is not running, update the current session with new settings
    if (!timer.isRunning) {
        timer.initializeTimer();
    }
    
    timer.updateDisplay();
});
