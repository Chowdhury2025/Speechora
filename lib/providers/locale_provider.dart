import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleProvider extends ChangeNotifier {
  Locale _locale = const Locale('en');
  
  Locale get locale => _locale;

  LocaleProvider() {
    _loadLocale();
  }

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final languageName = prefs.getString('selectedLanguage') ?? 'English';
    final languageCode = _languageNameToCode(languageName);
    _locale = Locale(languageCode);
    notifyListeners();
  }

  Future<void> setLocale(String languageName) async {
    final languageCode = _languageNameToCode(languageName);
    _locale = Locale(languageCode);
    
    // Save to SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selectedLanguage', languageName);
    
    notifyListeners();
  }

  String _languageNameToCode(String languageName) {
    final Map<String, String> languageMap = {
      'English': 'en',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Hindi': 'hi',
      'Chinese': 'zh',
      'Arabic': 'ar',
      'Bengali': 'bn',
      'Portuguese': 'pt',
      'Russian': 'ru',
    };
    return languageMap[languageName] ?? 'en';
  }
}
