import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class TTSService {
  static final TTSService _instance = TTSService._internal();
  factory TTSService() => _instance;
  TTSService._internal();

  final FlutterTts _flutterTts = FlutterTts();
  bool _isInitialized = false;

  // Map accent names to their corresponding language codes
  final Map<String, String> accentLanguages = {
    'American': 'en-US',
    'British': 'en-GB',
    'Australian': 'en-AU',
    'Indian': 'en-IN',
    'Irish': 'en-IE',
    'Scottish': 'en-GB-SCT',
    'Canadian': 'en-CA',
    'African': 'en-ZA',
  };

  // Map display language names to locale codes (target for TTS)
  final Map<String, String> languageLocales = {
    'English': 'en-US',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Hindi': 'hi-IN',
    'Chinese': 'zh-CN',
    'Arabic': 'ar-SA',
    'Bengali': 'bn-IN', // try bn-IN (India) or bn-BD depending on availability
    'Portuguese': 'pt-PT',
    'Russian': 'ru-RU',
  };
  Future<void> init() async {
    if (!_isInitialized) {
      final prefs = await SharedPreferences.getInstance();
      final accent = prefs.getString('selectedVoiceAccent') ?? 'American';
      final selectedLang = prefs.getString('selectedLanguage') ?? 'English';
      final rate = prefs.getDouble('speechRate') ?? 0.5;
      await _flutterTts.setPitch(1.0);
      await _flutterTts.setSpeechRate(rate);
      await setAccent(accent); // Set accent (language) after other settings
      await setLanguageByName(selectedLang);
      _isInitialized = true;
    }
  }

  Future<void> speakAndWait(String text) async {
    await init();
    await _flutterTts.stop();

    Completer<void> completer = Completer<void>();

    _flutterTts.setCompletionHandler(() {
      if (!completer.isCompleted) {
        completer.complete();
      }
    });

    await _flutterTts.speak(text);
    return completer.future;
  }

  Future<void> setAccent(String accent) async {
    final language = accentLanguages[accent] ?? 'en-US';
    // Stop any ongoing speech
    await stop();
    // Set the new language
    await _flutterTts.setLanguage(language);
    // Reset initialization to force applying new accent next time
    _isInitialized = false;
    // We don't save to SharedPreferences here as that's handled in the settings screen
  }

  /// Set language based on display name (e.g. 'Bengali' -> 'bn-IN').
  /// This changes the TTS language used for speaking.
  Future<void> setLanguageByName(String languageName) async {
    final locale = languageLocales[languageName] ?? 'en-US';
    await stop();
    try {
      await _flutterTts.setLanguage(locale);
    } catch (e) {
      // ignore and fallback
    }
    _isInitialized = false;
  }

  /// Return a list of available language codes from the platform TTS engine.
  Future<List<String>> getAvailableLanguages() async {
    try {
      final langs = await _flutterTts.getLanguages;
      return langs.map((e) => e.toString()).toList();
    } catch (e) {
      return <String>[];
    }
  }

  /// Return the locale code used for a given display language name.
  String getLocaleForLanguage(String languageName) {
    return languageLocales[languageName] ?? 'en-US';
  }

  /// Translate text to the target language using LibreTranslate (optional).
  /// Returns translated text on success, otherwise returns original text.
  Future<String> _translateIfNeeded(String text, String targetLocale) async {
    // targetLocale expected like 'bn-IN' -> extract 'bn'
    final target = targetLocale.split('-').first;
    try {
      final uri = Uri.parse('https://libretranslate.de/translate');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'q': text,
          'source': 'en',
          'target': target,
          'format': 'text'
        }),
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        return data['translatedText'] as String? ?? text;
      }
    } catch (e) {
      // ignore and return original text on any error
    }
    return text;
  }

  Future<void> speak(String text) async {
    await init();
    await _flutterTts.stop();
    // Remove symbols and punctuation from text
    var filteredText = text
        .replaceAll(RegExp(r'[\p{P}\p{S}]', unicode: true), '')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();

    // If user selected a non-English language and opted into translation,
    // attempt to translate first
    try {
      final prefs = await SharedPreferences.getInstance();
      final selectedLang = prefs.getString('selectedLanguage') ?? 'English';
      final translateBefore = prefs.getBool('translateBeforeSpeak') ?? true;
      final locale = languageLocales[selectedLang] ?? 'en-US';
      if (selectedLang != 'English' && translateBefore) {
        final translated = await _translateIfNeeded(filteredText, locale);
        filteredText = translated;
      }
    } catch (e) {
      // ignore
    }

    await _flutterTts.speak(filteredText);
  }

  Future<bool> isSpeaking() async {
    try {
      final speaking = await _flutterTts.getEngines;
      return speaking.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  Future<void> stop() async {
    await _flutterTts.stop();
  }

  void setStartHandler(VoidCallback handler) {
    _flutterTts.setStartHandler(handler);
  }

  void setCompletionHandler(VoidCallback handler) {
    _flutterTts.setCompletionHandler(handler);
  }
}
