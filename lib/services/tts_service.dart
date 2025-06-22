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
    await _flutterTts.speak(text);
  }

  Future<void> stop() async {
    await _flutterTts.stop();
  }
}
