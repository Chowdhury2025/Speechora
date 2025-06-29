import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import '../home_screen.dart';

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

    // Ensure we move to home screen after a maximum duration
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted && !_hasError) {
        _navigateToHome();
      }
    });
  }

  void _navigateToHome() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => MyHomePage(title: 'books8')),
    );
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
                    _navigateToHome();
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
