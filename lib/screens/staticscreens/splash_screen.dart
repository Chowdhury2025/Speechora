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

      // Always navigate to home - PremiumAccessWrapper will handle access control
      Navigator.of(context).pushReplacementNamed('/home');
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
          // Lottie animation only (no static app icon/text)
          Center(
            child: Lottie.asset(
              'assets/splash_screen_lotties.json',
              controller: _controller,
              onLoaded: (composition) {
                // Update the controller duration to match the animation
                _controller.duration = composition.duration;
                // Start the animation and navigate after it completes
                _controller.forward().then((_) {
                  if (mounted && !_hasError) {
                    _checkAccessAndNavigate();
                  }
                });
              },
              errorBuilder: (context, error, stackTrace) {
                // If Lottie fails, mark error and navigate after short delay
                _hasError = true;
                Future.delayed(const Duration(seconds: 1), () {
                  if (mounted) _checkAccessAndNavigate();
                });
                // Show an empty container (keep splash minimal)
                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }
}
