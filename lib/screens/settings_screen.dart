import 'package:book8/screens/staticscreens/about_screen.dart';
import 'package:book8/services/tts_service.dart';
import 'package:book8/widgets/alarm_settings.dart';
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

  final TTSService _ttsService = TTSService();

  @override
  void initState() {
    super.initState();
    _checkAuthentication();
    _loadPreferences();
    _loadUserInfo();
    _loadSettingsAccess();
    _initializeTTS();
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

      // Load premium status
      isPremium = prefs.getBool('isPremium') ?? false;
      premiumExpiry = prefs.getString('premiumExpiry') ?? '';
      premiumStatus = prefs.getString('premiumStatus') ?? '';

      // Check if premium subscription is expired
      if (premiumStatus == 'premium' && premiumExpiry.isNotEmpty) {
        final expiryDate = DateTime.tryParse(premiumExpiry);
        if (expiryDate != null && now.isAfter(expiryDate)) {
          // Premium expired, update prefs
          prefs.setBool('isPremium', false);
          prefs.setString('premiumStatus', '');
          isPremium = false;
          premiumExpiry = '';
          premiumStatus = '';
        }
      }
    });
  }

  Future<void> _loadSettingsAccess() async {
    // No premium access needed
  }

  String _buildAccountStatusDescription() {
    final now = DateTime.now();
    if (premiumStatus == 'premium' && premiumExpiry.isNotEmpty) {
      final expiryDate = DateTime.tryParse(premiumExpiry);
      if (expiryDate != null) {
        final diff = expiryDate.difference(now).inDays + 1;
        final left = diff < 0 ? 0 : diff;
        final dateStr = expiryDate.toIso8601String().split('T').first;
        return 'Premium (expires $dateStr, $left day${left == 1 ? '' : 's'} left)';
      }
    }
    if (isPremium && premiumStatus.isEmpty) {
      return 'Premium (no expiry)';
    }
    return 'Free';
  }

  Future<void> _initializeTTS() async {
    await _ttsService.init();
  }

  Color _getAccountStatusColor() {
    if (premiumStatus == 'premium' || (isPremium && premiumStatus.isEmpty)) {
      return Colors.green;
    } else {
      return Colors.white70;
    }
  }

  @override
  void dispose() {
    _ttsService.stop();
    super.dispose();
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

  Future<void> _testTTS() async {
    await _ttsService.init();
    await _ttsService.setAccent(selectedVoiceAccent);
    await _ttsService.speak(
      'Hello! This is a test of the $selectedVoiceAccent voice accent.',
    );
  }

  void _showAlarmSettings() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).primaryColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder:
          (context) => DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.8,
            minChildSize: 0.5,
            maxChildSize: 0.9,
            builder:
                (context, scrollController) => Container(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Alarm & Usage Settings',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          IconButton(
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(Icons.close, color: Colors.white),
                          ),
                        ],
                      ),
                      const Divider(color: Colors.white24),
                      Expanded(
                        child: SingleChildScrollView(
                          controller: scrollController,
                          child: const AlarmSettings(),
                        ),
                      ),
                    ],
                  ),
                ),
          ),
    );
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
            ),
          ),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
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
                _settingsCard(Icons.volume_up, 'Test TTS', onTap: _testTTS),
                _settingsCard(
                  Icons.alarm,
                  'Alarm & Usage Settings',
                  onTap: _showAlarmSettings,
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

  Widget _settingsCard(
    IconData icon,
    String title, {
    String? trailing,
    VoidCallback? onTap,
  }) {
    final backgroundColor = Theme.of(context).primaryColor;
    final cardColor = backgroundColor.withOpacity(0.7);
    final textColor = Colors.white;

    return Card(
      color: cardColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 4,
      margin: const EdgeInsets.symmetric(vertical: 7),
      child: Stack(
        children: [
          ListTile(
            leading: Icon(icon, color: textColor),
            title: Text(
              title,
              style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
            ),
            trailing:
                (trailing != null
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
                onTap ??
                () {
                  if (title == 'About') {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => const AboutScreen(),
                      ),
                    );
                  }
                },
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
