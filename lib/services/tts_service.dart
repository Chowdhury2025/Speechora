import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
  Future<void> init() async {
    if (!_isInitialized) {
      final prefs = await SharedPreferences.getInstance();
      final accent = prefs.getString('voiceAccent') ?? 'American';
      await _flutterTts.setPitch(1.0);
      await _flutterTts.setSpeechRate(0.5);
      await setAccent(accent); // Set accent after other settings
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

  Future<void> speak(String text) async {
    await init();
    await _flutterTts.stop();
    // Remove symbols and punctuation from text
    final filteredText = text
        .replaceAll(RegExp(r'[\p{P}\p{S}]', unicode: true), '')
        .replaceAll(RegExp(r'\s+'), ' ');
    await _flutterTts.speak(filteredText.trim());
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
