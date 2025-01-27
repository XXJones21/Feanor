class StatusManager {
    constructor() {
        // Wait for DOM to be ready before querying elements
        document.addEventListener('DOMContentLoaded', () => {
            this.dot = document.querySelector('.status-dot');
            this.text = document.querySelector('.status-text');
            this.details = document.querySelector('.status-details');
            this.checkInterval = null;
            this.retryCount = 0;
            this.maxRetries = 3;
        });
    }

    setStatus(status, details = '') {
        if (!this.dot || !this.text || !this.details) {
            console.warn('Status elements not initialized yet');
            return;
        }
        this.dot.className = 'status-dot ' + status;
        this.text.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        this.details.textContent = details;
    }

    async checkConnection() {
        try {
            console.log('Checking proxy server health...');
            const response = await fetch('http://127.0.0.1:4892/health');

            if (response.ok) {
                const data = await response.json();
                if (data.lmstudio_connected) {
                    this.setStatus('connected', 'Proxy & LM Studio');
                } else {
                    this.setStatus('disconnected', 'LM Studio not responding');
                }
                this.retryCount = 0;
                return true;
            } else {
                this.setStatus('disconnected', 'Proxy server error');
                return false;
            }
        } catch (error) {
            console.error('Connection error:', error.message);
            this.retryCount++;
            if (this.retryCount <= this.maxRetries) {
                this.setStatus('connecting', `Retrying (${this.retryCount}/${this.maxRetries})`);
            } else {
                this.setStatus('disconnected', 'Proxy server not responding');
            }
            return false;
        }
    }

    startMonitoring() {
        // Initial check
        this.setStatus('connecting', 'Initializing...');
        this.checkConnection();
        
        // Check connection every 10 seconds
        this.checkInterval = setInterval(() => {
            this.checkConnection();
        }, 10000);
    }

    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

module.exports = StatusManager; 