import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PremiumPaymentDialog extends StatefulWidget {
  const PremiumPaymentDialog({Key? key}) : super(key: key);

  @override
  State<PremiumPaymentDialog> createState() => _PremiumPaymentDialogState();
}

class _PremiumPaymentDialogState extends State<PremiumPaymentDialog> {
  bool _isProcessing = false;
  final _formKey = GlobalKey<FormState>();
  final _cardNumberController = TextEditingController();

  void _simulatePayment() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isProcessing = true);

    // Simulate payment processing
    await Future.delayed(const Duration(seconds: 2));

    // Simulate successful payment
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isPremium', true);
    await prefs.setString('premiumStatus', 'premium');

    // Set premium expiry to 30 days from now
    final expiry = DateTime.now().add(const Duration(days: 30));
    await prefs.setString('premiumExpiry', expiry.toIso8601String());
    await prefs.setString('premiumStatusMessage', 'Premium Active');

    if (!mounted) return;
    Navigator.of(context).pop(true);
  }

  @override
  void dispose() {
    _cardNumberController.dispose();
    super.dispose();
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
              '₦999/month',
              style: TextStyle(
                fontSize: 20,
                color: Colors.green,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Form(
              key: _formKey,
              child: TextFormField(
                controller: _cardNumberController,
                decoration: const InputDecoration(
                  labelText: 'Card Number',
                  hintText: 'Enter card number',
                  prefixIcon: Icon(Icons.credit_card),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter card number';
                  }
                  return null;
                },
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _simulatePayment,
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
                        : const Text('Pay Now', style: TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
