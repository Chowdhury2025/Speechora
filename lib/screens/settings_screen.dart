import 'package:speachora/screens/staticscreens/about_screen.dart';
import 'package:speachora/screens/staticscreens/copyright_screen.dart';
import 'package:speachora/services/tts_service.dart';
import 'package:speachora/widgets/alarm_settings.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:speachora/l10n/app_localizations.dart';
import 'package:speachora/providers/locale_provider.dart';
import 'package:url_launcher/url_launcher.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => SettingsScreenState();
}

class SettingsScreenState extends State<SettingsScreen> {
  static String selectedLanguage = 'English';
  static String selectedVoiceAccent = 'American';
  static double speechRate = 0.5;
  bool translateBeforeSpeaking = true;

  String userName = '';
  String userEmail = '';
  // Premium/trial logic is now handled only in PremiumAccessWrapper
  bool isDefaultLauncher = false;

  final List<String> languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Hindi',
    'Chinese',
    'Arabic',
    'Bangla',
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
    final rate = prefs.getDouble('speechRate');
    final defaultLauncher = prefs.getBool('isDefaultLauncher');
    final defaultLauncherFlutter = prefs.getBool('flutter.isDefaultLauncher');
    final translatePref = prefs.getBool('translateBeforeSpeak');

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
    if (rate != null) {
      setState(() {
        speechRate = rate;
        SettingsScreenState.speechRate = rate;
      });
    }
    if (translatePref != null) {
      setState(() {
        translateBeforeSpeaking = translatePref;
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
    await prefs.setDouble('speechRate', speechRate);
    await prefs.setBool('isDefaultLauncher', isDefaultLauncher);
    await prefs.setBool('translateBeforeSpeak', translateBeforeSpeaking);
    // Also write the flutter-prefixed key so the native Android code can read it directly
    await prefs.setBool('flutter.isDefaultLauncher', isDefaultLauncher);
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userName = prefs.getString('userName') ?? '';
      userEmail = prefs.getString('userEmail') ?? '';
    });
  }

  Future<void> _loadSettingsAccess() async {
    // No premium access needed
  }

  String _buildAccountStatusDescription() {
    // Premium/trial status is now handled in PremiumAccessWrapper
    return 'Account';
  }

  Future<void> _initializeTTS() async {
    await _ttsService.init();
  }

  Color _getAccountStatusColor() {
    return Colors.white70;
  }

  @override
  void dispose() {
    _ttsService.stop();
    super.dispose();
  }

  Future<void> _fixTTS() async {
    try {
      final avail = await _ttsService.getAvailableLanguages();
      final locale = _ttsService.getLocaleForLanguage(selectedLanguage);
      final langCode = locale.split('-').first.toLowerCase();
      final found = avail.any((l) => l.toLowerCase().contains(langCode));

      if (found) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('TTS voice for $selectedLanguage appears installed.')),
          );
        }
        return;
      }

      // Open native installer for TTS data on Android
      const channel = MethodChannel('com.speechora/tts');
      try {
        await channel.invokeMethod('installTtsData');
      } on PlatformException catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not open TTS installer: ${e.message}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error checking TTS languages: $e')),
        );
      }
    }
  }

  void _showLanguageDialog() {
    final l10n = AppLocalizations.of(context);
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text(l10n.selectLanguage),
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
                              // Trigger locale change through provider
                              context.read<LocaleProvider>().setLocale(lang);
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
    final l10n = AppLocalizations.of(context);
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text(l10n.selectVoiceAccent),
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
    // Apply selected accent and language then speak a short test phrase.
    await _ttsService.setAccent(selectedVoiceAccent);
    await _ttsService.setLanguageByName(selectedLanguage);

    final testText = selectedLanguage == 'English'
        ? 'Hello! This is a test of the $selectedVoiceAccent voice accent.'
        : 'Hello! This text will be translated and spoken in $selectedLanguage.';

    await _ttsService.speak(testText);
    // Check whether device reports the selected locale and notify user if missing
    try {
      final locale = _ttsService.getLocaleForLanguage(selectedLanguage);
      final avail = await _ttsService.getAvailableLanguages();
      final langCode = locale.split('-').first.toLowerCase();
      final found = avail.any((l) => l.toLowerCase().contains(langCode));
      if (!found && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Device may not have a "$selectedLanguage" voice installed; speech may fallback.\nYou can install language packs in system TTS settings or use cloud TTS for better quality.',
            ),
            duration: const Duration(seconds: 6),
          ),
        );
      }
    } catch (_) {}
  }

  void _showAlarmSettings() {
    final l10n = AppLocalizations.of(context);
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
                          Text(
                            l10n.alarmSettings,
                            style: const TextStyle(
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
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: Text(
          l10n.settings,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
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
                  l10n.language,
                  trailing: selectedLanguage,
                  onTap: _showLanguageDialog,
                ),
                _settingsCard(
                  Icons.record_voice_over,
                  l10n.voiceAccent,
                  trailing: selectedVoiceAccent,
                  onTap: _showAccentDialog,
                ),
                _settingsCard(Icons.volume_up, l10n.testTTS, onTap: _testTTS),

                // Translate before speaking toggle
                Card(
                  color: Theme.of(context).primaryColor.withOpacity(0.7),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 4,
                  margin: const EdgeInsets.symmetric(vertical: 7),
                  child: SwitchListTile(
                    title: Text(
                      l10n.translateBeforeSpeaking,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      l10n.translateBeforeSpeakingDesc,
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    value: translateBeforeSpeaking,
                    activeColor: Colors.green,
                    onChanged: (value) async {
                      setState(() => translateBeforeSpeaking = value);
                      await _savePreferences();
                    },
                    secondary: const Icon(Icons.translate, color: Colors.white),
                  ),
                ),
                // Fix TTS button - checks available languages and opens installer if missing
                Card(
                  color: Theme.of(context).primaryColor.withOpacity(0.7),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 4,
                  margin: const EdgeInsets.symmetric(vertical: 7),
                  child: ListTile(
                    leading: const Icon(Icons.build, color: Colors.white),
                    title: Text(
                      l10n.fixTTS,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(
                      l10n.fixTTSDesc,
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    onTap: _fixTTS,
                  ),
                ),
                _settingsCard(
                  Icons.alarm,
                  l10n.alarmSettings,
                  onTap: _showAlarmSettings,
                ),
                _settingsCard(Icons.category, l10n.categories),
                _settingsCard(Icons.favorite, l10n.favorites),
                _settingsCard(Icons.folder, l10n.fileLocations),
                _settingsCard(
                  Icons.view_column,
                  l10n.display,
                  trailing: 'two columns',
                ),
                _settingsCard(Icons.notifications, l10n.notifications),

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
                    title: Text(
                      l10n.setAsDefaultLauncher,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      l10n.setAsDefaultLauncherDesc,
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
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
                _settingsCard(Icons.copyright, l10n.copyright),
                _settingsCard(Icons.privacy_tip, l10n.privacy),
                _settingsCard(Icons.star_rate, l10n.rateUs),
                _settingsCard(Icons.apps, l10n.moreApps),
                _settingsCard(Icons.info, l10n.about),
                const SizedBox(height: 30),
                // Logout button
                ElevatedButton.icon(
                  onPressed: _logout,
                  icon: const Icon(Icons.logout),
                  label: Text(l10n.logout),
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
    final l10n = AppLocalizations.of(context);

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
            onTap: onTap ?? () {
              if (title == l10n.about) {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const AboutScreen(),
                  ),
                );
              } else if (title == l10n.categories) {
                Navigator.of(context).pushNamed('/categories');
              } else if (title == l10n.favorites) {
                Navigator.of(context).pushNamed('/favorites');
              } else if (title == l10n.fileLocations) {
                _showFileLocationsDialog();
              } else if (title == l10n.display) {
                _showDisplaySettingsDialog();
              } else if (title == l10n.notifications) {
                _showNotificationsDialog();
              } else if (title == l10n.privacy) {
                _launchPrivacyPolicy();
              } else if (title == l10n.copyright) {
                _showCopyrightInfo();
              } else if (title == l10n.rateUs) {
                _launchAppStore();
              } else if (title == l10n.moreApps) {
                _launchDeveloperPage();
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
 
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  void _setDefaultLauncher() async {
    if (isDefaultLauncher) {
      // Use a platform channel to open the Android home settings screen
      const channel = MethodChannel('com.speechora/app');
      try {
        await channel.invokeMethod('openHomeSettings');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please select Speechora as your default home app'),
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

  void _showFileLocationsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context).fileLocations),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _locationItem(
                Icons.folder_special,
                'App Data',
                '/data/user/0/com.speechora/app_flutter',
              ),
              _locationItem(
                Icons.folder,
                'Downloads',
                '/storage/emulated/0/Download/Speechora',
              ),
              _locationItem(
                Icons.image,
                'Images',
                '/storage/emulated/0/Pictures/Speechora',
              ),
              _locationItem(
                Icons.movie,
                'Videos',
                '/storage/emulated/0/Movies/Speechora',
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(AppLocalizations.of(context).close),
          ),
        ],
      ),
    );
  }

  Widget _locationItem(IconData icon, String title, String path) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  path,
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showDisplaySettingsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context).display),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Grid Columns'),
              subtitle: const Text('Number of columns in grid views'),
              trailing: DropdownButton<int>(
                value: 2,
                items: [1, 2, 3, 4].map((int value) {
                  return DropdownMenuItem<int>(
                    value: value,
                    child: Text('$value'),
                  );
                }).toList(),
                onChanged: (int? value) {
                  // TODO: Implement column count change
                  Navigator.pop(context);
                },
              ),
            ),
            SwitchListTile(
              title: const Text('Dark Mode'),
              value: Theme.of(context).brightness == Brightness.dark,
              onChanged: (bool value) {
                // TODO: Implement theme change
                Navigator.pop(context);
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(AppLocalizations.of(context).close),
          ),
        ],
      ),
    );
  }

  void _showNotificationsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context).notifications),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SwitchListTile(
              title: const Text('Daily Reminders'),
              value: true,
              onChanged: (bool value) {
                // TODO: Implement notification settings
              },
            ),
            SwitchListTile(
              title: const Text('Study Updates'),
              value: true,
              onChanged: (bool value) {
                // TODO: Implement notification settings
              },
            ),
            SwitchListTile(
              title: const Text('New Content'),
              value: true,
              onChanged: (bool value) {
                // TODO: Implement notification settings
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(AppLocalizations.of(context).close),
          ),
        ],
      ),
    );
  }

  void _launchPrivacyPolicy() {
    Navigator.pushNamed(context, '/privacy-policy');
  }

  void _showCopyrightInfo() {
    Navigator.push(
      context, 
      MaterialPageRoute(builder: (context) => const CopyrightScreen()),
    );
  }

  void _launchAppStore() async {
    const appId = 'com.speechora.app';
    try {
      // For Android
      final url = Uri.parse('market://details?id=$appId');
      final fallbackUrl = Uri.parse('https://play.google.com/store/apps/details?id=$appId');
      
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else if (await canLaunchUrl(fallbackUrl)) {
        await launchUrl(fallbackUrl);
      } else {
        throw 'Could not launch store';
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open app store')),
        );
      }
    }
  }

  void _launchDeveloperPage() async {
    const devId = 'Speechora+Developer';
    try {
      // For Android
      final url = Uri.parse('market://developer?id=$devId');
      final fallbackUrl = Uri.parse('https://play.google.com/store/apps/developer?id=$devId');
      
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else if (await canLaunchUrl(fallbackUrl)) {
        await launchUrl(fallbackUrl);
      } else {
        throw 'Could not launch developer page';
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open developer page')),
        );
      }
    }
  }
}
