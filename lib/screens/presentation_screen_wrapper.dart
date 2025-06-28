import 'package:flutter/material.dart';
import '../../services/tts_service.dart';

class PresentationScreenWrapper extends StatelessWidget {
  final String title;
  final Color backgroundColor;
  final Widget child;
  final String? ttsText;

  const PresentationScreenWrapper({
    super.key,
    required this.title,
    required this.backgroundColor,
    required this.child,
    this.ttsText,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: backgroundColor,
        elevation: 0,
        actions: [
          if (ttsText != null)
            IconButton(
              icon: const Icon(Icons.volume_up, color: Colors.white),
              onPressed: () => TTSService().speak(ttsText!),
            ),
        ],
      ),
      backgroundColor: backgroundColor.withOpacity(0.1),
      body: child,
    );
  }
}
