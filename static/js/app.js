// Jyotisha - Main Application JavaScript

// Get logo path from window or use default
const LOGO_PATH = window.LOGO_PATH || 'logo.png';

class AIChat {
    constructor() {
        // DOM Elements
        this.sidebar = document.getElementById('sidebar');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.chatHistory = document.getElementById('chatHistory');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        
        // Settings Elements
        this.apiEndpointInput = document.getElementById('apiEndpoint');
        this.modelNameInput = document.getElementById('modelName');
        this.apiFormatSelect = document.getElementById('apiFormat');
        this.customFormatGroup = document.getElementById('customFormatGroup');
        this.customRequestTemplate = document.getElementById('customRequestTemplate');
        this.apiKeyInput = document.getElementById('apiKey');
        this.temperatureInput = document.getElementById('temperature');
        this.tempValueSpan = document.getElementById('tempValue');
        this.maxTokensInput = document.getElementById('maxTokens');
        this.systemPromptInput = document.getElementById('systemPrompt');
        this.testConnectionBtn = document.getElementById('testConnectionBtn');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.resetSettingsBtn = document.getElementById('resetSettings');
        
        // State
        this.chats = [];
        this.currentChatId = null;
        this.isGenerating = false;
        this.abortController = null;
        
        // Default Settings
        this.defaultSettings = {
            apiEndpoint: 'http://localhost:11434/api/generate',
            modelName: 'llama2',
            apiFormat: 'ollama',
            customRequestTemplate: '{"prompt": "{{message}}", "model": "{{model}}"}',
            apiKey: '',
            temperature: 0.7,
            maxTokens: 2048,
            systemPrompt: ''
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.loadChats();
        this.bindEvents();
        this.renderChatHistory();
        
        // Load current chat if exists
        if (this.currentChatId) {
            this.loadChat(this.currentChatId);
        }
    }
    
    bindEvents() {
        // Mobile menu toggle
        this.mobileMenuToggle.addEventListener('click', () => this.toggleSidebar());
        
        // New chat button
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
        
        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettingsModal();
        });
        
        // Settings form
        this.apiFormatSelect.addEventListener('change', () => this.toggleCustomFormat());
        this.temperatureInput.addEventListener('input', () => {
            this.tempValueSpan.textContent = this.temperatureInput.value;
        });
        this.testConnectionBtn.addEventListener('click', () => this.testConnection());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        
        // Message input
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                this.messageInput.value = prompt;
                this.handleInputChange();
                this.sendMessage();
            });
        });
        
        // Close sidebar on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                this.sidebar.classList.contains('open') &&
                !this.sidebar.contains(e.target) &&
                !this.mobileMenuToggle.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsModal.classList.contains('active')) {
                this.closeSettingsModal();
            }
        });
    }
    
    // Sidebar Functions
    toggleSidebar() {
        this.sidebar.classList.toggle('open');
    }
    
    closeSidebar() {
        this.sidebar.classList.remove('open');
    }
    
    // Settings Functions
    loadSettings() {
        const saved = localStorage.getItem('aiChatSettings');
        const settings = saved ? JSON.parse(saved) : this.defaultSettings;
        
        this.apiEndpointInput.value = settings.apiEndpoint || this.defaultSettings.apiEndpoint;
        this.modelNameInput.value = settings.modelName || this.defaultSettings.modelName;
        this.apiFormatSelect.value = settings.apiFormat || this.defaultSettings.apiFormat;
        this.customRequestTemplate.value = settings.customRequestTemplate || this.defaultSettings.customRequestTemplate;
        this.apiKeyInput.value = settings.apiKey || '';
        this.temperatureInput.value = settings.temperature || this.defaultSettings.temperature;
        this.tempValueSpan.textContent = this.temperatureInput.value;
        this.maxTokensInput.value = settings.maxTokens || this.defaultSettings.maxTokens;
        this.systemPromptInput.value = settings.systemPrompt || '';
        
        this.toggleCustomFormat();
    }
    
    saveSettings() {
        const settings = {
            apiEndpoint: this.apiEndpointInput.value,
            modelName: this.modelNameInput.value,
            apiFormat: this.apiFormatSelect.value,
            customRequestTemplate: this.customRequestTemplate.value,
            apiKey: this.apiKeyInput.value,
            temperature: parseFloat(this.temperatureInput.value),
            maxTokens: parseInt(this.maxTokensInput.value),
            systemPrompt: this.systemPromptInput.value
        };
        
        localStorage.setItem('aiChatSettings', JSON.stringify(settings));
        this.closeSettingsModal();
    }
    
    resetSettings() {
        this.apiEndpointInput.value = this.defaultSettings.apiEndpoint;
        this.modelNameInput.value = this.defaultSettings.modelName;
        this.apiFormatSelect.value = this.defaultSettings.apiFormat;
        this.customRequestTemplate.value = this.defaultSettings.customRequestTemplate;
        this.apiKeyInput.value = '';
        this.temperatureInput.value = this.defaultSettings.temperature;
        this.tempValueSpan.textContent = this.defaultSettings.temperature;
        this.maxTokensInput.value = this.defaultSettings.maxTokens;
        this.systemPromptInput.value = '';
        
        this.toggleCustomFormat();
    }
    
    toggleCustomFormat() {
        if (this.apiFormatSelect.value === 'custom') {
            this.customFormatGroup.style.display = 'block';
        } else {
            this.customFormatGroup.style.display = 'none';
        }
    }
    
    openSettings() {
        this.settingsModal.classList.add('active');
        this.closeSidebar();
    }
    
    closeSettingsModal() {
        this.settingsModal.classList.remove('active');
        this.connectionStatus.className = 'connection-status';
        this.connectionStatus.textContent = '';
    }
    
    async testConnection() {
        const endpoint = this.apiEndpointInput.value;
        const model = this.modelNameInput.value;
        const format = this.apiFormatSelect.value;
        
        this.connectionStatus.className = 'connection-status loading';
        this.connectionStatus.textContent = 'Testing connection...';
        this.testConnectionBtn.disabled = true;
        
        try {
            const { url, options } = this.buildRequest('Hello', model, endpoint, format);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                this.connectionStatus.className = 'connection-status success';
                this.connectionStatus.textContent = '✓ Connection successful! Your LLM is responding.';
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.connectionStatus.className = 'connection-status error';
            if (error.name === 'AbortError') {
                this.connectionStatus.textContent = '✗ Connection timed out. Is your LLM server running?';
            } else {
                this.connectionStatus.textContent = `✗ Connection failed: ${error.message}`;
            }
        } finally {
            this.testConnectionBtn.disabled = false;
        }
    }
    
    // Chat Functions
    loadChats() {
        const saved = localStorage.getItem('aiChatHistory');
        this.chats = saved ? JSON.parse(saved) : [];
        
        const currentId = localStorage.getItem('aiChatCurrentId');
        if (currentId && this.chats.find(c => c.id === currentId)) {
            this.currentChatId = currentId;
        }
    }
    
    saveChats() {
        localStorage.setItem('aiChatHistory', JSON.stringify(this.chats));
        if (this.currentChatId) {
            localStorage.setItem('aiChatCurrentId', this.currentChatId);
        }
    }
    
    createNewChat() {
        const chat = {
            id: this.generateId(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        this.chats.unshift(chat);
        this.currentChatId = chat.id;
        this.saveChats();
        this.renderChatHistory();
        this.clearMessages();
        this.showWelcomeMessage();
        this.closeSidebar();
        this.messageInput.focus();
    }
    
    loadChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;
        
        this.currentChatId = chatId;
        localStorage.setItem('aiChatCurrentId', chatId);
        this.clearMessages();
        
        if (chat.messages.length === 0) {
            this.showWelcomeMessage();
        } else {
            this.hideWelcomeMessage();
            chat.messages.forEach(msg => this.appendMessage(msg.role, msg.content, msg.timestamp));
        }
        
        this.renderChatHistory();
        this.closeSidebar();
    }
    
    deleteChat(chatId) {
        this.chats = this.chats.filter(c => c.id !== chatId);
        
        if (this.currentChatId === chatId) {
            this.currentChatId = null;
            this.clearMessages();
            this.showWelcomeMessage();
        }
        
        this.saveChats();
        this.renderChatHistory();
    }
    
    renderChatHistory() {
        this.chatHistory.innerHTML = '';
        
        this.chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = `chat-history-item${chat.id === this.currentChatId ? ' active' : ''}`;
            item.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="chat-title">${this.escapeHtml(chat.title)}</span>
                <button class="delete-chat" title="Delete chat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            
            item.querySelector('.chat-title').addEventListener('click', () => this.loadChat(chat.id));
            item.querySelector('.delete-chat').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this chat?')) {
                    this.deleteChat(chat.id);
                }
            });
            
            this.chatHistory.appendChild(item);
        });
    }
    
    // Message Functions
    handleInputChange() {
        // Auto-resize textarea
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 200) + 'px';
        
        // Enable/disable send button
        const hasContent = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasContent || this.isGenerating;
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.sendBtn.disabled) {
                this.sendMessage();
            }
        }
    }
    
    async sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content || this.isGenerating) return;
        
        // Create chat if none exists
        if (!this.currentChatId) {
            this.createNewChat();
        }
        
        // Hide welcome message
        this.hideWelcomeMessage();
        
        // Get current chat
        const chat = this.chats.find(c => c.id === this.currentChatId);
        if (!chat) return;
        
        // Add user message
        const userMessage = {
            role: 'user',
            content: content,
            timestamp: new Date().toISOString()
        };
        chat.messages.push(userMessage);
        this.appendMessage('user', content, userMessage.timestamp);
        
        // Update chat title if it's the first message
        if (chat.messages.length === 1) {
            chat.title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
            this.renderChatHistory();
        }
        
        // Clear input
        this.messageInput.value = '';
        this.handleInputChange();
        
        // Show typing indicator
        const typingEl = this.showTypingIndicator();
        
        // Generate response
        this.isGenerating = true;
        this.sendBtn.disabled = true;
        
        try {
            const settings = this.getSettings();
            const response = await this.generateResponse(chat.messages, settings);
            
            // Remove typing indicator
            typingEl.remove();
            
            // Add assistant message
            const assistantMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };
            chat.messages.push(assistantMessage);
            this.appendMessage('assistant', response, assistantMessage.timestamp);
            
        } catch (error) {
            typingEl.remove();
            this.showError(error.message);
        } finally {
            this.isGenerating = false;
            this.handleInputChange();
            this.saveChats();
        }
    }
    
    async generateResponse(messages, settings) {
        const { apiEndpoint, modelName, apiFormat, apiKey, temperature, maxTokens, systemPrompt, customRequestTemplate } = settings;
        
        // Build the prompt from messages
        let prompt = '';
        if (systemPrompt) {
            prompt += `System: ${systemPrompt}\n\n`;
        }
        messages.forEach(msg => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            prompt += `${role}: ${msg.content}\n\n`;
        });
        prompt += 'Assistant: ';
        
        // Build request based on format
        const { url, options } = this.buildRequest(prompt, modelName, apiEndpoint, apiFormat, {
            temperature,
            maxTokens,
            apiKey,
            customRequestTemplate,
            messages,
            systemPrompt
        });
        
        this.abortController = new AbortController();
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: this.abortController.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Handle streaming or regular response
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/x-ndjson')) {
                // Streaming response (Ollama style)
                return await this.handleStreamingResponse(response);
            } else {
                // Regular JSON response
                const data = await response.json();
                return this.extractResponse(data, apiFormat);
            }
        } finally {
            this.abortController = null;
        }
    }
    
    buildRequest(prompt, model, endpoint, format, options = {}) {
        const { temperature = 0.7, maxTokens = 2048, apiKey, customRequestTemplate, messages = [], systemPrompt } = options;
        
        let url = endpoint;
        let body;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
        
        switch (format) {
            case 'ollama':
                body = {
                    model: model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: temperature,
                        num_predict: maxTokens
                    }
                };
                break;
                
            case 'openai':
                // Convert messages to OpenAI format
                const openaiMessages = [];
                if (systemPrompt) {
                    openaiMessages.push({ role: 'system', content: systemPrompt });
                }
                if (messages && messages.length > 0) {
                    messages.forEach(msg => {
                        openaiMessages.push({ role: msg.role, content: msg.content });
                    });
                }
                
                body = {
                    model: model,
                    messages: openaiMessages.length > 0 ? openaiMessages : [{ role: 'user', content: prompt }],
                    temperature: temperature,
                    max_tokens: maxTokens
                };
                break;
                
            case 'custom':
                try {
                    let template = customRequestTemplate || '{"prompt": "{{message}}", "model": "{{model}}"}';
                    // Safely escape the prompt for JSON embedding
                    const escapedPrompt = prompt
                        .replace(/\\/g, '\\\\')
                        .replace(/"/g, '\\"')
                        .replace(/\n/g, '\\n')
                        .replace(/\r/g, '\\r')
                        .replace(/\t/g, '\\t');
                    // Safely escape the model name
                    const escapedModel = model
                        .replace(/\\/g, '\\\\')
                        .replace(/"/g, '\\"');
                    template = template.replace(/\{\{message\}\}/g, escapedPrompt);
                    template = template.replace(/\{\{model\}\}/g, escapedModel);
                    body = JSON.parse(template);
                } catch {
                    throw new Error('Invalid custom request template. Please check your JSON format.');
                }
                break;
                
            default:
                body = { prompt, model };
        }
        
        return {
            url,
            options: {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            }
        };
    }
    
    async handleStreamingResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.response) {
                            fullResponse += data.response;
                        }
                        if (data.done) {
                            return fullResponse;
                        }
                    } catch {
                        // Ignore parse errors for incomplete chunks
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
        
        return fullResponse;
    }
    
    extractResponse(data, format) {
        switch (format) {
            case 'ollama':
                return data.response || data.message?.content || '';
            case 'openai':
                return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
            default:
                // Try common response fields
                return data.response || data.content || data.text || data.output || 
                       data.choices?.[0]?.message?.content || data.choices?.[0]?.text || 
                       JSON.stringify(data);
        }
    }
    
    getSettings() {
        const saved = localStorage.getItem('aiChatSettings');
        return saved ? JSON.parse(saved) : this.defaultSettings;
    }
    
    // UI Helper Functions
    appendMessage(role, content, timestamp) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        
        const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (role === 'user') {
            messageEl.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">${this.escapeHtml(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
                <div class="message-avatar">U</div>
            `;
        } else {
            messageEl.innerHTML = `
                <div class="message-avatar">
                    <img src="${LOGO_PATH}" alt="AI">
                </div>
                <div class="message-content">
                    <div class="message-bubble">${this.formatMessage(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        }
        
        this.messagesContainer.appendChild(messageEl);
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        const typingEl = document.createElement('div');
        typingEl.className = 'message assistant';
        typingEl.innerHTML = `
            <div class="message-avatar">
                <img src="${LOGO_PATH}" alt="AI">
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingEl);
        this.scrollToBottom();
        return typingEl;
    }
    
    showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>${this.escapeHtml(message)}</span>
        `;
        
        this.messagesContainer.appendChild(errorEl);
        this.scrollToBottom();
    }
    
    clearMessages() {
        this.messagesContainer.innerHTML = '';
    }
    
    showWelcomeMessage() {
        if (!this.messagesContainer.querySelector('.welcome-message')) {
            this.messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <img src="${LOGO_PATH}" alt="Logo" class="welcome-logo">
                    <h2>Welcome to Jyotisha</h2>
                    <p>Configure your local LLM endpoint in settings and start chatting!</p>
                    <div class="quick-actions">
                        <button class="quick-action" data-prompt="Explain quantum computing in simple terms">
                            💡 Explain quantum computing
                        </button>
                        <button class="quick-action" data-prompt="Write a short poem about technology">
                            ✍️ Write a poem
                        </button>
                        <button class="quick-action" data-prompt="What are the best practices for software development?">
                            💻 Coding best practices
                        </button>
                    </div>
                </div>
            `;
            
            // Re-bind quick action events
            document.querySelectorAll('.quick-action').forEach(btn => {
                btn.addEventListener('click', () => {
                    const prompt = btn.dataset.prompt;
                    this.messageInput.value = prompt;
                    this.handleInputChange();
                    this.sendMessage();
                });
            });
        }
    }
    
    hideWelcomeMessage() {
        const welcome = this.messagesContainer.querySelector('.welcome-message');
        if (welcome) {
            welcome.remove();
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatMessage(content) {
        // Basic markdown-like formatting
        let formatted = this.escapeHtml(content);
        
        // Code blocks
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Bold
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiChat = new AIChat();
});
