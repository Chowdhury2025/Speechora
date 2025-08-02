import 'package:book8/screens/settings_screen.dart';
import 'package:book8/screens/subjects/presentation5/presentation5.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'subjects/presentation1/reusable_image_grid_screen.dart';
import 'subjects/presentation2/lesson_base_subject_screen.dart';

import 'subjects/presentation3/presentation3_list.dart';
import 'subjects/presentation4/trueorfalse.dart';
import 'subjects/presentation5/learning_games_screen.dart';
import 'subjects/presentation6/how_questions_screen.dart';
import 'others_screen.dart';

import 'subjects/presentation6/video_categories_screen.dart';

class SubjectCard {
  final String title;
  final IconData icon;
  final Color color;

  SubjectCard({required this.title, required this.icon, required this.color});
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
  final List<SubjectCard> subjects = [
    SubjectCard(
      title: 'Daily Routine', // 1
      icon: Icons.home_outlined,
      color: Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Home', // 2
      icon: Icons.house,
      color: Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'School', // 3
      icon: Icons.school,
      color: Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'Therapy', // 4
      icon: Icons.healing,
      color: Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'Activities', // 5
      icon: Icons.sports_basketball,
      color: Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Family & Friends', // 6
      icon: Icons.people,
      color: Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'Toys & Games', // 7
      icon: Icons.toys,
      color: Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'Food & Drink', // 8
      icon: Icons.restaurant,
      color: Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'Places', // 9
      icon: Icons.place,
      color: Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Action Verbs', // 10
      icon: Icons.directions_run,
      color: Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'I Want / Needs', // 11
      icon: Icons.favorite,
      color: Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'What Questions', // 12
      icon: Icons.help_outline,
      color: Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'Where Questions', // 13
      icon: Icons.map,
      color: Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Who Questions', // 14
      icon: Icons.person_search,
      color: Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'Why Questions', // 15
      icon: Icons.psychology,
      color: Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'How Questions', // 16
      icon: Icons.lightbulb_outline,
      color: Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Question Starters', // 17
      icon: Icons.question_answer,
      color: Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'When Questions', // 18
      icon: Icons.access_time,
      color: Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'Choice Questions', // 19
      icon: Icons.rule,
      color: Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'Basic Responses', // 20
      icon: Icons.more_horiz,
      color: Color(0xFF1CB0F6),
    ),
    // SubjectCard(
    //   title: 'yes or no ', // 21
    //   icon: Icons.check_circle_outline,
    //   color: Color(0xFF58CC02),
    // ),
    SubjectCard(
      title: 'Find the Item', // 21
      icon: Icons.check_circle_outline,
      color: Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'Video Learning', // 22
      icon: Icons.video_library,
      color: Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Games', // 23
      icon: Icons.games,
      color: Color(0xFF58CC02),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadUserName();
  }

  Future<void> _loadUserName() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userName = prefs.getString('userName') ?? '';
      userEmail = prefs.getString('userEmail') ?? '';
    });
  }

  void _navigateToScreen(BuildContext context, String title, Color color) {
    if (title == 'Video Learning') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => VideoCategoriesScreen(backgroundColor: color),
        ),
      );
      return;
    }

    Widget screen;
    switch (title) {
      case 'Daily Routine':
        screen = const ReusableImageGridScreen(
          title: 'Daily Routine',
          imageCategory: 'my_world_daily_life',
          backgroundColor: Color(0xFF1CB0F6),
        );
        break;
      case 'Home':
        screen = const ReusableImageGridScreen(
          title: 'Home',
          imageCategory: 'home',
          backgroundColor: Color(0xFFFF4B4B),
        );
        break;
      case 'School':
        screen = const ReusableImageGridScreen(
          title: 'School',
          imageCategory: 'school',
          backgroundColor: Color(0xFFFFC800),
        );
        break;
      case 'Therapy':
        screen = const ReusableImageGridScreen(
          title: 'Therapy',
          imageCategory: 'therapy',
          backgroundColor: Color(0xFF58CC02),
        );
        break;
      case 'Activities':
        screen = const ReusableImageGridScreen(
          title: 'Activities',
          imageCategory: 'activities',
          backgroundColor: Color(0xFF1CB0F6),
        );
        break;
      case 'Family & Friends':
        screen = const ReusableImageGridScreen(
          title: 'Family & Friends',
          imageCategory: 'family_friends',
          backgroundColor: Color(0xFFFF4B4B),
        );
        break;
      case 'Toys & Games':
        screen = const ReusableImageGridScreen(
          title: 'Toys & Games',
          imageCategory: 'toys_games',
          backgroundColor: Color(0xFFFFC800),
        );
        break;
      case 'Food & Drink':
        screen = const ReusableImageGridScreen(
          title: 'Food & Drink',
          imageCategory: 'food_drink',
          backgroundColor: Color(0xFF58CC02),
        );
        break;
      case 'Places':
        screen = const ReusableImageGridScreen(
          title: 'Places',
          imageCategory: 'places',
          backgroundColor: Color(0xFF1CB0F6),
        );
        break;
      case 'I Want / Needs':
        screen = PresentationTwo(
          title: 'I Want / Needs',
          backgroundColor: color,
          subject: 'wants_and_needs_expression',
        );
        break;
      case 'Actions / Verbs':
        screen = PresentationTwo(
          title: 'Actions / Verbs',
          backgroundColor: color,
          subject: 'action_words_and_verbs',
        );
        break;
      case 'What Questions':
        screen = PresentationTwo(
          title: 'What Questions',
          backgroundColor: color,
          subject: 'what_questions',
        );
        break;
      case 'Action Verbs':
        screen = PresentationTwo(
          title: 'Action Verbs',
          backgroundColor: color,
          subject: 'what_questions',
        );
        break;
      case 'Where Questions':
        screen = PresentationTwo(
          title: 'Where Questions',
          backgroundColor: color,
          subject: 'where_questions',
        );
        break;
      case 'Who Questions':
        screen = PresentationTwo(
          title: 'Who Questions',
          backgroundColor: color,
          subject: 'who_questions',
        );
        break;
      case 'When Questions':
        screen = const Presentation3List(subject: 'when_questions');
        break;
      case 'Why Questions':
        screen = PresentationTwo(
          title: 'Why Questions',
          backgroundColor: color,
          subject: 'why_questions',
        );
        break;
      case 'Select the Item':
        screen = TrueOrFalse(backgroundColor: color, title: 'Select the Item');
        break;
      case 'Find the Item':
        screen = const presentation5();
        break;
      case 'Choice Questions':
        screen = const Presentation3List(subject: 'choice_questions');
        break;
      case 'How Questions':
        screen = VideoCategoriesScreen(backgroundColor: color);
        break;
      case 'Learning Games':
        screen = LearningGamesScreen(backgroundColor: color);
        break;
      case 'Basic Responses':
        screen = OthersScreen(backgroundColor: color);
        break;

      case 'Video Learning':
        screen = VideoCategoriesScreen(backgroundColor: color);
        break;

      case 'Games':
        screen = const LearningGamesScreen(backgroundColor: Color(0xFF58CC02));
        break;
      default:
        return;
    }

    Navigator.push(context, MaterialPageRoute(builder: (context) => screen));
  }

  @override
  Widget build(BuildContext context) {
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
                              : (userEmail.isNotEmpty ? userEmail : 'book8'),
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
                        const Text(
                          'Welcome back!',
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.settings,
                      color: Colors.white,
                      size: 28,
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const SettingsScreen(),
                        ),
                      );
                    },
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
