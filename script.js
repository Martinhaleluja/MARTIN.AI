// Main Application Logic
class ChatApp {
    constructor() {
        this.userName = '';
        this.botName = '';
        this.currentTheme = 'light';
        this.messages = [];
        this.conversations = [];
        this.currentConversationId = null;
        this.isLoading = false;
        this.isListening = false;
        this.recognition = null;
        this.sidebarOpen = false;
        
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.loadTheme();
        this.setupSpeechRecognition();
        
        if (this.userName && this.botName) {
            this.showChatApp();
        } else {
            this.showUserSetup();
        }
    }
    
    loadUserData() {
        this.userName = localStorage.getItem('user-name') || '';
        this.botName = localStorage.getItem('bot-name') || '';
    }
    
    saveUserData() {
        localStorage.setItem('user-name', this.userName);
        localStorage.setItem('bot-name', this.botName);
    }
    
    loadTheme() {
        this.currentTheme = localStorage.getItem('chatbot-theme') || 'light';
        this.applyTheme(this.currentTheme);
    }
    
    applyTheme(theme) {
        document.documentElement.classList.remove('light', 'dark', 'education', 'focused');
        if (theme !== 'light') {
            document.documentElement.classList.add(theme);
        }
        
        // Update active theme button
        document.querySelectorAll('.btn-theme').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // Update theme options in settings
        document.querySelectorAll('.theme-option').forEach(option => {
            const badge = option.querySelector('.theme-badge');
            if (option.dataset.theme === theme) {
                option.classList.add('active');
                if (!badge) {
                    const newBadge = document.createElement('span');
                    newBadge.className = 'theme-badge';
                    newBadge.textContent = 'Active';
                    option.appendChild(newBadge);
                }
            } else {
                option.classList.remove('active');
                if (badge) {
                    badge.remove();
                }
            }
        });
        
        localStorage.setItem('chatbot-theme', theme);
    }
    
    setupEventListeners() {
        // User Setup
        this.setupUserSetupListeners();
        
        // Theme switching
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-theme')) {
                this.applyTheme(e.target.dataset.theme);
                this.currentTheme = e.target.dataset.theme;
            }
            
            if (e.target.matches('.theme-option') || e.target.closest('.theme-option')) {
                const option = e.target.closest('.theme-option') || e.target;
                this.applyTheme(option.dataset.theme);
                this.currentTheme = option.dataset.theme;
            }
        });
        
        // Sidebar
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        document.getElementById('sidebar-close')?.addEventListener('click', () => {
            this.closeSidebar();
        });
        
        document.getElementById('sidebar-backdrop')?.addEventListener('click', () => {
            this.closeSidebar();
        });
        
        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.openSettings();
        });
        
        document.getElementById('header-settings')?.addEventListener('click', () => {
            this.openSettings();
        });
        
        // Modal
        this.setupModalListeners();
        
        // Chat
        this.setupChatListeners();
        
        // API Setup
        this.setupApiListeners();
        
        // Conversations
        document.getElementById('new-conversation')?.addEventListener('click', () => {
            this.createNewConversation();
        });
    }
    
    setupUserSetupListeners() {
        const userNameInput = document.getElementById('user-name-input');
        const botNameInput = document.getElementById('bot-name-input');
        const continueBtn = document.getElementById('continue-btn');
        const backBtn = document.getElementById('back-btn');
        const startChatBtn = document.getElementById('start-chat-btn');
        
        userNameInput?.addEventListener('input', (e) => {
            continueBtn.disabled = !e.target.value.trim();
        });
        
        userNameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !continueBtn.disabled) {
                this.proceedToStep2();
            }
        });
        
        botNameInput?.addEventListener('input', (e) => {
            startChatBtn.disabled = !e.target.value.trim();
        });
        
        botNameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !startChatBtn.disabled) {
                this.completeSetup();
            }
        });
        
        continueBtn?.addEventListener('click', () => {
            this.proceedToStep2();
        });
        
        backBtn?.addEventListener('click', () => {
            this.backToStep1();
        });
        
        startChatBtn?.addEventListener('click', () => {
            this.completeSetup();
        });
    }
    
    setupChatListeners() {
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const micToggle = document.getElementById('mic-toggle');
        const speechToggle = document.getElementById('speech-toggle');
        const clearChat = document.getElementById('clear-chat');
        
        messageInput?.addEventListener('input', (e) => {
            sendBtn.disabled = !e.target.value.trim() || this.isLoading;
        });
        
        messageInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!sendBtn.disabled) {
                    this.sendMessage();
                }
            }
        });
        
        sendBtn?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        micToggle?.addEventListener('click', () => {
            this.toggleSpeechRecognition();
        });
        
        speechToggle?.addEventListener('click', () => {
            this.toggleAutoSpeak();
        });
        
        clearChat?.addEventListener('click', () => {
            this.clearChat();
        });
    }
    
    setupApiListeners() {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiConnectBtn = document.getElementById('api-connect-btn');
        
        apiKeyInput?.addEventListener('input', (e) => {
            apiConnectBtn.disabled = !e.target.value.trim();
        });
        
        apiKeyInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !apiConnectBtn.disabled) {
                this.connectApi();
            }
        });
        
        apiConnectBtn?.addEventListener('click', () => {
            this.connectApi();
        });
    }
    
    setupModalListeners() {
        const modal = document.getElementById('settings-modal');
        const modalClose = document.getElementById('modal-close');
        const modalCancel = document.getElementById('modal-cancel');
        const modalSave = document.getElementById('modal-save');
        
        modalClose?.addEventListener('click', () => {
            this.closeSettings();
        });
        
        modalCancel?.addEventListener('click', () => {
            this.closeSettings();
        });
        
        modalSave?.addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
        
        // Settings inputs
        document.getElementById('settings-api-key')?.addEventListener('input', (e) => {
            const updateBtn = document.getElementById('update-api-key');
            const clearBtn = document.getElementById('clear-api-key');
            updateBtn.disabled = !e.target.value || e.target.value.includes('••••');
        });
        
        document.getElementById('update-api-key')?.addEventListener('click', () => {
            this.updateApiKey();
        });
        
        document.getElementById('clear-api-key')?.addEventListener('click', () => {
            this.clearApiKey();
        });
        
        document.getElementById('export-settings')?.addEventListener('click', () => {
            this.exportSettings();
        });
        
        document.getElementById('import-settings')?.addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        
        document.getElementById('import-file')?.addEventListener('change', (e) => {
            this.importSettings(e);
        });
    }
    
    setupSpeechRecognition() {
        if (window.audioManager && window.audioManager.speechEnabled) {
            this.recognition = window.audioManager.setupSpeechRecognition();
            
            if (this.recognition) {
                this.recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    document.getElementById('message-input').value = transcript;
                    document.getElementById('send-btn').disabled = false;
                    this.isListening = false;
                    this.updateMicButton();
                };
                
                this.recognition.onend = () => {
                    this.isListening = false;
                    this.updateMicButton();
                };
                
                this.recognition.onerror = () => {
                    this.isListening = false;
                    this.updateMicButton();
                };
            }
        }
    }
    
    showUserSetup() {
        document.getElementById('user-setup').classList.remove('hidden');
        document.getElementById('chat-app').classList.add('hidden');
    }
    
    showChatApp() {
        document.getElementById('user-setup').classList.add('hidden');
        document.getElementById('chat-app').classList.remove('hidden');
        
        this.updateUserInterface();
        
        if (window.geminiAPI && window.geminiAPI.hasApiKey()) {
            this.showChatInterface();
        } else {
            this.showApiSetup();
        }
    }
    
    showApiSetup() {
        document.getElementById('api-setup').classList.remove('hidden');
        document.getElementById('chat-header').classList.add('hidden');
        document.getElementById('messages-container').classList.add('hidden');
        document.getElementById('chat-input-container').classList.add('hidden');
    }
    
    showChatInterface() {
        document.getElementById('api-setup').classList.add('hidden');
        document.getElementById('chat-header').classList.remove('hidden');
        document.getElementById('messages-container').classList.remove('hidden');
        document.getElementById('chat-input-container').classList.remove('hidden');
        
        document.getElementById('message-input').disabled = false;
        
        if (this.messages.length === 0) {
            this.addWelcomeMessage();
        }
        
        this.renderMessages();
    }
    
    updateUserInterface() {
        // Update bot name displays
        document.getElementById('sidebar-bot-name').textContent = this.botName;
        document.getElementById('header-bot-name').textContent = this.botName;
        
        // Update user name display
        document.getElementById('sidebar-user-name').textContent = this.userName;
        
        // Update input placeholder
        document.getElementById('message-input').placeholder = `Message ${this.botName}...`;
        
        // Update settings inputs
        document.getElementById('settings-user-name').value = this.userName;
        document.getElementById('settings-bot-name').value = this.botName;
    }
    
    proceedToStep2() {
        const userNameInput = document.getElementById('user-name-input');
        this.userName = userNameInput.value.trim();
        
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
        
        document.getElementById('setup-title').textContent = 'Name your AI assistant';
        document.getElementById('setup-description').textContent = 'Give your chatbot a personality with a name';
        
        // Update icon
        const icon = document.querySelector('.setup-icon svg');
        icon.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line>';
        
        document.getElementById('bot-name-input').focus();
    }
    
    backToStep1() {
        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-1').classList.remove('hidden');
        
        document.getElementById('setup-title').textContent = "Welcome! Let's get started";
        document.getElementById('setup-description').textContent = 'What would you like to be called?';
        
        // Update icon
        const icon = document.querySelector('.setup-icon svg');
        icon.innerHTML = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>';
        
        document.getElementById('user-name-input').focus();
    }
    
    completeSetup() {
        const botNameInput = document.getElementById('bot-name-input');
        this.botName = botNameInput.value.trim();
        
        this.saveUserData();
        this.createInitialConversation();
        this.showChatApp();
    }
    
    createInitialConversation() {
        const conversation = {
            id: Date.now().toString(),
            title: 'New Conversation',
            timestamp: new Date(),
            messageCount: 1
        };
        
        this.conversations = [conversation];
        this.currentConversationId = conversation.id;
    }
    
    connectApi() {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiKey = apiKeyInput.value.trim();
        
        if (apiKey) {
            window.geminiAPI.setApiKey(apiKey);
            this.showChatInterface();
            window.audioManager.playNotificationSound();
        }
    }
    
    addWelcomeMessage() {
        this.messages = [{
            id: '1',
            content: `Hello ${this.userName}! I'm ${this.botName}, your AI assistant. How can I help you today?`,
            sender: 'bot',
            timestamp: new Date()
        }];
    }
    
    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const content = messageInput.value.trim();
        
        if (!content || this.isLoading) return;
        
        const userMessage = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            timestamp: new Date()
        };
        
        this.messages.push(userMessage);
        messageInput.value = '';
        document.getElementById('send-btn').disabled = true;
        this.isLoading = true;
        
        this.renderMessages();
        this.showTypingIndicator();
        
        try {
            const response = await window.geminiAPI.generateResponse(content, this.userName, this.botName);
            
            const botMessage = {
                id: (Date.now() + 1).toString(),
                content: response,
                sender: 'bot',
                timestamp: new Date()
            };
            
            this.messages.push(botMessage);
            
            // Auto-speak if enabled
            if (window.audioManager.autoSpeak) {
                setTimeout(() => window.audioManager.speak(response), 500);
            }
            
            window.audioManager.playNotificationSound();
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                content: "Sorry, I'm having trouble connecting to my AI service. Please check your API key or try again later.",
                sender: 'bot',
                timestamp: new Date()
            };
            this.messages.push(errorMessage);
        } finally {
            this.isLoading = false;
            this.hideTypingIndicator();
            this.renderMessages();
        }
    }
    
    renderMessages() {
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        const container = document.getElementById('messages-container');
        container.scrollTop = container.scrollHeight;
    }
    
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender} message-animate`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        if (message.sender === 'bot') {
            avatarDiv.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="5" r="2"></circle>
                    <path d="M12 7v4"></path>
                    <line x1="8" y1="16" x2="8" y2="16"></line>
                    <line x1="16" y1="16" x2="16" y2="16"></line>
                </svg>
            `;
        } else {
            avatarDiv.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
            avatarDiv.textContent = this.userName.charAt(0).toUpperCase();
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textP = document.createElement('p');
        textP.textContent = message.content;
        contentDiv.appendChild(textP);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        `;
        copyBtn.onclick = () => this.copyMessage(message.content);
        actionsDiv.appendChild(copyBtn);
        
        // Speak button for bot messages
        if (message.sender === 'bot') {
            const speakBtn = document.createElement('button');
            speakBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93A10 10 0 0 1 22 12a10 10 0 0 1-2.93 7.07M15.54 8.46A5 5 0 0 1 18 12a5 5 0 0 1-2.46 3.54"></path>
                </svg>
            `;
            speakBtn.onclick = () => window.audioManager.speak(message.content);
            actionsDiv.appendChild(speakBtn);
        }
        
        // Timestamp
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        actionsDiv.appendChild(timeSpan);
        
        contentDiv.appendChild(actionsDiv);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('messages');
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-message';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="5" r="2"></circle>
                    <path d="M12 7v4"></path>
                    <line x1="8" y1="16" x2="8" y2="16"></line>
                    <line x1="16" y1="16" x2="16" y2="16"></line>
                </svg>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        
        // Scroll to bottom
        const container = document.getElementById('messages-container');
        container.scrollTop = container.scrollHeight;
    }
    
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    copyMessage(content) {
        navigator.clipboard.writeText(content);
        window.audioManager.playButtonSound();
    }
    
    clearChat() {
        this.messages = [];
        this.addWelcomeMessage();
        this.renderMessages();
        window.audioManager.playButtonSound();
    }
    
    toggleSpeechRecognition() {
        if (!this.recognition || !window.audioManager.speechEnabled) return;
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.isListening = true;
            this.recognition.start();
            window.audioManager.playButtonSound();
        }
        
        this.updateMicButton();
    }
    
    updateMicButton() {
        const micBtn = document.getElementById('mic-toggle');
        if (!micBtn) return;
        
        if (this.isListening) {
            micBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12L9 9z"></path>
                    <path d="M12 2a3 3 0 0 1 3 3v2l-3 3V2z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
            `;
            micBtn.style.color = 'var(--destructive)';
        } else {
            micBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
            `;
            micBtn.style.color = '';
        }
    }
    
    toggleAutoSpeak() {
        window.audioManager.autoSpeak = !window.audioManager.autoSpeak;
        window.audioManager.setSetting('auto-speak', window.audioManager.autoSpeak);
        
        const speechBtn = document.getElementById('speech-toggle');
        if (speechBtn) {
            if (window.audioManager.autoSpeak) {
                speechBtn.innerHTML = `
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93A10 10 0 0 1 22 12a10 10 0 0 1-2.93 7.07M15.54 8.46A5 5 0 0 1 18 12a5 5 0 0 1-2.46 3.54"></path>
                    </svg>
                `;
            } else {
                speechBtn.innerHTML = `
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                `;
            }
        }
    }
    
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        
        if (this.sidebarOpen) {
            sidebar.classList.add('open');
            backdrop.classList.remove('hidden');
        } else {
            sidebar.classList.remove('open');
            backdrop.classList.add('hidden');
        }
    }
    
    closeSidebar() {
        this.sidebarOpen = false;
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-backdrop').classList.add('hidden');
    }
    
    createNewConversation() {
        const conversation = {
            id: Date.now().toString(),
            title: `Chat ${this.conversations.length + 1}`,
            timestamp: new Date(),
            messageCount: 0
        };
        
        this.conversations.unshift(conversation);
        this.currentConversationId = conversation.id;
        this.messages = [];
        this.addWelcomeMessage();
        this.renderMessages();
        this.closeSidebar();
    }
    
    openSettings() {
        document.getElementById('settings-modal').classList.remove('hidden');
        this.loadSettingsData();
    }
    
    closeSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
    }
    
    loadSettingsData() {
        document.getElementById('settings-user-name').value = this.userName;
        document.getElementById('settings-bot-name').value = this.botName;
        
        // Load API key (masked)
        const apiKey = localStorage.getItem('gemini-api-key');
        if (apiKey) {
            document.getElementById('settings-api-key').value = '••••••••••••' + apiKey.slice(-4);
            document.getElementById('clear-api-key').disabled = false;
        }
        
        // Load audio settings
        document.getElementById('sound-effects').checked = window.audioManager.soundEnabled;
        document.getElementById('speech-recognition').checked = window.audioManager.speechEnabled;
        document.getElementById('auto-speak').checked = window.audioManager.autoSpeak;
    }
    
    saveSettings() {
        const newUserName = document.getElementById('settings-user-name').value.trim();
        const newBotName = document.getElementById('settings-bot-name').value.trim();
        
        if (newUserName) {
            this.userName = newUserName;
        }
        if (newBotName) {
            this.botName = newBotName;
        }
        
        this.saveUserData();
        this.updateUserInterface();
        
        // Save audio settings
        const audioSettings = {
            soundEnabled: document.getElementById('sound-effects').checked,
            speechEnabled: document.getElementById('speech-recognition').checked,
            autoSpeak: document.getElementById('auto-speak').checked
        };
        
        window.audioManager.updateSettings(audioSettings);
        
        this.closeSettings();
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }
    
    updateApiKey() {
        const apiKeyInput = document.getElementById('settings-api-key');
        const apiKey = apiKeyInput.value.trim();
        
        if (apiKey && !apiKey.includes('••••')) {
            window.geminiAPI.setApiKey(apiKey);
            apiKeyInput.value = '••••••••••••' + apiKey.slice(-4);
            document.getElementById('update-api-key').disabled = true;
            document.getElementById('clear-api-key').disabled = false;
        }
    }
    
    clearApiKey() {
        window.geminiAPI.clearApiKey();
        document.getElementById('settings-api-key').value = '';
        document.getElementById('update-api-key').disabled = true;
        document.getElementById('clear-api-key').disabled = true;
    }
    
    exportSettings() {
        const settings = {
            userName: this.userName,
            botName: this.botName,
            theme: this.currentTheme,
            soundEnabled: window.audioManager.soundEnabled,
            speechEnabled: window.audioManager.speechEnabled,
            autoSpeak: window.audioManager.autoSpeak,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chatbot-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    importSettings(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                if (settings.userName) {
                    this.userName = settings.userName;
                    document.getElementById('settings-user-name').value = settings.userName;
                }
                if (settings.botName) {
                    this.botName = settings.botName;
                    document.getElementById('settings-bot-name').value = settings.botName;
                }
                if (settings.theme) {
                    this.applyTheme(settings.theme);
                    this.currentTheme = settings.theme;
                }
                if (typeof settings.soundEnabled === 'boolean') {
                    document.getElementById('sound-effects').checked = settings.soundEnabled;
                }
                if (typeof settings.speechEnabled === 'boolean') {
                    document.getElementById('speech-recognition').checked = settings.speechEnabled;
                }
                if (typeof settings.autoSpeak === 'boolean') {
                    document.getElementById('auto-speak').checked = settings.autoSpeak;
                }
            } catch (error) {
                console.error('Failed to import settings:', error);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});