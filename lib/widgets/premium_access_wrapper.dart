import 'package:speachora/constants/constants.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';

class PremiumAccessWrapper extends StatefulWidget {
  final Widget child;
  final bool allowAccess;
  final String onAccessDeniedRoute;
  final VoidCallback? onAccessGranted;
  final VoidCallback? onAccessDenied;

  const PremiumAccessWrapper({
    Key? key,
    required this.child,
    this.allowAccess = false,
    this.onAccessDeniedRoute = '/settings',
    this.onAccessGranted,
    this.onAccessDenied,
  }) : super(key: key);

  @override
  State<PremiumAccessWrapper> createState() => _PremiumAccessWrapperState();
}

class _PremiumAccessWrapperState extends State<PremiumAccessWrapper>
    with WidgetsBindingObserver {
  bool _isLoading = false;
  bool _isRefreshing = false;
  String _errorMessage = '';
  bool _hasAccess = false;

  // Cache the last check time to avoid excessive API calls
  DateTime? _lastCheckTime;
  static const Duration _checkCooldown = Duration(minutes: 5);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkPremiumStatus();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      _refreshUserDetailsOnResume();
    }
  }

  Future<void> _refreshUserDetailsOnResume() async {
    // Avoid excessive API calls on resume
    if (_lastCheckTime != null &&
        DateTime.now().difference(_lastCheckTime!) < _checkCooldown) {
      return;
    }

    if (_isRefreshing) return; // Prevent multiple simultaneous refreshes

    setState(() => _isRefreshing = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userId = await _getUserId(prefs);

      if (userId == null) {
        setState(() => _isRefreshing = false);
        return;
      }

      final response = await http
          .get(
            Uri.parse('${Constants.baseUrl}/user/details/$userId'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await _persistUserData(prefs, data);

        // Check access after updating data
        final hasAccess = await _checkAccess();
        if (mounted) {
          setState(() {
            _hasAccess = hasAccess;
            _lastCheckTime = DateTime.now();
          });

          if (hasAccess) {
            widget.onAccessGranted?.call();
          } else {
            widget.onAccessDenied?.call();
          }
        }
      } else {
        debugPrint(
          'Resume refresh failed: ${response.statusCode} ${response.body}',
        );
      }
    } catch (e, stackTrace) {
      debugPrint('Exception while refreshing on resume: $e\n$stackTrace');
    } finally {
      if (mounted) {
        setState(() => _isRefreshing = false);
      }
    }
  }

  Future<String?> _getUserId(SharedPreferences prefs) async {
    final dynamic userIdRaw = prefs.get('userId');
    return userIdRaw?.toString();
  }

  Future<void> _persistUserData(
    SharedPreferences prefs,
    Map<String, dynamic> data,
  ) async {
    // Update common user profile fields
    final fieldsToUpdate = {
      'username': 'userName',
      'email': 'userEmail',
      'token': 'token',
    };

    for (final entry in fieldsToUpdate.entries) {
      if (data[entry.key] != null) {
        await prefs.setString(entry.value, data[entry.key].toString());
      }
    }

    // Update premium/trial fields with better type handling
    await _updatePremiumFields(prefs, data);
  }

  Future<void> _updatePremiumFields(
    SharedPreferences prefs,
    Map<String, dynamic> data,
  ) async {
    final premiumActive = data['premiumActive'] == true;
    final premiumBalance = _parseToInt(data['premiumBalance']);
    final premiumDeduction = _parseToInt(data['premiumDeduction']);
    final premiumExpiry = data['premiumExpiry']?.toString() ?? '';
    final trialStartDate = data['trialStartDate']?.toString() ?? '';
    final trialExpiry = data['trialExpiry']?.toString() ?? '';
    final isTrialUsed = data['isTrialUsed'] == true;

    await Future.wait([
      prefs.setBool('premiumActive', premiumActive),
      prefs.setInt('premiumBalance', premiumBalance),
      prefs.setInt('premiumDeduction', premiumDeduction),
      prefs.setString('premiumExpiry', premiumExpiry),
      prefs.setString('trialStartDate', trialStartDate),
      prefs.setString('trialExpiry', trialExpiry),
      prefs.setBool('isTrialUsed', isTrialUsed),
    ]);
  }

  int _parseToInt(dynamic value) {
    if (value is int) return value;
    if (value is double) return value.toInt();
    return int.tryParse(value?.toString() ?? '0') ?? 0;
  }

  Future<void> _checkPremiumStatus() async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userId = await _getUserId(prefs);

      if (userId == null || userId.isEmpty) {
        setState(() {
          _errorMessage = 'User not logged in';
          _hasAccess = false;
        });
        return;
      }

      final response = await http
          .get(
            Uri.parse('${Constants.baseUrl}/user/details/$userId'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await _persistUserData(prefs, data);

        final hasAccess = await _determineAccess(data);

        setState(() {
          _hasAccess = hasAccess;
          _lastCheckTime = DateTime.now();
        });

        if (hasAccess) {
          widget.onAccessGranted?.call();
        } else {
          widget.onAccessDenied?.call();
        }

        _showStatusMessage(data, hasAccess);
      } else {
        _handleApiError(response);
      }
    } catch (e, stackTrace) {
      _handleException(e, stackTrace);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<bool> _determineAccess(Map<String, dynamic> data) async {
    final premiumActive = data['premiumActive'] == true;
    final premiumExpiry = data['premiumExpiry']?.toString() ?? '';
    final trialExpiry = data['trialExpiry']?.toString() ?? '';
    final isTrialUsed = data['isTrialUsed'] == true;

    final now = DateTime.now();

    // Check premium access
    if (premiumActive) {
      if (premiumExpiry.isEmpty) return true; // No expiry = unlimited

      final expiry = DateTime.tryParse(premiumExpiry);
      if (expiry != null && !now.isAfter(expiry)) {
        return true;
      }
    }

    // Check trial access
    if (!isTrialUsed && trialExpiry.isNotEmpty) {
      final expiry = DateTime.tryParse(trialExpiry);
      if (expiry != null && !now.isAfter(expiry)) {
        return true;
      }
    }

    return false;
  }

  void _showStatusMessage(Map<String, dynamic> data, bool hasAccess) {
    if (!mounted) return;

    String message;
    final premiumActive = data['premiumActive'] == true;
    final premiumBalance = _parseToInt(data['premiumBalance']);
    final trialExpiry = data['trialExpiry']?.toString() ?? '';
    final isTrialUsed = data['isTrialUsed'] == true;

    if (hasAccess && premiumActive) {
      message = 'Premium active - balance: $premiumBalance';
    } else if (hasAccess && !isTrialUsed) {
      message = 'Trial active until $trialExpiry';
    } else {
      message = 'No active premium or trial';
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 3)),
    );
  }

  void _handleApiError(http.Response response) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('API error: ${response.statusCode}')),
      );
    }
    debugPrint(
      'Premium status API error: ${response.statusCode} ${response.body}',
    );
  }

  void _handleException(Object e, StackTrace stackTrace) {
    if (mounted) {
      setState(() {
        _errorMessage = 'Failed to check premium status';
      });
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to check premium status: $e')),
      );
    }

    debugPrint('Exception while checking premium status: $e\n$stackTrace');
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  Future<void> _openBuyUrl() async {
    try {
      final url = Uri.parse(Constants.frontendBuyUrl);
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        throw 'Could not launch $url';
      }
    } catch (e) {
      debugPrint('Failed to open buy URL: $e');
      if (mounted) {
        Navigator.of(context).pushNamed(widget.onAccessDeniedRoute);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _checkAccess(),
      builder: (context, snapshot) {
        if (_isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final hasAccess = snapshot.data ?? _hasAccess;

        if (hasAccess || widget.allowAccess) {
          return widget.child;
        }

        return _buildAccessDeniedScreen();
      },
    );
  }

  Widget _buildAccessDeniedScreen() {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: MediaQuery.of(context).size.height -
                    MediaQuery.of(context).padding.vertical,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Main visual/title/description block are spaced evenly
                  const Icon(Icons.lock_outline, size: 64, color: Colors.amber),

                  const Text(
                    'Premium Access Required',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),

                  Column(
                    children: [
                      Text(
                        _errorMessage.isNotEmpty
                            ? _errorMessage
                            : 'Your premium access has expired or is not active.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Purchase premium access to continue using all features.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                    ],
                  ),

                  // Actions area
                  if (_isLoading || _isRefreshing)
                    const Column(
                      children: [
                        CircularProgressIndicator(color: Colors.amber),
                        SizedBox(height: 16),
                        Text('Checking status...'),
                      ],
                    )
                  else
                    _buildActionButtons(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber,
                  foregroundColor: Colors.black87,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: _checkPremiumStatus,
                icon: const Icon(Icons.refresh),
                label: const Text(
                  'Refresh Status',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[200],
                  foregroundColor: Colors.black87,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: _logout,
                icon: const Icon(Icons.logout),
                label: const Text('Logout'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            onPressed: _openBuyUrl,
            icon: const Icon(Icons.shopping_cart),
            label: const Text(
              'Purchase Premium',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  Future<bool> _checkAccess() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Get stored values with better type handling
      final premiumActive = _getBoolFromPrefs(prefs, 'premiumActive');
      final premiumExpiry = prefs.getString('premiumExpiry') ?? '';
      final trialExpiry = prefs.getString('trialExpiry') ?? '';
      final isTrialUsed = _getBoolFromPrefs(prefs, 'isTrialUsed');

      final now = DateTime.now();

      // Check premium access
      if (premiumActive) {
        if (premiumExpiry.isEmpty) return true;

        final expiry = DateTime.tryParse(premiumExpiry);
        if (expiry != null && !now.isAfter(expiry)) {
          return true;
        }
      }

      // Check trial access
      if (!isTrialUsed && trialExpiry.isNotEmpty) {
        final expiry = DateTime.tryParse(trialExpiry);
        if (expiry != null && !now.isAfter(expiry)) {
          return true;
        }
      }

      return false;
    } catch (e) {
      debugPrint('Error checking access: $e');
      return false;
    }
  }

  bool _getBoolFromPrefs(SharedPreferences prefs, String key) {
    final value = prefs.get(key);
    if (value is bool) return value;
    if (value is int) return value != 0;
    return value?.toString() == 'true';
  }
}
