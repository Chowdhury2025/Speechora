import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../constants/constants.dart';
import '../../models/user_model.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String _errorMessage = '';
  bool _obscurePassword = true;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 0.5,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    _animationController.forward();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final requestBody = {
        'email': _emailController.text,
        'password': _passwordController.text,
      };

      final response = await http.post(
        Uri.parse('${Constants.baseUrl}/user/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      final responseData = jsonDecode(response.body);

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

          // Create UserModel from transformed data
          UserModel user = UserModel.fromJson(transformedData);

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

          // Premium status is now handled by PremiumAccessWrapper

          // Navigate to home screen after successful login
          if (mounted) {
            Navigator.of(context).pushReplacementNamed('/home');
          }
        } catch (userModelError) {
          // If UserModel creation fails, show error message
          setState(() {
            _errorMessage =
                'Login successful but data format issue. Please contact support.';
          });
        }
      } else {
        // Show backend error message directly from API response
        setState(() {
          _errorMessage = response.body;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _launchRegisterWebsite() async {
    final Uri url = Uri.parse(Constants.frontendRegisterUrl);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open registration page')),
        );
      }
    }
  }

  Future<void> _launchForgotPasswordWebsite() async {
    final Uri url = Uri.parse(Constants.frontendForgotPasswordUrl);
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
    final screenHeight = MediaQuery.of(context).size.height;
    
    return Scaffold(
      backgroundColor: const Color(0xFF58CC02), // Your app's primary green
      body: SafeArea(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: screenHeight - MediaQuery.of(context).padding.top),
            child: IntrinsicHeight(
              child: Column(
                children: [
                  // Top Section with App Logo and Branding
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.fromLTRB(24, screenHeight * 0.08, 24, 40),
                    child: Column(
                      children: [
                        // App Logo
                        AnimatedBuilder(
                          animation: _animationController,
                          builder: (context, child) {
                            return Transform.scale(
                              scale: _scaleAnimation.value,
                              child: FadeTransition(
                                opacity: _fadeAnimation,
                                child: Container(
                                  height: 120,
                                  width: 120,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Colors.white,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.15),
                                        blurRadius: 20,
                                        offset: const Offset(0, 10),
                                      ),
                                    ],
                                  ),
                                  child: ClipOval(
                                    child: Image.asset(
                                      'assets/appIcon.png',
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return const Icon(
                                          Icons.school,
                                          size: 60,
                                          color: Color(0xFF58CC02),
                                        );
                                      },
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 32),
                        
                        // Welcome Text
                        const Text(
                          '🎓 Welcome Back! 🎉',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            fontFamily: 'Nunito',
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '📚 Ready to continue your learning adventure? 🚀',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.white70,
                            fontFamily: 'Nunito',
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Login Form Section
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
                      decoration: const BoxDecoration(
                        color: Color(0xFFFFFDFB), // Your app's background color
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(32),
                          topRight: Radius.circular(32),
                        ),
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Email Input
                            Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(15),
                                border: Border.all(
                                  color: Colors.grey.shade300,
                                  width: 2,
                                ),
                              ),
                              child: TextFormField(
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                style: const TextStyle(
                                  fontSize: 16,
                                  color: Color(0xFF4B4B4B), // Your app's text color
                                  fontFamily: 'Nunito',
                                ),
                                decoration: InputDecoration(
                                  labelText: 'Email',
                                  labelStyle: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontFamily: 'Nunito',
                                  ),
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.all(16),
                                  prefixIcon: const Icon(
                                    Icons.email_rounded,
                                    color: Color(0xFF58CC02), // Your app's primary color
                                  ),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter your email';
                                  }
                                  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                                    return 'Please enter a valid email';
                                  }
                                  return null;
                                },
                              ),
                            ),
                            const SizedBox(height: 16),
                            
                            // Password Input
                            Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(15),
                                border: Border.all(
                                  color: Colors.grey.shade300,
                                  width: 2,
                                ),
                              ),
                              child: TextFormField(
                                controller: _passwordController,
                                obscureText: _obscurePassword,
                                style: const TextStyle(
                                  fontSize: 16,
                                  color: Color(0xFF4B4B4B), // Your app's text color
                                  fontFamily: 'Nunito',
                                ),
                                decoration: InputDecoration(
                                  labelText: 'Password',
                                  labelStyle: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontFamily: 'Nunito',
                                  ),
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.all(16),
                                  prefixIcon: const Icon(
                                    Icons.lock_rounded,
                                    color: Color(0xFF58CC02), // Your app's primary color
                                  ),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscurePassword
                                          ? Icons.visibility_off_rounded
                                          : Icons.visibility_rounded,
                                      color: Colors.grey.shade600,
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
                            ),
                            const SizedBox(height: 24),
                            
                            // Error Message
                            if (_errorMessage.isNotEmpty) ...[
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFF4B4B).withOpacity(0.1), // Your app's error color
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: const Color(0xFFFF4B4B).withOpacity(0.3),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.error_outline,
                                      color: Color(0xFFFF4B4B), // Your app's error color
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _errorMessage,
                                        style: const TextStyle(
                                          color: Color(0xFFFF4B4B), // Your app's error color
                                          fontSize: 14,
                                          fontFamily: 'Nunito',
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],
                            
                            // Login Button
                            Container(
                              width: double.infinity,
                              height: 56,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(15),
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFF58CC02), // Your app's primary color
                                    Color(0xFF47B102),
                                  ],
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF58CC02).withOpacity(0.3),
                                    blurRadius: 15,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _handleLogin,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                ),
                                child: _isLoading
                                    ? const SizedBox(
                                        width: 24,
                                        height: 24,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 3,
                                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                        ),
                                      )
                                    : const Text(
                                        '🌟 Let\'s Learn! 🌟',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                          fontFamily: 'Nunito',
                                        ),
                                      ),
                              ),
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Forgot Password
                            Center(
                              child: TextButton(
                                onPressed: _launchForgotPasswordWebsite,
                                child: const Text(
                                  'Forgot your password?',
                                  style: TextStyle(
                                    color: Color(0xFF4B4B4B), // Your app's text color
                                    fontSize: 14,
                                    fontFamily: 'Nunito',
                                  ),
                                ),
                              ),
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Divider
                            Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    height: 1,
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 16),
                                  child: Text(
                                    'or',
                                    style: TextStyle(
                                      color: Colors.grey.shade600,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      fontFamily: 'Nunito',
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Container(
                                    height: 1,
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Create Account Button
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 16,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1CB0F6).withOpacity(0.1), // Your app's secondary color
                                borderRadius: BorderRadius.circular(15),
                                border: Border.all(
                                  color: const Color(0xFF1CB0F6).withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: TextButton(
                                onPressed: _launchRegisterWebsite,
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.person_add_rounded,
                                      color: Color(0xFF1CB0F6), // Your app's secondary color
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    Flexible(
                                      child: const Text(
                                        "✨ New here? Create an account! ✨",
                                        style: TextStyle(
                                          color: Color(0xFF1CB0F6), // Your app's secondary color
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                          fontFamily: 'Nunito',
                                        ),
                                        textAlign: TextAlign.center,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            
                            // Bottom Spacer
                            const SizedBox(height: 32),
                          ],
                        ),
                      ),
                    ),
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
    _animationController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
