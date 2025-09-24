const { ipcRenderer } = require('electron');

class SettingsManager {
    constructor() {
        this.initializeElements();
        this.loadSettings();
    }

    initializeElements() {
        this.workDurationEl = document.getElementById('workDuration');
        this.breakDurationEl = document.getElementById('breakDuration');
        this.longBreakDurationEl = document.getElementById('longBreakDuration');
        this.sessionsPerCycleEl = document.getElementById('sessionsPerCycle');
        this.alwaysOnTopEl = document.getElementById('alwaysOnTop');
    }

    async loadSettings() {
        try {
            const settings = await ipcRenderer.invoke('get-settings');
            this.workDurationEl.value = settings.workDuration;
            this.breakDurationEl.value = settings.breakDuration;
            this.longBreakDurationEl.value = settings.longBreakDuration;
            this.sessionsPerCycleEl.value = settings.sessionsPerCycle;
            this.alwaysOnTopEl.checked = settings.alwaysOnTop || false;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettings() {
        const settings = {
            workDuration: parseInt(this.workDurationEl.value),
            breakDuration: parseInt(this.breakDurationEl.value),
            longBreakDuration: parseInt(this.longBreakDurationEl.value),
            sessionsPerCycle: parseInt(this.sessionsPerCycleEl.value),
            alwaysOnTop: this.alwaysOnTopEl.checked
        };

        // Validate settings
        if (settings.workDuration < 1 || settings.workDuration > 60) {
            alert('Work duration must be between 1 and 60 minutes.');
            return;
        }

        if (settings.breakDuration < 1 || settings.breakDuration > 30) {
            alert('Break duration must be between 1 and 30 minutes.');
            return;
        }

        if (settings.longBreakDuration < 1 || settings.longBreakDuration > 60) {
            alert('Long break duration must be between 1 and 60 minutes.');
            return;
        }

        if (settings.sessionsPerCycle < 1 || settings.sessionsPerCycle > 10) {
            alert('Sessions per cycle must be between 1 and 10.');
            return;
        }

        try {
            await ipcRenderer.invoke('save-settings', settings);
            
            // Notify main window of settings update
            ipcRenderer.send('settings-updated', settings);
            
            // Close settings window
            closeSettings();
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings. Please try again.');
        }
    }
}

// Global settings manager instance
let settingsManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
});

// Global functions for button clicks
function saveSettings() {
    settingsManager.saveSettings();
}

function closeSettings() {
    window.close();
}

// Handle Enter key in input fields
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        saveSettings();
    } else if (event.key === 'Escape') {
        closeSettings();
    }
});
