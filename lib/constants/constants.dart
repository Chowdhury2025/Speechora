class Constants {
  // Central base URL for all API calls - update this single location to change the backend endpoint
  static const String baseUrl = 'https://book8-backend.vercel.app/api';

  // Frontend URLs for web app integration
  static const String frontendBuyUrl = 'https://speechora.vercel.app/app/premium';
  static const String frontendRegisterUrl = 'https://speechora.vercel.app/register';
  static const String frontendForgotPasswordUrl = 'https://speechora.vercel.app/forgot-password';

  // Local development URL (uncomment for local testing)
  // static const String baseUrl = 'http://192.168.234.159:8000/api';
}
