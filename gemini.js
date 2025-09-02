// Gemini AI Integration ((i should update this )this code is from google.AI studio for developers)
class GeminiAPI {
    constructor() {
        this.apiKey = localStorage.getItem('gemini-api-key');
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }
    
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('gemini-api-key', apiKey);
    }
    
    hasApiKey() {
        return !!this.apiKey;
    }
    
    async generateResponse(prompt, userName, botName) {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }
        
        const enhancedPrompt = `You are ${botName}, an AI assistant chatting with ${userName}. 
        Be helpful, friendly, and concise. Respond naturally to: "${prompt}"`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: enhancedPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        };
        
        try {
            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response format from Gemini API');
            }
            
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }
    
    clearApiKey() {
        this.apiKey = null;
        localStorage.removeItem('gemini-api-key');
    }
}

// Initialize Gemini API when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.geminiAPI = new GeminiAPI();
});