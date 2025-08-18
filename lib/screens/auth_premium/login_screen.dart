import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../constants/constants.dart';
import '../../models/user_model.dart';
import '../../services/premium_guard.dart';
import '../../services/subscription_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String _errorMessage = '';
  bool _obscurePassword = true;

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final response = await http.post(
        Uri.parse('${Constants.baseUrl}/user/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': _emailController.text,
          'password': _passwordController.text,
        }),
      );

      final responseData = jsonDecode(response.body);

      // DEBUG: Print the response data
      print('=== DEBUG: Login Response ===');
      print('Status Code: ${response.statusCode}');
      print('Response Data: $responseData');

      if (response.statusCode == 200) {
        try {
          // Transform the API response to match UserModel structure
          final transformedData = {
            'id': responseData['userId'],
            'username': responseData['username'],
            'lastName': null,
            'middleName': null,
            'token': null,
            'email': responseData['email'],
            'phoneNumber': responseData['phoneNumber'],
            'group': responseData['group'],
            'createdAt': DateTime.now().toIso8601String(),
            'nrc_card_id': null,
            'role': responseData['role'],
            'isEmailVerified': responseData['isEmailVerified'] ?? false,
            'emailVerificationToken': null,
            'bloodGroup': responseData['bloodGroup'],
            'address': responseData['address'],
            'premium': responseData['premium'],
            'dateOfBirth': responseData['dateOfBirth'],
            'gender': responseData['gender'],
            'emergencyContact': responseData['emergencyContact'],
          };

          print('=== DEBUG: Transformed Data ===');
          print('Transformed Data: $transformedData');

          // Create UserModel from transformed data
          UserModel user = UserModel.fromJson(transformedData);

          print('=== DEBUG: UserModel created successfully ===');
          print('User ID: ${user.id}');
          print('User Email: ${user.email}');
          print('User Token: ${user.token ?? "No token"}');

          // Store user data
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('userData', jsonEncode(user.toJson()));
          await prefs.setBool('isLoggedIn', true);
          await prefs.setInt('userId', user.id);

          // Save individual user fields for app-wide access
          await prefs.setString('userName', user.username ?? '');
          await prefs.setString('userEmail', user.email);
          await prefs.setString(
            'userRole',
            user.role.toString().split('.').last,
          );
          await prefs.setString('userPhone', user.phoneNumber ?? '');
          await prefs.setString('userBloodGroup', user.bloodGroup ?? '');
          await prefs.setString('userAddress', user.address ?? '');
          await prefs.setString('userGender', user.gender ?? '');
          await prefs.setString(
            'userEmergencyContact',
            user.emergencyContact ?? '',
          );

          // Handle premium / trial from login response (new backend shape)
          if (responseData['premium'] != null) {
            final premiumData = responseData['premium'];
            final bool isActive = premiumData['isActive'] ?? false;
            final String? expiryStr = premiumData['expiry'];
            final String? trialExpiryStr = premiumData['trialExpiry'];
            final DateTime now = DateTime.now();
            String premiumStatus = '';

            if (trialExpiryStr != null) {
              DateTime? tExp;
              try {
                tExp = DateTime.parse(trialExpiryStr);
              } catch (_) {}
              if (tExp != null && tExp.isAfter(now)) {
                premiumStatus = 'trial';
                await prefs.setString('trialExpiry', tExp.toIso8601String());
                await prefs.setBool('hasUsedTrial', false);
                await prefs.setBool('isPremium', true);
              } else if (tExp != null && tExp.isBefore(now)) {
                await prefs.setBool('hasUsedTrial', true);
              }
            }

            if (premiumStatus != 'trial' && isActive) {
              premiumStatus = 'premium';
              if (expiryStr != null) {
                await prefs.setString('premiumExpiry', expiryStr);
              } else {
                await prefs.setString('premiumExpiry', '');
              }
              await prefs.setBool('isPremium', true);
            }

            if (premiumStatus.isEmpty) {
              await prefs.setBool('isPremium', false);
              await prefs.setString('premiumExpiry', '');
            }

            await prefs.setString('premiumStatus', premiumStatus);
            if (premiumData['balance'] != null) {
              final bal = (premiumData['balance'] as num).toDouble();
              await prefs.setDouble('premiumBalance', bal);
            }
          }

          // Fetch authoritative subscription status
          final status = await SubscriptionService.fetchStatus(user.id);
          if (status != null) {
            final state =
                status['state'] as String?; // trial|premium|expired|free
            final expiry = status['expiry'];
            if (state != null) {
              final now = DateTime.now();
              switch (state) {
                case 'trial':
                  await prefs.setBool('isPremium', true);
                  await prefs.setString('premiumStatus', 'trial');
                  if (expiry != null) {
                    await prefs.setString('trialExpiry', expiry);
                  }
                  await prefs.setBool('hasUsedTrial', false);
                  break;
                case 'premium':
                  await prefs.setBool('isPremium', true);
                  await prefs.setString('premiumStatus', 'premium');
                  if (expiry != null) {
                    await prefs.setString('premiumExpiry', expiry);
                  } else {
                    await prefs.setString('premiumExpiry', '');
                  }
                  await prefs.setBool('hasUsedTrial', true);
                  break;
                case 'expired':
                  await prefs.setBool('isPremium', false);
                  await prefs.setString('premiumStatus', '');
                  await prefs.setBool('hasUsedTrial', true);
                  break;
                default:
                  await prefs.setBool('isPremium', false);
                  await prefs.setString('premiumStatus', '');
                  final trialExpStr = prefs.getString('trialExpiry');
                  if (trialExpStr != null) {
                    try {
                      final t = DateTime.parse(trialExpStr);
                      if (t.isBefore(now)) {
                        await prefs.setBool('hasUsedTrial', true);
                      }
                    } catch (_) {}
                  }
              }
            }
          }
        } catch (userModelError) {
          print('=== DEBUG: Error creating UserModel ===');
          print('Error: $userModelError');
          print('Response data structure might not match UserModel');

          // If UserModel creation fails, let's see what fields are missing
          print('=== DEBUG: Available fields in response ===');
          responseData.forEach((key, value) {
            print('$key: $value (${value.runtimeType})');
          });

          setState(() {
            _errorMessage =
                'Login successful but data format issue. Please contact support.';
          });
        }
      } else {
        setState(() {
          _errorMessage =
              responseData['message'] ?? 'Failed to login. Please try again.';
        });
      }
    } catch (e) {
      print('=== DEBUG: Network or general error ===');
      print('Error: $e');
      setState(() {
        _errorMessage = 'Network error. Please check your connection.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _launchRegisterWebsite() async {
    final Uri url = Uri.parse('https://book8.vercel.app/register');
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open registration page')),
        );
      }
    }
  }

  Future<void> _launchForgotPasswordWebsite() async {
    final Uri url = Uri.parse('https://book8.vercel.app/forgot-password');
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open forgot password page')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo or App name
                  const Text(
                    'Book8',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Email field
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.email),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Password field
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      border: const OutlineInputBorder(),
                      prefixIcon: const Icon(Icons.lock),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 8),

                  // Error message
                  if (_errorMessage.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Text(
                        _errorMessage,
                        style: const TextStyle(color: Colors.red),
                        textAlign: TextAlign.center,
                      ),
                    ),

                  // Login button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child:
                        _isLoading
                            ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                            : const Text('Login'),
                  ),
                  const SizedBox(height: 16), // Register link
                  TextButton(
                    onPressed: _launchRegisterWebsite,
                    child: const Text("Don't have an account? Register"),
                  ),

                  // Forgot password link
                  TextButton(
                    onPressed: _launchForgotPasswordWebsite,
                    child: const Text('Forgot Password?'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
