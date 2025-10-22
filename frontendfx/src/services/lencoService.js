import axios from 'axios';
import { API_URL } from '../config';

class LencoService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_URL}/api/payments`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    this.lencoScriptLoaded = false;
  }

  // Load Lenco widget script
  async loadLencoScript() {
    if (this.lencoScriptLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.LencoPay) {
        this.lencoScriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://pay.lenco.co/js/v1/inline.js';
      script.onload = () => {
        this.lencoScriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Lenco script'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Get payment configuration from backend
  async getPaymentConfig(paymentData) {
    try {
      const response = await this.apiClient.post('/config', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment config error:', error);
      return this.handleError(error);
    }
  }

  // Initialize payment using Lenco widget
  async initializePayment(paymentData, callbacks = {}) {
    try {
      // Load Lenco script if not already loaded
      await this.loadLencoScript();

      // Get payment configuration from backend
      const configResponse = await this.getPaymentConfig(paymentData);
      
      if (!configResponse.success) {
        throw new Error(configResponse.message || 'Failed to get payment configuration');
      }

      const config = configResponse.data;

      // Initialize payment with Lenco widget
      return new Promise((resolve, reject) => {
        window.LencoPay.getPaid({
          ...config,
          onSuccess: (response) => {
            if (callbacks.onSuccess) {
              callbacks.onSuccess(response);
            }
            resolve(response);
          },
          onClose: () => {
            if (callbacks.onClose) {
              callbacks.onClose();
            }
            reject(new Error('Payment was cancelled by user'));
          },
          onConfirmationPending: () => {
            if (callbacks.onConfirmationPending) {
              callbacks.onConfirmationPending();
            }
          }
        });
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  // Wrapper for mobile money payments — kept for backward compatibility
  async initializeMobileMoneyPayment(paymentData, callbacks = {}) {
    // ensure payment type is indicated
    const data = { ...paymentData, paymentMethod: 'mobile_money' };
    return this.initializePayment(data, callbacks);
  }

  // Wrapper for card payments — kept for backward compatibility
  async initializeCardPayment(paymentData, callbacks = {}) {
    const data = { ...paymentData, paymentMethod: 'card' };
    return this.initializePayment(data, callbacks);
  }

  // Verify payment status
  async verifyPayment(reference) {
    try {
      const response = await this.apiClient.get(`/verify/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      return this.handleError(error);
    }
  }

  // Get payment status
  async getPaymentStatus(reference) {
    try {
      const response = await this.apiClient.get(`/status/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Payment status error:', error);
      return this.handleError(error);
    }
  }

  // Generate unique reference
  async generateReference(prefix = 'BOOK8') {
    try {
      const response = await this.apiClient.post('/generate-reference', { prefix });
      return response.data.reference;
    } catch (error) {
      console.error('Reference generation error:', error);
      // Fallback to local generation
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      return `${prefix}_${timestamp}_${random}`.toUpperCase();
    }
  }

  // Detect mobile money provider from phone number
  async detectMobileProvider(phoneNumber) {
    try {
      const response = await this.apiClient.post('/detect-provider', { phoneNumber });
      return response.data.provider;
    } catch (error) {
      console.error('Provider detection error:', error);
      // Fallback to local detection
      return this.detectMobileProviderLocal(phoneNumber);
    }
  }

  // Local fallback for provider detection
  detectMobileProviderLocal(phoneNumber) {
    const prefix = phoneNumber.substring(0, 3);
    if (prefix === '095') return 'ZAMTEL';
    if (prefix === '096' || prefix === '076') return 'MTN';
    if (prefix === '097' || prefix === '077') return 'AIRTEL';
    return 'MTN'; // Default to MTN if not detected
  }

  // Format phone number for international format
  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 260, return as is
    if (cleaned.startsWith('260')) {
      return `+${cleaned}`;
    }
    
    // If it starts with 0, replace with 260
    if (cleaned.startsWith('0')) {
      return `+260${cleaned.substring(1)}`;
    }
    
    // Otherwise, assume it's a local number and add 260
    return `+260${cleaned}`;
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Payment failed',
        error: error.response.data,
        status: error.response.status
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: 'Network error'
      };
    } else {
      // Other error
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error.message
      };
    }
  }
}

export default new LencoService();