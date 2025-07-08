import 'package:book8/screens/settings_screen.dart';
import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/auth_premium/login_screen.dart';
import 'screens/staticscreens/profile_screen.dart';
import 'screens/subjects/presentation4/trueorfalse.dart';
import 'screens/staticscreens/splash_screen.dart';
import 'widgets/premium_access_wrapper.dart';

// Duolingo-like colors
class AppColors {
  static const Color primary = Color(0xFF58CC02); // Main green color
  static const Color secondary = Color(0xFF1CB0F6); // Blue color
  static const Color background = Color(0xFFFFFDFD); // Off-white background
  static const Color text = Color(0xFF4B4B4B); // Dark gray text
  static const Color error = Color(0xFFFF4B4B); // Red for errors
}

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kids Learning App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.secondary,
          background: AppColors.background,
          error: AppColors.error,
          onBackground: AppColors.text,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Nunito',
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w900,
            color: AppColors.text,
          ),
          displayMedium: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: AppColors.text,
          ),
          displaySmall: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: AppColors.text,
          ),
          headlineMedium: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.text,
          ),
          bodyLarge: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.text,
          ),
          bodyMedium: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.text,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            textStyle: const TextStyle(
              fontFamily: 'Nunito',
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
      home: const SplashScreen(),
      routes: {
        // Unprotected routes (always accessible)
        '/login': (context) => const LoginScreen(),
        '/settings': (context) => const SettingsScreen(),
        '/profile': (context) => ProfileScreen(),

        // Protected routes (require premium or trial access)
        '/home':
            (context) => PremiumAccessWrapper(
              child: MyHomePage(title: getUserDisplayName()),
            ),
        '/TrueOrFalse': (context) => PremiumAccessWrapper(child: TrueOrFalse()),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}

String getUserDisplayName() {
  // Replace this the actual user auth logic

  return 'User'; // Placeholder, replace with real user name
}
