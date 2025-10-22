import axios from 'axios';

const LENCO_BASE_URL = 'https://api.lenco.co/access/v2';
const LENCO_PUBLIC_KEY = process.env.LENCO_PUBLIC_KEY || 'pub-45885ee23a940550a65ca5874b8d58684c069616b7aac36b';
const LENCO_PRIVATE_KEY = process.env.LENCO_PRIVATE_KEY || 'f0874c6950dda4628bb39f840895f03da80bfce64380049aba6d40e359f87768';

class LencoService {
  private apiClient: any;

  constructor() {
    this.apiClient = axios.create({
      baseURL: LENCO_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LENCO_PRIVATE_KEY}`
      }
    });
  }

  // Get public key for frontend widget
  getPublicKey() {
    return LENCO_PUBLIC_KEY;
  }

  // Verify payment status using Lenco's verification endpoint
  async verifyPayment(reference: string) {
    try {
      const response = await this.apiClient.get(`/collections/status/${reference}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return this.handleError(error);
    }
  }

  // Generate payment data for frontend widget
  generatePaymentData(paymentInfo: { amount: number; email: string; phone: string; customerName: string; userId: string; planName: string }) {
    const reference = this.generateReference();
    return {
      key: LENCO_PUBLIC_KEY,
      reference: reference,
      email: paymentInfo.email,
      amount: paymentInfo.amount,
      currency: "ZMW",
      channels: ["card", "mobile-money"],
      customer: {
        firstName: paymentInfo.customerName.split(' ')[0] || paymentInfo.customerName,
        lastName: paymentInfo.customerName.split(' ').slice(1).join(' ') || '',
        phone: this.formatPhoneNumber(paymentInfo.phone),
      },
      metadata: {
        userId: paymentInfo.userId,
        planName: paymentInfo.planName
      }
    };
  }
  handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
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
      }
    }
    
    // Other error
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Generate unique reference
  generateReference(prefix = 'BOOK8') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  // Detect mobile money provider from phone number
  detectMobileProvider(phoneNumber: string) {
    const prefix = phoneNumber.substring(0, 3);
    if (prefix === '095') return 'ZAMTEL';
    if (prefix === '096' || prefix === '076') return 'MTN';
    if (prefix === '097' || prefix === '077') return 'AIRTEL';
    return 'MTN'; // Default to MTN if not detected
  }

  // Format phone number for international format
  formatPhoneNumber(phoneNumber: string) {
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
}

export default new LencoService();