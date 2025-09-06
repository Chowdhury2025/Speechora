import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PremiumPaymentDialog extends StatefulWidget {
  const PremiumPaymentDialog({Key? key}) : super(key: key);

  @override
  State<PremiumPaymentDialog> createState() => _PremiumPaymentDialogState();
}

class _PremiumPaymentDialogState extends State<PremiumPaymentDialog> {
  bool _isProcessing = false;

  Future<void> _launchPurchaseWebsite() async {
    setState(() => _isProcessing = true);

    final Uri url = Uri.parse('https://book8.vercel.app/premium-purchase');
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
                        : const Text('Continue to Purchase', style: TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
