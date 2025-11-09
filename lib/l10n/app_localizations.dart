import 'package:flutter/material.dart';

// Import generated localization messages
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_fr.dart';
import 'app_localizations_de.dart';
import 'app_localizations_hi.dart';
import 'app_localizations_zh.dart';
import 'app_localizations_ar.dart';
import 'app_localizations_bn.dart';
import 'app_localizations_pt.dart';
import 'app_localizations_ru.dart';

abstract class AppLocalizations {
  static late AppLocalizations _instance;

  // Settings screen strings
  String get settings;
  String get language;
  String get selectLanguage;
  String get voiceAccent;
  String get selectVoiceAccent;
  String get testTTS;
  String get translateBeforeSpeaking;
  String get translateBeforeSpeakingDesc;
  String get fixTTS;
  String get fixTTSDesc;
  String get alarmSettings;
  String get categories;
  String get favorites;
  String get fileLocations;
  String get display;
  String get notifications;
  String get setAsDefaultLauncher;
  String get setAsDefaultLauncherDesc;
  String get copyright;
  String get privacy;
  String get rateUs;
  String get moreApps;
  String get about;
  String get logout;

  // Common UI strings
  String get welcome;
  String get account;
  String get profile;
  String get close;
  String get ok;
  String get cancel;
  String get save;
  String get delete;
  String get edit;

  // Status messages
  String get ttsVoiceInstalled;
  String get couldNotOpenTtsInstaller;
  String get errorCheckingTts;
  String get ttsVoiceMayNotBeInstalled;
  String get installLanguagePacks;
  String get pleaseSelectDefault;
  String get couldNotOpenHomeSettings;

  // Login & Auth
  String get welcomeBack;
  String get login;
  String get signup;
  String get email;
  String get password;
  String get forgotPassword;

  // Home Screen - Subject Titles
  String get dailyRoutine;
  String get home;
  String get school;
  String get therapy;
  String get activities;
  String get familyFriends;
  String get toysGames;
  String get foodDrink;
  String get places;
  String get actionVerbs;
  String get iWantNeeds;
  String get whatQuestions;
  String get whereQuestions;
  String get whoQuestions;
  String get whyQuestions;
  String get howQuestions;
  String get questionStarters;
  String get whenQuestions;
  String get choiceQuestions;
  String get basicResponses;
  String get findTheItem;
  String get videoLearning;
  String get games;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ?? _instance;
  }

  static AppLocalizations get instance => _instance;

  static set instance(AppLocalizations value) {
    _instance = value;
  }

  static Future<AppLocalizations> load(Locale locale) {
    final String languageCode = locale.languageCode.toLowerCase();
    
    switch (languageCode) {
      case 'es':
        return Future.value(AppLocalizationsEs());
      case 'fr':
        return Future.value(AppLocalizationsFr());
      case 'de':
        return Future.value(AppLocalizationsDe());
      case 'hi':
        return Future.value(AppLocalizationsHi());
      case 'zh':
        return Future.value(AppLocalizationsZh());
      case 'ar':
        return Future.value(AppLocalizationsAr());
      case 'bn':
        return Future.value(AppLocalizationsBn());
      case 'pt':
        return Future.value(AppLocalizationsPt());
      case 'ru':
        return Future.value(AppLocalizationsRu());
      default:
        return Future.value(AppLocalizationsEn());
    }
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'es', 'fr', 'de', 'hi', 'zh', 'ar', 'bn', 'pt', 'ru']
        .contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) {
    return AppLocalizations.load(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
