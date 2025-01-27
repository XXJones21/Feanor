class ParameterDialog {
    constructor() {
        this.dialog = null;
        this.paramInputs = {};
    }

    show(tool) {
        // Create dialog if it doesn't exist
        if (!this.dialog) {
            this.createDialog();
        }

        // Clear previous inputs
        this.paramInputs = {};
        
        // Set dialog title
        const header = this.dialog.querySelector('.dialog-header');
        header.textContent = `Use ${tool.function.name}`;

        // Create parameter inputs
        const content = this.dialog.querySelector('.dialog-content');
        content.innerHTML = '';

        Object.entries(tool.function.parameters.properties).forEach(([name, info]) => {
            const group = document.createElement('div');
            group.className = 'param-group';

            const label = document.createElement('label');
            label.className = 'param-label';
            label.textContent = name;

            const input = document.createElement('input');
            input.className = 'param-input';
            input.placeholder = info.description;

            // Add file browser for path parameters
            if (info.description.toLowerCase().includes('path') || 
                info.description.toLowerCase().includes('file') ||
                info.description.toLowerCase().includes('directory')) {
                const wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.gap = '8px';

                wrapper.appendChild(input);

                const browseBtn = document.createElement('button');
                browseBtn.textContent = 'Browse...';
                browseBtn.className = 'dialog-btn';
                browseBtn.onclick = () => this.browsePath(input);
                wrapper.appendChild(browseBtn);

                group.appendChild(label);
                group.appendChild(wrapper);
            } else {
                group.appendChild(label);
                group.appendChild(input);
            }

            if (info.description) {
                const desc = document.createElement('div');
                desc.className = 'param-description';
                desc.textContent = info.description;
                group.appendChild(desc);
            }

            content.appendChild(group);
            this.paramInputs[name] = input;
        });

        // Show dialog
        this.dialog.style.display = 'flex';

        // Return promise that resolves with parameters or rejects if cancelled
        return new Promise((resolve, reject) => {
            const confirmBtn = this.dialog.querySelector('.confirm');
            const cancelBtn = this.dialog.querySelector('.cancel');

            const cleanup = () => {
                confirmBtn.onclick = null;
                cancelBtn.onclick = null;
                this.dialog.style.display = 'none';
            };

            confirmBtn.onclick = () => {
                const params = {};
                Object.entries(this.paramInputs).forEach(([name, input]) => {
                    params[name] = input.value;
                });
                cleanup();
                resolve(params);
            };

            cancelBtn.onclick = () => {
                cleanup();
                reject(new Error('Cancelled'));
            };
        });
    }

    createDialog() {
        this.dialog = document.createElement('div');
        this.dialog.className = 'dialog-overlay';
        this.dialog.innerHTML = `
            <div class="dialog">
                <div class="dialog-header"></div>
                <div class="dialog-content"></div>
                <div class="dialog-buttons">
                    <button class="dialog-btn cancel">Cancel</button>
                    <button class="dialog-btn confirm">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.dialog);
    }

    async browsePath(input) {
        try {
            const path = await window.electron.showOpenDialog();
            if (path) {
                input.value = path;
            }
        } catch (error) {
            console.error('Error selecting file:', error);
        }
    }
}

module.exports = new ParameterDialog();