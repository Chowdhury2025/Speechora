import 'package:book8/screens/staticscreens/about_screen.dart';
import 'package:book8/widgets/premium_payment_dialog.dart';
import 'package:book8/services/premium_guard.dart';
import 'package:book8/services/subscription_service.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => SettingsScreenState();
}

class SettingsScreenState extends State<SettingsScreen> {
  static String selectedLanguage = 'English';
  static String selectedVoiceAccent = 'American';

  String userName = '';
  String userEmail = '';
  bool isPremium = false;
  String premiumExpiry = '';
  double premiumBalance = 0;
  bool isTrialUsed = false;
  DateTime? trialExpiry;
  String premiumStatus = ''; // can be '', 'trial', or 'premium'
  bool isDefaultLauncher = false;

  final List<String> languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Hindi',
    'Chinese',
    'Arabic',
    'Bengali',
    'Portuguese',
    'Russian',
  ];

  final List<String> voiceAccents = [
    'American',
    'British',
    'Australian',
    'Indian',
    'African',
    'Canadian',
    'Irish',
    'Scottish',
  ];

  Map<String, bool> _settingsAccess = {};

  @override
  void initState() {
    super.initState();
    _checkAuthentication();
    _loadPreferences();
    _loadUserInfo();
    _loadSettingsAccess();
    _syncSubscriptionFromServer();
  }

  Future<void> _checkAuthentication() async {
    final prefs = await SharedPreferences.getInstance();
    final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
    if (!isLoggedIn) {
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/login');
      }
    }
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final lang = prefs.getString('selectedLanguage');
    final accent = prefs.getString('selectedVoiceAccent');
    final defaultLauncher = prefs.getBool('isDefaultLauncher');
    final defaultLauncherFlutter = prefs.getBool('flutter.isDefaultLauncher');

    if (lang != null) {
      setState(() {
        selectedLanguage = lang;
        SettingsScreenState.selectedLanguage = lang;
      });
    }
    if (accent != null) {
      setState(() {
        selectedVoiceAccent = accent;
        SettingsScreenState.selectedVoiceAccent = accent;
      });
    }
    if (defaultLauncherFlutter != null) {
      setState(() {
        isDefaultLauncher = defaultLauncherFlutter;
      });
    } else if (defaultLauncher != null) {
      setState(() {
        isDefaultLauncher = defaultLauncher;
      });
    }
  }

  Future<void> _savePreferences() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selectedLanguage', selectedLanguage);
    await prefs.setString('selectedVoiceAccent', selectedVoiceAccent);
    await prefs.setBool('isDefaultLauncher', isDefaultLauncher);
    // Also write the flutter-prefixed key so the native Android code can read it directly
    await prefs.setBool('flutter.isDefaultLauncher', isDefaultLauncher);
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();

    setState(() {
      userName = prefs.getString('userName') ?? '';
      userEmail = prefs.getString('userEmail') ?? '';

      // Load trial status
      isTrialUsed = prefs.getBool('hasUsedTrial') ?? false;
      final trialExpiryStr = prefs.getString('trialExpiry');
      if (trialExpiryStr != null) {
        trialExpiry = DateTime.tryParse(trialExpiryStr);
      }

      // Load premium status
      isPremium = prefs.getBool('isPremium') ?? false;
      premiumExpiry = prefs.getString('premiumExpiry') ?? '';
      premiumBalance = prefs.getDouble('premiumBalance') ?? 0;
      premiumStatus = prefs.getString('premiumStatus') ?? '';

      // Check if trial is active and valid
      if (premiumStatus == 'trial' && trialExpiry != null) {
        if (now.isAfter(trialExpiry!)) {
          // Trial has expired
          prefs.setBool('isPremium', false);
          prefs.setString('premiumStatus', '');
          isPremium = false;
          premiumExpiry = '';
          premiumStatus = '';
        }
      }
      // Check if premium subscription is expired
      else if (premiumStatus == 'premium' && premiumExpiry.isNotEmpty) {
        final expiryDate = DateTime.tryParse(premiumExpiry);
        if (expiryDate != null && now.isAfter(expiryDate)) {
          prefs.setBool('isPremium', false);
          prefs.setString('premiumStatus', '');
          isPremium = false;
          premiumExpiry = '';
          premiumStatus = '';
        }
      }
    });
  }

  Future<void> _syncSubscriptionFromServer() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getInt('userId');
    if (userId == null) return;
    final status = await SubscriptionService.fetchStatus(userId);
    if (status == null) return;
    final state = status['state'] as String?; // trial|premium|expired|free
    final expiry = status['expiry'];
    if (state != null) {
      final now = DateTime.now();
      switch (state) {
        case 'trial':
          if (expiry != null) {
            await prefs.setString('trialExpiry', expiry);
          }
          await prefs.setBool('isPremium', true);
          await prefs.setString('premiumStatus', 'trial');
          await prefs.setBool('hasUsedTrial', false);
          break;
        case 'premium':
          if (expiry != null) {
            await prefs.setString('premiumExpiry', expiry);
          } else {
            await prefs.setString('premiumExpiry', '');
          }
          await prefs.setBool('isPremium', true);
          await prefs.setString('premiumStatus', 'premium');
          await prefs.setBool('hasUsedTrial', true);
          break;
        case 'expired':
          await prefs.setBool('isPremium', false);
          await prefs.setString('premiumStatus', '');
          await prefs.setBool('hasUsedTrial', true);
          break;
        default: // free
          await prefs.setBool('isPremium', false);
          await prefs.setString('premiumStatus', '');
          final trialExpStr = prefs.getString('trialExpiry');
          if (trialExpStr != null) {
            try {
              final t = DateTime.parse(trialExpStr);
              if (t.isBefore(now)) await prefs.setBool('hasUsedTrial', true);
            } catch (_) {}
          }
      }
      // Reload UI state
      if (mounted) {
        _loadUserInfo();
      }
    }
  }

  String _buildAccountStatusDescription() {
    final now = DateTime.now();
    if (premiumStatus == 'trial') {
      if (trialExpiry != null) {
        final diff = trialExpiry!.difference(now).inDays + 1;
        final left = diff < 0 ? 0 : diff;
        final dateStr = trialExpiry!.toIso8601String().split('T').first;
        return 'Trial (expires $dateStr, $left day${left == 1 ? '' : 's'} left)';
      }
      return 'Trial';
    }
    if (premiumStatus == 'premium' || (isPremium && premiumStatus.isEmpty)) {
      if (premiumExpiry.isNotEmpty) {
        final expiryDate = DateTime.tryParse(premiumExpiry);
        if (expiryDate != null) {
          final diff = expiryDate.difference(now).inDays + 1;
          final left = diff < 0 ? 0 : diff;
          final dateStr = expiryDate.toIso8601String().split('T').first;
          return 'Premium (expires $dateStr, $left day${left == 1 ? '' : 's'} left)';
        }
      }
      return 'Premium (no expiry)';
    }
    if (isTrialUsed) return 'Trial expired';
    return 'Free';
  }

  Future<void> _loadSettingsAccess() async {
    final access = await PremiumGuard.getSettingsAccess();
    setState(() {
      _settingsAccess = access;
    });
  }

  @override
  Widget build(BuildContext context) {
    final backgroundColor = Theme.of(context).primaryColor;
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: const Text(
          'Settings',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: backgroundColor,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          // User info card
          Card(
            color: backgroundColor.withOpacity(0.9),
            margin: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: ListTile(
              leading: const CircleAvatar(child: Icon(Icons.person)),
              title: Text(
                userName.isNotEmpty
                    ? userName
                    : (userEmail.isNotEmpty ? userEmail : 'User'),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              subtitle: Text(
                _buildAccountStatusDescription(),
                style: TextStyle(
                  color: _getAccountStatusColor(),
                  fontWeight: FontWeight.w500,
                ),
              ),
              onTap: () {
                Navigator.of(context).pushNamed('/profile').then((_) {
                  _loadUserInfo();
                });
              },
              trailing: IconButton(
                tooltip: 'Refresh subscription',
                icon: const Icon(Icons.refresh, color: Colors.white70),
                onPressed: _syncSubscriptionFromServer,
              ),
            ),
          ),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (!isPremium)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      children: [
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.amber,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: () async {
                            final result = await showDialog<bool>(
                              context: context,
                              builder:
                                  (context) => const PremiumPaymentDialog(),
                            );

                            if (result == true) {
                              await _loadUserInfo();
                            }
                          },
                          child: const Text(
                            'UPGRADE TO PREMIUM',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                        if (!isTrialUsed && premiumStatus != 'trial')
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: TextButton(
                              onPressed: () async {
                                final now = DateTime.now();
                                final trialExpiry = now.add(
                                  const Duration(days: 7),
                                );

                                final prefs =
                                    await SharedPreferences.getInstance();
                                await prefs.setString(
                                  'trialExpiry',
                                  trialExpiry.toIso8601String(),
                                );
                                await prefs.setBool('isPremium', true);
                                await prefs.setString('premiumStatus', 'trial');
                                await prefs.setBool('hasUsedTrial', true);

                                await _loadUserInfo();

                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('7-day trial activated!'),
                                      backgroundColor: Colors.green,
                                    ),
                                  );
                                }
                              },
                              child: const Text(
                                'Start 7-day Free Trial',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.amber,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ),
                        if (isTrialUsed && premiumStatus != 'trial')
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(
                              'Trial period has been used',
                              style: TextStyle(
                                color: Colors.red[300],
                                fontSize: 14,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                if (isPremium)
                  Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    decoration: BoxDecoration(
                      color:
                          premiumStatus == 'trial'
                              ? Colors.amber[700]
                              : Colors.green[700],
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: Colors.black26, blurRadius: 8),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: Column(
                      children: [
                        Text(
                          premiumStatus == 'trial'
                              ? 'Trial Active'
                              : 'Premium Account',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            letterSpacing: 1.2,
                          ),
                        ),
                        // PREMIUM: show expiry date first
                        if (((premiumStatus == 'premium') ||
                                (isPremium && premiumStatus.isEmpty)) &&
                            premiumExpiry.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Builder(
                              builder: (context) {
                                final expiryDate = DateTime.tryParse(
                                  premiumExpiry,
                                );
                                if (expiryDate == null) {
                                  return const Text(
                                    'Expires: Unknown date',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                    ),
                                  );
                                }
                                return Text(
                                  'Expires: ${expiryDate.toIso8601String().split('T')[0]}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                  ),
                                );
                              },
                            ),
                          ),
                        // BALANCE (if any) appears before days remaining
                        if (premiumBalance > 0)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(
                              'Balance: ₦${premiumBalance.toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        // DAYS REMAINING LAST (trial)
                        if (premiumStatus == 'trial' && trialExpiry != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Builder(
                              builder: (context) {
                                final daysLeft =
                                    trialExpiry!
                                        .difference(DateTime.now())
                                        .inDays +
                                    1;
                                final safeDays = daysLeft < 0 ? 0 : daysLeft;
                                return Text(
                                  'Days remaining: $safeDays',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                  ),
                                );
                              },
                            ),
                          ),
                        // DAYS REMAINING LAST (premium)
                        if (((premiumStatus == 'premium') ||
                                (isPremium && premiumStatus.isEmpty)) &&
                            premiumExpiry.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Builder(
                              builder: (context) {
                                final expiryDate = DateTime.tryParse(
                                  premiumExpiry,
                                );
                                if (expiryDate == null)
                                  return const SizedBox.shrink();
                                final daysLeft =
                                    expiryDate
                                        .difference(DateTime.now())
                                        .inDays +
                                    1;
                                final safeDays = daysLeft < 0 ? 0 : daysLeft;
                                return Text(
                                  'Days remaining: $safeDays',
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 14,
                                  ),
                                );
                              },
                            ),
                          ),
                        if (((premiumStatus == 'premium') ||
                                (isPremium && premiumStatus.isEmpty)) &&
                            premiumExpiry.isEmpty)
                          const Padding(
                            padding: EdgeInsets.only(top: 8.0),
                            child: Text(
                              'Days remaining: Unlimited',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                _settingsCard(
                  Icons.language,
                  'Language',
                  trailing: selectedLanguage,
                  onTap: _showLanguageDialog,
                ),
                _settingsCard(
                  Icons.record_voice_over,
                  'Voice Accent',
                  trailing: selectedVoiceAccent,
                  onTap: _showAccentDialog,
                ),
                _settingsCard(Icons.category, 'Categories'),
                _settingsCard(Icons.favorite, 'Favorites'),
                _settingsCard(Icons.folder, 'File Locations'),
                _settingsCard(
                  Icons.view_column,
                  'Display',
                  trailing: 'two columns',
                ),
                _settingsCard(Icons.notifications, 'Notifications'),
                _settingsCard(Icons.download, 'Downloads'),
                _settingsCard(Icons.cleaning_services, 'Clear Cache'),
                const Divider(color: Colors.white24, height: 32),
                // Default launcher toggle
                Card(
                  color: Theme.of(context).primaryColor.withOpacity(0.7),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 4,
                  margin: const EdgeInsets.symmetric(vertical: 7),
                  child: SwitchListTile(
                    title: const Text(
                      'Set as Default Launcher',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      'Make Book8 your default home screen app',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    value: isDefaultLauncher,
                    activeColor: Colors.green,
                    onChanged: (value) {
                      setState(() {
                        isDefaultLauncher = value;
                      });
                      _setDefaultLauncher();
                    },
                    secondary: const Icon(Icons.home, color: Colors.white),
                  ),
                ),
                _settingsCard(Icons.copyright, 'Copyright'),
                _settingsCard(Icons.privacy_tip, 'Privacy'),
                _settingsCard(Icons.star_rate, 'Rate Us'),
                _settingsCard(Icons.apps, 'More Apps'),
                _settingsCard(Icons.info, 'About'),
                const SizedBox(height: 30),
                // Logout button
                ElevatedButton.icon(
                  onPressed: _logout,
                  icon: const Icon(Icons.logout),
                  label: const Text('Logout'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    textStyle: const TextStyle(fontWeight: FontWeight.bold),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getAccountStatusColor() {
    if (premiumStatus == 'premium') {
      return Colors.green;
    } else if (premiumStatus == 'trial') {
      return Colors.amber;
    } else if (isTrialUsed) {
      return Colors.red;
    } else {
      return Colors.white70;
    }
  }

  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Select Language'),
            content: SizedBox(
              width: double.maxFinite,
              child: ListView(
                shrinkWrap: true,
                children:
                    languages
                        .map(
                          (lang) => ListTile(
                            title: Text(lang),
                            selected: lang == selectedLanguage,
                            onTap: () {
                              setState(() {
                                selectedLanguage = lang;
                                SettingsScreenState.selectedLanguage = lang;
                              });
                              _savePreferences();
                              Navigator.pop(context);
                            },
                          ),
                        )
                        .toList(),
              ),
            ),
          ),
    );
  }

  void _showAccentDialog() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Select Voice Accent'),
            content: SizedBox(
              width: double.maxFinite,
              child: ListView(
                shrinkWrap: true,
                children:
                    voiceAccents
                        .map(
                          (accent) => ListTile(
                            title: Text(accent),
                            selected: accent == selectedVoiceAccent,
                            onTap: () {
                              setState(() {
                                selectedVoiceAccent = accent;
                                SettingsScreenState.selectedVoiceAccent =
                                    accent;
                              });
                              _savePreferences();
                              Navigator.pop(context);
                            },
                          ),
                        )
                        .toList(),
              ),
            ),
          ),
    );
  }

  Widget _settingsCard(
    IconData icon,
    String title, {
    String? trailing,
    VoidCallback? onTap,
  }) {
    final backgroundColor = Theme.of(context).primaryColor;
    final cardColor = backgroundColor.withOpacity(0.7);
    final textColor = Colors.white;
    final isAccessible = _settingsAccess[title.toLowerCase()] ?? true;

    return Card(
      color: cardColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 4,
      margin: const EdgeInsets.symmetric(vertical: 7),
      child: Stack(
        children: [
          ListTile(
            leading: Icon(
              icon,
              color: isAccessible ? textColor : textColor.withOpacity(0.5),
            ),
            title: Text(
              title,
              style: TextStyle(
                color: isAccessible ? textColor : textColor.withOpacity(0.5),
                fontWeight: FontWeight.w600,
              ),
            ),
            trailing:
                !isAccessible
                    ? const Icon(Icons.lock, color: Colors.amber, size: 20)
                    : (trailing != null
                        ? Text(
                          trailing,
                          style: TextStyle(color: textColor.withOpacity(0.7)),
                        )
                        : const Icon(
                          Icons.arrow_forward_ios,
                          color: Colors.white54,
                          size: 18,
                        )),
            onTap:
                !isAccessible
                    ? () {
                      showDialog(
                        context: context,
                        builder:
                            (context) => AlertDialog(
                              title: const Text('Premium Feature'),
                              content: const Text(
                                'This feature is only available for Premium and Trial users.',
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: const Text('Cancel'),
                                ),
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.pop(context);
                                    showDialog(
                                      context: context,
                                      builder:
                                          (context) =>
                                              const PremiumPaymentDialog(),
                                    );
                                  },
                                  child: const Text('Upgrade to Premium'),
                                ),
                              ],
                            ),
                      );
                    }
                    : (onTap ??
                        () {
                          if (title == 'About') {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => const AboutScreen(),
                              ),
                            );
                          }
                        }),
          ),
        ],
      ),
    );
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isLoggedIn', false);
    // Optionally clear other user data:
    // await prefs.remove('userName');
    // await prefs.remove('isPremium');
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  void _setDefaultLauncher() async {
    if (isDefaultLauncher) {
      // Use a platform channel to open the Android home settings screen
      const channel = MethodChannel('com.book8/app');
      try {
        await channel.invokeMethod('openHomeSettings');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please select Book8 as your default home app'),
            duration: Duration(seconds: 5),
          ),
        );
      } on PlatformException catch (e) {
        print('PlatformException opening home settings: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not open home settings'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
    await _savePreferences();
  }
}
