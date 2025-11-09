import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class TranslationService extends ChangeNotifier {
  static final TranslationService _instance = TranslationService._internal();
  factory TranslationService() => _instance;
  TranslationService._internal();

  String _currentLanguage = 'English';
  final Map<String, Map<String, String>> _translationCache = {};

  // UI strings that will be translated
  final Map<String, String> _uiStrings = {
    // Settings screen
    'settings_title': 'Settings',
    'language': 'Language',
    'select_language': 'Select Language',
    'voice_accent': 'Voice Accent',
    'select_voice_accent': 'Select Voice Accent',
    'test_tts': 'Test TTS',
    'translate_before_speaking': 'Translate before speaking',
    'translate_before_speaking_subtitle': 'Automatically translate English content to the selected language before TTS',
    'fix_tts': 'Fix TTS',
    'fix_tts_subtitle': 'Check installed TTS languages and open installer if missing',
    'alarm_usage_settings': 'Alarm & Usage Settings',
    'alarm_usage_settings_subtitle': '',
    'categories': 'Categories',
    'favorites': 'Favorites',
    'file_locations': 'File Locations',
    'display': 'Display',
    'display_trailing': 'two columns',
    'notifications': 'Notifications',
    'set_as_default_launcher': 'Set as Default Launcher',
    'make_default_launcher': 'Make speechora your default home screen app',
    'copyright': 'Copyright',
    'privacy': 'Privacy',
    'rate_us': 'Rate Us',
    'more_apps': 'More Apps',
    'about': 'About',
    'logout': 'Logout',
    'account': 'Account',
    'tts_voice_installed': 'TTS voice for {language} appears installed.',
    'could_not_open_tts_installer': 'Could not open TTS installer: {error}',
    'error_checking_tts': 'Error checking TTS languages: {error}',
    'device_may_not_have_voice': 'Device may not have a "{language}" voice installed; speech may fallback.\nYou can install language packs in system TTS settings or use cloud TTS for better quality.',
    'select_speechora_as_default': 'Please select speechora as your default home app',
    'could_not_open_home_settings': 'Could not open home settings',

    // Login screen
    'welcome_back': 'Welcome Back!',
    'ready_to_learn': 'Ready to continue your learning adventure?',
    'email': 'Email',
    'password': 'Password',
    'login': 'Login',
    'dont_have_account': "Don't have an account? Register",
    'forgot_password': 'Forgot Password?',
    'lets_learn': "Let's Learn!",

    // Home screen
    'home': 'Home',
    'explore': 'Explore',
    'search': 'Search',
    'user': 'User',

    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'ok': 'OK',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
  };

  String get currentLanguage => _currentLanguage;

  /// Initialize translation service with the saved language preference.
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final savedLang = prefs.getString('selectedLanguage');
    if (savedLang != null && savedLang != 'English') {
      _currentLanguage = savedLang;
      notifyListeners();
    }
  }

  /// Change the app language and notify all listeners.
  Future<void> changeLanguage(String language) async {
    if (_currentLanguage != language) {
      _currentLanguage = language;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('selectedLanguage', language);
      notifyListeners();
    }
  }

  /// Get a translated UI string. If English or translation not found, return original.
  String getTranslatedString(String key) {
    final original = _uiStrings[key] ?? key;

    if (_currentLanguage == 'English') {
      return original;
    }

    // Check cache first
    if (_translationCache.containsKey(_currentLanguage) &&
        _translationCache[_currentLanguage]!.containsKey(key)) {
      return _translationCache[_currentLanguage]![key] ?? original;
    }

    return original;
  }

  /// Translate a custom text to the current language (useful for dynamic content).
  /// Returns the original text if translation fails or language is English.
  Future<String> translateText(String text) async {
    if (_currentLanguage == 'English' || text.isEmpty) {
      return text;
    }

    try {
      final targetCode = _getLanguageCode(_currentLanguage);
      final uri = Uri.parse('https://libretranslate.de/translate');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'q': text,
          'source': 'en',
          'target': targetCode,
          'format': 'text'
        }),
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final translated = data['translatedText'] as String? ?? text;
        return translated;
      }
    } catch (e) {
      // ignore translation errors
    }
    return text;
  }

  /// Bulk-translate UI strings to the current language and cache them.
  /// Call this after changing language to pre-populate cache.
  Future<void> preloadTranslations() async {
    if (_currentLanguage == 'English') {
      return;
    }

    if (_translationCache.containsKey(_currentLanguage)) {
      return; // Already cached
    }

    try {
      final targetCode = _getLanguageCode(_currentLanguage);
      final keysToTranslate = _uiStrings.keys.toList();

      // Translate all strings in one batch request
      final textsToTranslate = keysToTranslate.map((k) => _uiStrings[k]!).toList();
      final uri = Uri.parse('https://libretranslate.de/translate');

      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'q': textsToTranslate,
          'source': 'en',
          'target': targetCode,
          'format': 'text'
        }),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final translatedList = (data['translatedText'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ?? [];

        final langCache = <String, String>{};
        for (int i = 0; i < keysToTranslate.length && i < translatedList.length; i++) {
          langCache[keysToTranslate[i]] = translatedList[i];
        }

        _translationCache[_currentLanguage] = langCache;
      }
    } catch (e) {
      // ignore preload errors
    }
  }

  /// Get the language code for a display language name.
  String _getLanguageCode(String language) {
    const langCodes = {
      'English': 'en',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Hindi': 'hi',
      'Chinese': 'zh',
      'Arabic': 'ar',
      'Bangla': 'bn',
      'Portuguese': 'pt',
      'Russian': 'ru',
    };
    return langCodes[language] ?? 'en';
  }
}
