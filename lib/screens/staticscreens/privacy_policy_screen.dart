import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy Policy')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Speechora Privacy Policy',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Effective Date: 7th November 2025',
                style: TextStyle(fontSize: 16, fontStyle: FontStyle.italic),
              ),
              const Text(
                'Last Updated: 7th November 2025',
                style: TextStyle(fontSize: 16, fontStyle: FontStyle.italic),
              ),
              const SizedBox(height: 16),
              const Text(
                'Speechora ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard information when you use our Speechora mobile application ("App").',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '1. Who Uses Speechora',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Speechora is designed for children with autism and communication challenges. However, a parent, guardian, or teacher must create and manage the account before a child can use the app.\n\nChildren use the app under adult supervision only.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '2. Information We Collect',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'We collect limited information to enable app functionality and provide a better experience.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              const Text(
                'a. Information Provided by Parents/Guardians',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Text(
                'When you create an account, we collect:\n• Name\n• Email address\n• Mobile number\n• Country\n• Approximate (coarse) location — city or region (no precise GPS or background tracking)',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              const Text(
                'b. Information About the Child Profile',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Text(
                '• A nickname or first name chosen by the parent (optional)\n• Age group (e.g., 3–5, 6–8)\n• Avatar or image selected by the parent',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              const Text(
                'c. Automatically Collected Information',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Text(
                '• Device type, operating system, and app version\n• In-app usage statistics (non-personal)\n• Crash logs and diagnostics',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              const Text(
                'd. Payment Information',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Text(
                'When you purchase a subscription, payments are processed securely through Google Play Billing.\nSpeechora does not store credit or debit card details.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '3. How We Use Information',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'We use collected data to:\n• Create and manage parent accounts\n• Personalize the app experience (e.g., language, region)\n• Provide customer support and service updates\n• Analyze app performance to improve features\n• Process subscriptions and maintain access control\n\nWe do not:\n• Show ads to children\n• Sell or share data for marketing or advertising\n• Collect personal data directly from children',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '4. Children’s Privacy',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Speechora complies with the Google Play Families Policy and the Children’s Online Privacy Protection Act (COPPA).\n• Children do not create accounts or provide personal information.\n• All data collection and consent come only from the parent/guardian.\n• No external links, ads, or social media features are shown to children.\n• Speechora’s child interface is designed to prevent data entry by children.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '5. Data Storage and Security',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                '• All information is transmitted over secure (HTTPS) connections.\n• Data stored in the cloud is encrypted at rest.\n• We use strict access controls and monitoring to prevent unauthorized access.\n• Local data (like app progress) may be stored on the device for offline use.\n\nWe retain account information as long as necessary to provide services or comply with legal obligations. When no longer needed, data is deleted or anonymized.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '6. Parental Rights and Controls',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Parents and guardians can:\n• Access, edit, or delete account information\n• Delete child profiles\n• Request account or data deletion\n• Manage permissions (microphone, storage, analytics) in device settings\n\nTo make a request, contact us at support@speechora.com.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '7. Third-Party Services',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Speechora uses only essential third-party services:\n• Google Play Billing – for subscriptions\n• Text-to-Speech (TTS) – for voice output\n• Analytics (child-safe mode) – for performance insights only\n\nAll third-party tools are configured to disable personalized advertising and comply with child privacy standards.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '8. International Users',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'If you use Speechora outside your home country, your information may be processed in other regions where we or our partners operate. We follow international privacy principles to protect your data everywhere.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '9. Your Consent',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'By creating an account and using Speechora, the parent or guardian provides consent to collect and process information as described in this Privacy Policy.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '10. Policy Updates',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'We may update this Privacy Policy from time to time. Updates will be posted within the app or on our website, showing the new effective date.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const Text(
                '11. Contact Us',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'If you have any questions, concerns, or data requests, please contact us:\nSpeechora Support\nEmail: support@speechora.com\nWebsite: www.speechora.com',
                style: TextStyle(fontSize: 16),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
