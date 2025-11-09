import 'package:flutter/material.dart';

class CopyrightScreen extends StatelessWidget {
  const CopyrightScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final backgroundColor = Theme.of(context).primaryColor;
    final textColor = Colors.white;

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: const Text(
          'Copyright',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: backgroundColor,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    Icon(Icons.copyright, size: 64, color: textColor.withOpacity(0.9)),
                    const SizedBox(height: 20),
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
                      '© ${DateTime.now().year} All Rights Reserved',
                      style: TextStyle(
                        fontSize: 16,
                        color: textColor.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              _buildSection(
                title: 'Application Copyright',
                content: 'The Speechora application, including its source code, design, logos, '
                    'and user interface, is protected by copyright laws. All rights are '
                    'reserved by Speechora and its licensors.',
                textColor: textColor,
              ),
              _buildSection(
                title: 'Content Copyright',
                content: 'All content within the application, including but not limited to '
                    'text, graphics, logos, images, audio clips, digital downloads, and '
                    'data compilations, is the property of Speechora or its content suppliers '
                    'and is protected by international copyright laws.',
                textColor: textColor,
              ),
              _buildSection(
                title: 'Educational Materials',
                content: 'The educational content, learning materials, and curricula provided '
                    'in this application are protected by copyright. These materials may not '
                    'be reproduced, distributed, or used for commercial purposes without '
                    'explicit written permission.',
                textColor: textColor,
              ),
              _buildSection(
                title: 'Third-Party Content',
                content: 'Some content and materials in this application may be owned by '
                    'third parties and are used under license. All rights to such content '
                    'remain with their respective owners.',
                textColor: textColor,
              ),
              _buildSection(
                title: 'Fair Use',
                content: 'Limited portions of the content may be used for personal, '
                    'non-commercial educational purposes in accordance with applicable '
                    'fair use provisions and copyright laws.',
                textColor: textColor,
              ),
              _buildSection(
                title: 'Intellectual Property',
                content: 'The Speechora name, logo, and related marks are trademarks or '
                    'registered trademarks. No right or license is granted to use any '
                    'trademark or other intellectual property rights.',
                textColor: textColor,
              ),
              const SizedBox(height: 20),
              Center(
                child: Text(
                  'For copyright inquiries, please contact:',
                  style: TextStyle(
                    fontSize: 14,
                    color: textColor.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'copyright@speechora.com',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: textColor.withOpacity(0.9),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required String content,
    required Color textColor,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: TextStyle(
              fontSize: 14,
              height: 1.5,
              color: textColor.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }
}