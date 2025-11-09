import 'package:flutter/material.dart';
import '../services/presentation1_service.dart';

class AppInitializationScreen extends StatefulWidget {
  final Widget child;

  const AppInitializationScreen({
    super.key,
    required this.child,
  });

  @override
  State<AppInitializationScreen> createState() => _AppInitializationScreenState();
}

class _AppInitializationScreenState extends State<AppInitializationScreen> {
  final Presentation1Service _imageService = Presentation1Service();
  bool _isInitialized = false;
  String _currentStep = 'Initializing...';
  double _progress = 0.0;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      setState(() {
        _currentStep = 'Loading image data...';
        _progress = 0.2;
      });

      // Initialize all Presentation 1 images
      await _imageService.initializeAllImages();

      setState(() {
        _currentStep = 'Finalizing...';
        _progress = 1.0;
      });

      // Small delay to show completion
      await Future.delayed(const Duration(milliseconds: 500));

      setState(() {
        _isInitialized = true;
      });
    } catch (e) {
      // Even if initialization fails, show the app
      // The individual screens will handle loading states
      setState(() {
        _isInitialized = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isInitialized) {
      return widget.child;
    }

    return Scaffold(
      backgroundColor: const Color(0xFF1CB0F6),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF1CB0F6),
              Color(0xFF0099CC),
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // App Logo or Icon
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(
                  Icons.school,
                  size: 80,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 40),
              
              // App Name
              const Text(
                'SpeachOra',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 60),
              
              // Progress Indicator
              SizedBox(
                width: 250,
                child: Column(
                  children: [
                    LinearProgressIndicator(
                      value: _progress,
                      backgroundColor: Colors.white.withOpacity(0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                      minHeight: 6,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _currentStep,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 40),
              
              // Subtitle
              const Text(
                'Preparing your learning experience...',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}