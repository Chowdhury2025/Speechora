import api from '../utils/api';

class GooglePayService {
  constructor() {
    this.baseClient = null;
    this.paymentsClient = null;
  }

  async initialize() {
    if (!window.google?.payments?.api?.PaymentsClient) {
      await this.loadGooglePayScript();
    }

    // Re-read the PaymentsClient constructor from the loaded script
    this.baseClient = window.google?.payments?.api?.PaymentsClient;

    if (!this.baseClient) {
      throw new Error('Google Pay PaymentsClient not available');
    }

    this.paymentsClient = new this.baseClient({
      environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
    });
  }

  async loadGooglePayScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async getPaymentConfig() {
    try {
      const response = await api.get('/api/payments/google/config');
      return response.data;
    } catch (error) {
      console.error('Payment config error:', error);
      throw error;
    }
  }

  async initializePayment(paymentData) {
    try {
      if (!this.paymentsClient) {
        await this.initialize();
      }

      const paymentDataRequest = await this.createPaymentDataRequest(paymentData);
      const googlePaymentData = await this.paymentsClient.loadPaymentData(paymentDataRequest);

      const response = await api.post('/api/payments/google/process', {
        ...paymentData,
        paymentData: googlePaymentData
      });

      return response.data;
    } catch (error) {
      if (error.statusCode === 'CANCELED') {
        throw new Error('Payment was cancelled by user');
      }
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  async createPaymentDataRequest(paymentData) {
    const config = await this.getPaymentConfig();
    
    return {
      ...config,
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: paymentData.amount.toString(),
        currencyCode: 'USD'
      },
      merchantInfo: config.merchantInfo,
      emailRequired: true,
      callbackIntents: ['PAYMENT_AUTHORIZATION']
    };
  }

  async verifyPayment(paymentId) {
    try {
      const response = await api.get(`/api/payments/google/verify/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  async isGooglePayAvailable() {
    if (!this.paymentsClient) {
      await this.initialize();
    }

    const isReadyToPayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA']
        }
      }]
    };

    try {
      const response = await this.paymentsClient.isReadyToPay(isReadyToPayRequest);
      return response.result;
    } catch (error) {
      console.error('Google Pay availability check failed:', error);
      return false;
    }
  }
}

const googlePayService = new GooglePayService();
export default googlePayService;