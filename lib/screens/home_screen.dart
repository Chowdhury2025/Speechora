import 'package:speachora/screens/settings_screen.dart';
import 'package:speachora/screens/subjects/presentation5/presentation5.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:speachora/l10n/app_localizations.dart';
import 'subjects/presentation1/optimized_image_grid_screen.dart';
import 'subjects/presentation2/presentation2_screen.dart';

import 'subjects/presentation3/presentation3_list.dart';
import 'subjects/presentation4/BasicResponses.dart';
import 'subjects/presentation5/learning_games_screen.dart';

import 'subjects/presentation6/video_categories_screen.dart';

class SubjectCard {
  final String title;
  final IconData icon;
  final Color color;
  final String id; // Add unique identifier for navigation

  SubjectCard({
    required this.title, 
    required this.icon, 
    required this.color,
    required this.id,
  });
}

class MyHomePage extends StatefulWidget {
  final String title;
  MyHomePage({super.key, required this.title});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String userName = '';
  String userEmail = '';

  // Triple tap functionality for settings
  int _settingsTapCount = 0;
  DateTime? _lastSettingsTapTime;
  static const Duration _tapTimeout = Duration(seconds: 2);

  late List<SubjectCard> subjects;

  @override
  void initState() {
    super.initState();
    _loadUserName();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _buildSubjects();
  }

  void _buildSubjects() {
    final l = AppLocalizations.of(context);
    subjects = [
      SubjectCard(
        title: l.dailyRoutine,
        icon: Icons.home_outlined,
        color: Color(0xFF1CB0F6),
        id: 'daily_routine',
      ),
      SubjectCard(
        title: l.home,
        icon: Icons.house,
        color: Color(0xFFFF4B4B),
        id: 'home',
      ),
      SubjectCard(
        title: l.school,
        icon: Icons.school,
        color: Color(0xFFFFC800),
        id: 'school',
      ),
      SubjectCard(
        title: l.therapy,
        icon: Icons.healing,
        color: Color(0xFF58CC02),
        id: 'therapy',
      ),
      SubjectCard(
        title: l.activities,
        icon: Icons.sports_basketball,
        color: Color(0xFF1CB0F6),
        id: 'activities',
      ),
      SubjectCard(
        title: l.familyFriends,
        icon: Icons.people,
        color: Color(0xFFFF4B4B),
        id: 'family_friends',
      ),
      SubjectCard(
        title: l.toysGames,
        icon: Icons.toys,
        color: Color(0xFFFFC800),
        id: 'toys_games',
      ),
      SubjectCard(
        title: l.foodDrink,
        icon: Icons.restaurant,
        color: Color(0xFF58CC02),
        id: 'food_drink',
      ),
      SubjectCard(
        title: l.places,
        icon: Icons.place,
        color: Color(0xFF1CB0F6),
        id: 'places',
      ),
      SubjectCard(
        title: l.actionVerbs,
        icon: Icons.directions_run,
        color: Color(0xFFFFC800),
        id: 'action_verbs',
      ),
      SubjectCard(
        title: l.iWantNeeds,
        icon: Icons.favorite,
        color: Color(0xFFFF4B4B),
        id: 'i_want_needs',
      ),
      SubjectCard(
        title: l.whatQuestions,
        icon: Icons.help_outline,
        color: Color(0xFF58CC02),
        id: 'what_questions',
      ),
      SubjectCard(
        title: l.whereQuestions,
        icon: Icons.map,
        color: Color(0xFF1CB0F6),
        id: 'where_questions',
      ),
      SubjectCard(
        title: l.whoQuestions,
        icon: Icons.person_search,
        color: Color(0xFFFF4B4B),
        id: 'who_questions',
      ),
      SubjectCard(
        title: l.whyQuestions,
        icon: Icons.psychology,
        color: Color(0xFF58CC02),
        id: 'why_questions',
      ),
      SubjectCard(
        title: l.howQuestions,
        icon: Icons.lightbulb_outline,
        color: Color(0xFF1CB0F6),
        id: 'how_questions',
      ),
      SubjectCard(
        title: l.questionStarters,
        icon: Icons.question_answer,
        color: Color(0xFFFFC800),
        id: 'question_starters',
      ),
      SubjectCard(
        title: l.whenQuestions,
        icon: Icons.access_time,
        color: Color(0xFFFFC800),
        id: 'when_questions',
      ),
      SubjectCard(
        title: l.choiceQuestions,
        icon: Icons.rule,
        color: Color(0xFFFF4B4B),
        id: 'choice_questions',
      ),
      SubjectCard(
        title: l.basicResponses,
        icon: Icons.more_horiz,
        color: Color(0xFF1CB0F6),
        id: 'basic_responses',
      ),
      SubjectCard(
        title: l.findTheItem,
        icon: Icons.check_circle_outline,
        color: Color(0xFF58CC02),
        id: 'find_the_item',
      ),
      SubjectCard(
        title: l.videoLearning,
        icon: Icons.video_library,
        color: Color(0xFF1CB0F6),
        id: 'video_learning',
      ),
      SubjectCard(
        title: l.games,
        icon: Icons.games,
        color: Color(0xFF58CC02),
        id: 'games',
      ),
    ];
  }

  Future<void> _loadUserName() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userName = prefs.getString('userName') ?? '';
      userEmail = prefs.getString('userEmail') ?? '';
    });
  }

  // Triple tap settings handler
  void _onSettingsTap() {
    final now = DateTime.now();

    // Reset counter if too much time has passed since last tap
    if (_lastSettingsTapTime == null ||
        now.difference(_lastSettingsTapTime!) > _tapTimeout) {
      _settingsTapCount = 1;
    } else {
      _settingsTapCount++;
    }

    _lastSettingsTapTime = now;

    if (_settingsTapCount == 1) {
      // First tap - show instruction
      _showToast("Tap three times to open settings");
    } else if (_settingsTapCount == 2) {
      // Second tap - show progress
      _showToast("Tap one more time");
    } else if (_settingsTapCount >= 3) {
      // Third tap - open settings and reset
      _settingsTapCount = 0;
      _lastSettingsTapTime = null;
      _showToast("Opening settings...");

      // Small delay before opening settings for better UX
      Future.delayed(const Duration(milliseconds: 500), () {
        _openSettings();
      });
    }
  }

  void _showToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      timeInSecForIosWeb: 1,
      backgroundColor: Colors.black87,
      textColor: Colors.white,
      fontSize: 16.0,
    );
  }

  void _openSettings() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const SettingsScreen()),
    );
  }

  void _navigateToScreen(BuildContext context, String id, String title, Color color) {
    if (id == 'video_learning') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => VideoCategoriesScreen(backgroundColor: color),
        ),
      );
      return;
    }

    Widget screen;
    switch (id) {
      case 'daily_routine':
        screen = const OptimizedImageGridScreen(
          title: 'Daily Routine',
          imageCategory: 'my_world_daily_life',
          backgroundColor: Color(0xFF1CB0F6),
        );
        break;
      case 'home':
        screen = const OptimizedImageGridScreen(
          title: 'Home',
          imageCategory: 'home',
          backgroundColor: Color(0xFFFF4B4B),
        );
        break;
      case 'school':
        screen = const OptimizedImageGridScreen(
          title: 'School',
          imageCategory: 'school',
          backgroundColor: Color(0xFFFFC800),
        );
        break;
      case 'therapy':
        screen = const OptimizedImageGridScreen(
          title: 'Therapy',
          imageCategory: 'therapy',
          backgroundColor: Color(0xFF58CC02),
        );
        break;
      case 'activities':
        screen = const OptimizedImageGridScreen(
          title: 'Activities',
          imageCategory: 'activities',
          backgroundColor: Color(0xFF1CB0F6),
        );
        break;
      case 'family_friends':
        screen = const OptimizedImageGridScreen(
          title: 'Family & Friends',
          imageCategory: 'family_friends',
          backgroundColor: Color(0xFFFF4B4B),
        );
        break;
      case 'toys_games':
        screen = const OptimizedImageGridScreen(
          title: 'Toys & Games',
          imageCategory: 'toys_games',
          backgroundColor: Color(0xFFFFC800),
        );
        break;
      case 'food_drink':
        screen = const OptimizedImageGridScreen(
          title: 'Food & Drink',
          imageCategory: 'food_drink',
          backgroundColor: Color(0xFF58CC02),
        );
        break;
      case 'places':
        screen = const OptimizedImageGridScreen(
          title: 'Places',
          imageCategory: 'places',
          backgroundColor: Color(0xFF1CB0F6),
        );
        break;
      case 'i_want_needs':
        screen = Presentation2Screen(
          title: title, // Use localized title here
          backgroundColor: color,
          subject: 'wants_and_needs_expression',
        );
        break;
      case 'action_verbs':
        screen = Presentation2Screen(
          title: title, // Use localized title here
          backgroundColor: color,
          subject: 'action_words_and_verbs',
        );
        break;
      case 'what_questions':
        screen = Presentation2Screen(
          title: title, // Use localized title here
          backgroundColor: color,
          subject: 'what_questions',
        );
        break;
      case 'where_questions':
        screen = Presentation2Screen(
          title: title, // Use localized title here
          backgroundColor: color,
          subject: 'where_questions',
        );
        break;
      case 'who_questions':
        screen = Presentation2Screen(
          title: title, // Use localized title here
          backgroundColor: color,
          subject: 'who_questions',
        );
        break;
      case 'when_questions':
        screen = const Presentation3List(subject: 'When_Questions');
        break;
      case 'why_questions':
        screen = Presentation2Screen(
          title: title, // Use localized title here
          backgroundColor: color,
          subject: 'why_questions',
        );
        break;
      case 'find_the_item':
        screen = const presentation5();
        break;
      case 'choice_questions':
        screen = const Presentation3List(subject: 'Choice_Questions');
        break;
      case 'question_starters':
        screen = Presentation2Screen(
          title: title, // Use localized title here
          backgroundColor: color,
          subject: 'question_starters',
        );
        break;
      case 'how_questions':
        screen = VideoCategoriesScreen(backgroundColor: color);
        break;
      case 'basic_responses':
        screen = BasicResponses(
          backgroundColor: color,
          title: title, // Use localized title here
        );
        break;
      case 'video_learning':
        screen = VideoCategoriesScreen(backgroundColor: color);
        break;
      case 'games':
        screen = const LearningGamesScreen(backgroundColor: Color(0xFF58CC02));
        break;
      default:
        return;
    }

    Navigator.push(context, MaterialPageRoute(builder: (context) => screen));
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(90),
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF58CC02), Color(0xFF1CB0F6)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
            boxShadow: [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 12,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: Colors.white,
                    backgroundImage: AssetImage(
                      'assets/appIcon.png',
                    ), // Use your app icon or user image asset
                    onBackgroundImageError: (_, __) {},
                    child: Container(), // No icon, image only
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          userName.isNotEmpty
                              ? userName
                              : (userEmail.isNotEmpty ? userEmail : 'speechora'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 22,
                            letterSpacing: 0.5,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          l.welcomeBack,
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                  // Triple tap settings button
                  IconButton(
                    icon: const Icon(
                      Icons.settings,
                      color: Colors.white,
                      size: 28,
                    ),
                    onPressed: _onSettingsTap,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 8.0,
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16.0),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 20,
                crossAxisSpacing: 20,
                childAspectRatio: 1, // width:height ratio for perfect square
              ),
              itemCount: subjects.length,
              itemBuilder: (context, index) {
                final subject = subjects[index];
                return AspectRatio(
                  aspectRatio: 1,
                  child: Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap:
                          () => _navigateToScreen(
                            context,
                            subject.id,
                            subject.title,
                            subject.color,
                          ),
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: subject.color,
                          boxShadow: [
                            BoxShadow(
                              color: subject.color.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                subject.icon,
                                size: 28,
                                color: subject.color,
                              ),
                            ),
                            const SizedBox(height: 14),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8.0,
                              ),
                              child: Text(
                                subject.title,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    super.dispose();
  }
}
