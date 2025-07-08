import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PremiumAccessWrapper extends StatefulWidget {
  final Widget child;
  final bool allowAccess;
  final String onAccessDeniedRoute;

  const PremiumAccessWrapper({
    Key? key,
    required this.child,
    this.allowAccess = false,
    this.onAccessDeniedRoute = '/settings',
  }) : super(key: key);

  @override
  State<PremiumAccessWrapper> createState() => _PremiumAccessWrapperState();
}

class _PremiumAccessWrapperState extends State<PremiumAccessWrapper> {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _checkAccess(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final hasAccess = snapshot.data ?? false;

        if (hasAccess || widget.allowAccess) {
          return widget.child;
        }

        return Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.lock_outline, size: 64, color: Colors.amber),
                const SizedBox(height: 16),
                const Text(
                  'Premium Content',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    'This feature is only available for Premium users or during the Trial period.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    'Start your free 7-day trial or upgrade to Premium to access all features.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    foregroundColor: Colors.black87,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                  ),
                  onPressed: () {
                    Navigator.of(
                      context,
                    ).pushReplacementNamed(widget.onAccessDeniedRoute);
                  },
                  child: const Text(
                    'Get Premium Access',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<bool> _checkAccess() async {
    final prefs = await SharedPreferences.getInstance();
    final isPremium = prefs.getBool('isPremium') ?? false;
    final premiumStatus = prefs.getString('premiumStatus') ?? '';

    // Allow access if user is premium or in trial period
    return isPremium || premiumStatus == 'trial';
  }
}
