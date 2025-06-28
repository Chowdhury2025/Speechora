import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import './about_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => SettingsScreenState();
}

class SettingsScreenState extends State<SettingsScreen> {
  static String selectedLanguage = 'English';
  static String selectedVoiceAccent = 'American';

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

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final lang = prefs.getString('selectedLanguage');
    final accent = prefs.getString('selectedVoiceAccent');
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
  }

  Future<void> _savePreferences() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selectedLanguage', selectedLanguage);
    await prefs.setString('selectedVoiceAccent', selectedVoiceAccent);
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
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Go Premium Banner
          Container(
            margin: const EdgeInsets.only(bottom: 20),
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: BoxDecoration(
              color: Colors.amber[700],
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 8)],
            ),
            alignment: Alignment.center,
            child: const Text(
              'GO PREMIUM NOW',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: 1.2,
              ),
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
          _settingsCard(Icons.folder, 'Change File Locations'),
          _settingsCard(Icons.view_column, 'Display', trailing: 'two columns'),
          _settingsCard(Icons.notifications, 'Notifications'),
          _settingsCard(Icons.delete, 'Clear Downloads'),
          _settingsCard(Icons.cleaning_services, 'Clear Cache'),
          const SizedBox(height: 10),
          _settingsCard(Icons.copyright, 'Copyright Information'),
          _settingsCard(Icons.privacy_tip, 'Privacy Policy'),
          _settingsCard(Icons.star_rate, 'Rate Us'),
          _settingsCard(Icons.apps, 'More Apps'),
          _settingsCard(Icons.info, 'About'),
        ],
      ),
    );
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
    return Card(
      color: cardColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 4,
      margin: const EdgeInsets.symmetric(vertical: 7),
      child: ListTile(
        leading: Icon(icon, color: textColor),
        title: Text(
          title,
          style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
        ),
        trailing:
            trailing != null
                ? Text(
                  trailing,
                  style: TextStyle(color: textColor.withOpacity(0.7)),
                )
                : const Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.white54,
                  size: 18,
                ),
        onTap:
            onTap ??
            () {
              if (title == 'About') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const AboutScreen()),
                );
              }
            },
      ),
    );
  }
}
