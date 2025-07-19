import 'package:shared_preferences/shared_preferences.dart';

class PremiumGuard {
  static Future<bool> hasAccess() async {
    final prefs = await SharedPreferences.getInstance();
    final premiumStatus = prefs.getString('premiumStatus') ?? '';
    final now = DateTime.now();

    // Check if trial is active and valid
    if (premiumStatus == 'trial') {
      final trialExpiryStr = prefs.getString('trialExpiry');
      if (trialExpiryStr != null) {
        final trialExpiry = DateTime.tryParse(trialExpiryStr);
        if (trialExpiry != null && now.isBefore(trialExpiry)) {
          return true;
        }
      }
      // Trial expired, update status
      await prefs.setString('premiumStatus', '');
      return false;
    }

    // Check if premium is active and valid
    if (premiumStatus == 'premium') {
      final premiumExpiryStr = prefs.getString('premiumExpiry');
      if (premiumExpiryStr != null) {
        final premiumExpiry = DateTime.tryParse(premiumExpiryStr);
        if (premiumExpiry != null && now.isBefore(premiumExpiry)) {
          return true;
        }
      }
      // Premium expired, update status
      await prefs.setString('premiumStatus', '');
      return false;
    }

    return false;
  }

  static Future<String> getInitialRoute() async {
    final hasFullAccess = await hasAccess();
    return hasFullAccess ? '/home' : '/settings';
  }

  static Future<Map<String, bool>> getSettingsAccess() async {
    final hasFullAccess = await hasAccess();

    return {
      'language': true, // Always accessible
      'voiceAccent': hasFullAccess,
      'categories': hasFullAccess,
      'favorites': true, // Always accessible
      'fileLocations': hasFullAccess,
      'display': hasFullAccess,
      'notifications': true, // Always accessible
      'downloads': hasFullAccess,
      'cache': true, // Always accessible
      'about': true, // Always accessible
      'privacy': true, // Always accessible
      'rateUs': true, // Always accessible
      'moreApps': true, // Always accessible
    };
  }
}
