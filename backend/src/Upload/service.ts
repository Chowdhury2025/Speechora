import axios from 'axios';

interface LencoConfig {
  baseUrl: string;
  publicKey: string;
  privateKey: string;
}

interface CreateAccountRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bvn?: string;
  date_of_birth?: string;
  address?: string;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  callback_url: string;
  metadata?: any;
}

interface MobileMoneyRequest {
  amount: number;
  currency: string;
  phone: string;
  provider: string; // MTN, AIRTEL, VODAFONE, etc.
  callback_url: string;
  metadata?: any;
}

interface TransferRequest {
  amount: number;
  account_number: string;
  bank_code: string;
  narration: string;
  reference: string;
}

class LencoService {
  private config: LencoConfig;
  private headers: Record<string, string>;

  constructor() {
    this.config = {
      baseUrl: process.env.LENCO_BASE_URL || '',
      publicKey: process.env.LENCO_PUBLIC_KEY || '',
      privateKey: process.env.LENCO_PRIVATE_KEY || '',
    };

    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.privateKey}`,
      'X-Public-Key': this.config.publicKey,
    };
  }

  // Create a new account
  async createAccount(accountData: CreateAccountRequest) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/accounts`,
        accountData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lenco Account Creation Error:', error.response?.data || error.message);
      throw new Error(`Account creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Initialize mobile money payment
  async initializeMobileMoneyPayment(paymentData: MobileMoneyRequest) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/mobile-money/initialize`,
        paymentData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lenco Mobile Money Payment Error:', error.response?.data || error.message);
      throw new Error(`Mobile money payment failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Initialize payment
  async initializePayment(paymentData: PaymentRequest) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/payments/initialize`,
        paymentData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lenco Payment Initialization Error:', error.response?.data || error.message);
      throw new Error(`Payment initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Verify payment
  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/payments/verify/${reference}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lenco Payment Verification Error:', error.response?.data || error.message);
      throw new Error(`Payment verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Transfer funds
  async transferFunds(transferData: TransferRequest) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/transfers`,
        transferData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lenco Transfer Error:', error.response?.data || error.message);
      throw new Error(`Transfer failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get account balance
  async getAccountBalance(accountId: string) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/accounts/${accountId}/balance`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lenco Balance Check Error:', error.response?.data || error.message);
      throw new Error(`Balance check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get mobile money providers
  async getMobileMoneyProviders() {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/mobile-money/providers`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lenco Mobile Money Providers Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch providers: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get banks list
  async getBanksList() {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/banks`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lenco Banks List Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch banks: ${error.response?.data?.message || error.message}`);
    }
  }

  // Resolve account number
  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/banks/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Lenco Account Resolution Error:', error.response?.data || error.message);
      throw new Error(`Account resolution failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

export default new LencoService();