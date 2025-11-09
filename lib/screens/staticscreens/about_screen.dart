import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final backgroundColor = Theme.of(context).primaryColor;
    final textColor = Colors.white;
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: const Text(
          'About',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: backgroundColor,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 40),
            Icon(Icons.book, size: 80, color: Colors.amberAccent),
            const SizedBox(height: 24),
            Text(
              'Speechora',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Version 1.0.0',
              style: TextStyle(fontSize: 16, color: textColor.withOpacity(0.7)),
            ),
            const SizedBox(height: 24),
            Text(
              'Speechora is an educational app designed to make learning fun and interactive for all ages. Enjoy curated content, interactive features, and a beautiful user experience.',
              style: TextStyle(fontSize: 16, color: textColor.withOpacity(0.9)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            const Divider(color: Colors.white24),
            const SizedBox(height: 16),
            Text(
              'Developed by Shohan Chowdhury',
              style: TextStyle(color: textColor.withOpacity(0.7)),
            ),
            const SizedBox(height: 8),
            Text(
              'Contact: support@speechora.com',
              style: TextStyle(color: textColor.withOpacity(0.7)),
            ),
          ],
        ),
      ),
    );
  }
}
