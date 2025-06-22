import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/subjects/presentation4/trueorfalse.dart';
import 'screens/image_quiz_screen.dart';

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
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
        textTheme: const TextTheme(
          headlineMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => MyHomePage(title: 'books8'),
        '/login': (context) => const LoginScreen(),
        '/settings': (context) => const SettingsScreen(),
        '/profile': (context) => ProfileScreen(),
        '/true-false-quiz': (context) => FruitQuizScreen(),
        '/image-quiz': (context) => const ImageQuizScreen(),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}
