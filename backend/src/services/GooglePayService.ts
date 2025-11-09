import axios from 'axios';

interface GooglePayConfig {
  merchantId: string;
  merchantName: string;
  environment: 'TEST' | 'PRODUCTION';
}

interface PaymentRequest {
  amount: number;
  currencyCode: string;
  email: string;
  paymentData: any;
  metadata?: any;
}

class GooglePayService {
  private config: GooglePayConfig;
  private apiClient: any;

  constructor() {
    this.config = {
      merchantId: process.env.GOOGLE_PAY_MERCHANT_ID || '',
      merchantName: 'Speechora',
      environment: (process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST') as 'TEST' | 'PRODUCTION'
    };

    this.apiClient = axios.create({
      baseURL: 'https://pay.google.com/gp/p',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOOGLE_PAY_SECRET_KEY}`
      }
    });
  }

  public getPaymentConfig() {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: this.config.merchantId
          }
        }
      }],
      merchantInfo: {
        merchantId: this.config.merchantId,
        merchantName: this.config.merchantName
      }
    };
  }

  public async processPayment(paymentRequest: PaymentRequest) {
    try {
      const response = await this.apiClient.post('/processPayment', {
        merchantId: this.config.merchantId,
        paymentData: paymentRequest.paymentData,
        amount: {
          value: paymentRequest.amount.toString(),
          currencyCode: paymentRequest.currencyCode
        },
        email: paymentRequest.email,
        metadata: paymentRequest.metadata
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Google Pay payment processing error:', error);
      return this.handleError(error);
    }
  }

  public async verifyPayment(paymentId: string) {
    try {
      const response = await this.apiClient.get(`/payments/${paymentId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return this.handleError(error);
    }
  }

  private handleError(error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Payment processing failed',
      error: error.response?.data || error.message
    };
  }
}

const googlePayService = new GooglePayService();
export default googlePayService;