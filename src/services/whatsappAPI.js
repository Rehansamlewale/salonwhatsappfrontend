// WhatsApp API Service
// Connects directly to Node.js WhatsApp server

class WhatsAppAPIService {
    constructor() {
        // Use environment variable for API URL
        // Automatically switches between development (localhost:3001) and production (Render)
        const envURL = process.env.REACT_APP_WHATSAPP_API_URL;

        // Determine server base (web) URL and API baseURL
        // Prefer explicit env var; if envURL includes the API path, strip it for the web base
        const defaultServerBase = 'https://whatsappsalon.onrender.com';

        if (envURL) {
            if (envURL.includes('/api/whatsapp')) {
                this.serverBase = envURL.replace(/\/api\/whatsapp\/?$/i, '');
                this.baseURL = envURL;
            } else {
                this.serverBase = envURL.replace(/\/$/, '');
                this.baseURL = `${this.serverBase}/api/whatsapp`;
            }
        } else {
            this.serverBase = defaultServerBase;
            this.baseURL = `${this.serverBase}/api/whatsapp`;
        }

        this.isConnected = false;
        
    }

    // Return the server base (web) URL, e.g. https://Loan-finance-whatsapp-backend.onrender.com
    getServerBase() {
        return this.serverBase;
    }

    // Check if WhatsApp API is connected
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/status`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.isConnected = data.connected;
            return data;
        } catch (error) {
            this.isConnected = false;
            return {
                connected: false,
                error: `Failed to connect to Node.js WhatsApp server: ${error.message}`,
                serverUrl: this.baseURL
            };
        }
    }

    // Get QR code for WhatsApp Web authentication
    async getQRCode() {
        try {
            const response = await fetch(`${this.baseURL}/qr-code`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Logout from WhatsApp
    async logout() {
        try {
            const response = await fetch(`${this.baseURL}/logout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Send message to single contact
    async sendMessage(phoneNumber, message, mediaUrl = null) {
        try {
            const body = {
                phone: phoneNumber,
                message: message
            };
            
            if (mediaUrl) {
                body.mediaUrl = mediaUrl;
                body.image = mediaUrl;
                body.media = mediaUrl;
                body.url = mediaUrl; // Adding even more potential keys
                body.link = mediaUrl;
                body.attachment = mediaUrl;
                body.file = mediaUrl;
                body.caption = message;
            }

            const response = await fetch(`${this.baseURL}/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Send message to multiple contacts
    async sendBulkMessages(contacts, message, mediaUrl = null) {
        try {
            const body = {
                contacts: contacts,
                message: message
            };
            
            if (mediaUrl) {
                body.mediaUrl = mediaUrl;
                body.image = mediaUrl;
                body.media = mediaUrl;
                body.url = mediaUrl;
                body.link = mediaUrl;
                body.attachment = mediaUrl;
                body.file = mediaUrl;
                body.caption = message;
            }

            const response = await fetch(`${this.baseURL}/send-bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Format phone number for WhatsApp (remove special characters, add country code)
    formatPhoneNumber(phone, countryCode = '91') {
        if (!phone) return '';
        // Remove all non-numeric characters
        const cleaned = phone.toString().replace(/\D/g, '');

        // Add country code if not present
        if (!cleaned.startsWith(countryCode)) {
            return `${countryCode}${cleaned}`;
        }

        return cleaned;
    }

    // Format message for WhatsApp (handle emojis and formatting)
    formatMessage(message) {
        if (!message) return '';
        return message.toString()
            .replace(/\*([^*]+)\*/g, '*$1*') // Bold text
            .replace(/_([^_]+)_/g, '_$1_') // Italic text
            .replace(/~([^~]+)~/g, '~$1~'); // Strikethrough text
    }
}

const whatsappAPIService = new WhatsAppAPIService();
export default whatsappAPIService;
