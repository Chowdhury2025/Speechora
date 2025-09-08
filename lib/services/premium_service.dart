import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/constants.dart';

class PremiumService {
  // PremiumGuard functionality
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
      await prefs.setBool('isPremium', false);
      await prefs.setString('premiumStatus', '');
      return false;
    }

    // Check if premium is active and valid
    if (premiumStatus == 'premium') {
      final premiumExpiryStr = prefs.getString('premiumExpiry');
      if (premiumExpiryStr == null || premiumExpiryStr.isEmpty) {
        // Unlimited premium
        return true;
      }
      final premiumExpiry = DateTime.tryParse(premiumExpiryStr);
      if (premiumExpiry != null && now.isBefore(premiumExpiry)) {
        return true;
      }
      // Premium expired, update status
      await prefs.setBool('isPremium', false);
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

  // SubscriptionService functionality
  static Future<Map<String, dynamic>?> fetchStatus(int userId) async {
    try {
      final uri = Uri.parse(
        '${Constants.baseUrl}/user/subscription-status?userId=$userId',
      );
      final resp = await http.get(
        uri,
        headers: {'Content-Type': 'application/json'},
      );
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('subscriptionStatusRaw', resp.body);
        return data;
      }
    } catch (_) {
      // ignore
    }
    return null;
  }
}

// PremiumPaymentDialog as a class
class PremiumPaymentDialog extends StatefulWidget {
  const PremiumPaymentDialog({Key? key}) : super(key: key);

  @override
  State<PremiumPaymentDialog> createState() => _PremiumPaymentDialogState();
}

class _PremiumPaymentDialogState extends State<PremiumPaymentDialog> {
  bool _isProcessing = false;

  Future<void> _launchPurchaseWebsite() async {
    setState(() => _isProcessing = true);

    final Uri url = Uri.parse('https://book8.vercel.app/app/premium');
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open purchase page')),
        );
      }
    }

    setState(() => _isProcessing = false);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Upgrade to Premium',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Redirecting to secure payment page...',
              style: TextStyle(fontSize: 16, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            const Text(
              'You will be redirected to our website to complete your purchase securely.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _launchPurchaseWebsite,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.green,
                ),
                child:
                    _isProcessing
                        ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                        : const Text(
                          'Continue to Purchase',
                          style: TextStyle(fontSize: 16),
                        ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
