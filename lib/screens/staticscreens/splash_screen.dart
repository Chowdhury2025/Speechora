import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _controller;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );

    // Check login and premium status after animation
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && !_hasError) {
        _checkAccessAndNavigate();
      }
    });
  }

  Future<void> _checkAccessAndNavigate() async {
    if (!mounted) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

      if (!isLoggedIn) {
        Navigator.of(context).pushReplacementNamed('/login');
        return;
      }

      final isPremium = prefs.getBool('isPremium') ?? false;
      final premiumStatus = prefs.getString('premiumStatus') ?? '';
      final hasAccess = isPremium || premiumStatus == 'trial';

      if (hasAccess) {
        Navigator.of(context).pushReplacementNamed('/home');
      } else {
        // User is logged in but doesn't have premium access
        Navigator.of(context).pushReplacementNamed('/settings');
      }
    } catch (e) {
      setState(() => _hasError = true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error checking access status')),
        );
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Fallback content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset('assets/appIcon.png', width: 120, height: 120),
                const SizedBox(height: 24),
                Text('Book8', style: Theme.of(context).textTheme.displayLarge),
              ],
            ),
          ),
          // Lottie animation layer
          Center(
            child: Lottie.asset(
              'assets/splash_screen_lotties.json',
              controller: _controller,
              onLoaded: (composition) {
                // Update the controller duration to match the animation
                _controller.duration = composition.duration;
                // Start the animation
                _controller.forward().then((_) {
                  if (mounted) {
                    _checkAccessAndNavigate();
                  }
                });
              },
              errorBuilder: (context, error, stackTrace) {
                _hasError = true;
                return const SizedBox.shrink(); // Hide the Lottie widget on error
              },
            ),
          ),
        ],
      ),
    );
  }
}
