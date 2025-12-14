class Constants {
  // Central base URL for all API calls - update this single location to change the backend endpoint
  static const String baseUrl = 'http://192.168.124.159:8000/api';
  // static const String baseUrl = 'https://web-server-speechora-29y9.vercel.app/api';
// 
  // Frontend URLs for web app integration
  static const String frontendBuyUrl = 'http://192.168.124.159:8800/app/premium';
  static const String frontendRegisterUrl = 'http://192.168.124.159:8800/register';
  static const String frontendForgotPasswordUrl = 'http://192.168.124.159:8800/forgot-password';

  // Local development URL (uncomment for local testing)
  // static const String baseUrl = 'http://192.168.234.159:8000/api';
}
