import 'package:book8/screens/settings_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'subjects/presentation1/reusable_image_grid_screen.dart';
import 'subjects/presentation2/lesson_base_subject_screen.dart';
import 'subjects/presentation3/image_quiz_screen.dart';
import 'subjects/presentation5/image_quiz_screen.dart';
import 'subjects/presentation6/how_questions_screen.dart';
import 'others_screen.dart';
import 'subjects/presentation4/trueorfalse.dart';
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
      title: 'Image Quiz Game',
      icon: Icons.image_search,
      color: const Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'My World & Daily Life',
      icon: Icons.home_outlined,
      color: const Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Home',
      icon: Icons.house,
      color: const Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'School',
      icon: Icons.school,
      color: const Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'Therapy',
      icon: Icons.healing,
      color: const Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'Activities',
      icon: Icons.sports_basketball,
      color: const Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Family & Friends',
      icon: Icons.people,
      color: const Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'Toys & Games',
      icon: Icons.toys,
      color: const Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'Food & Drink',
      icon: Icons.restaurant,
      color: const Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'Places',
      icon: Icons.place,
      color: const Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'I Want / Needs',
      icon: Icons.favorite,
      color: const Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'Actions / Verbs',
      icon: Icons.directions_run,
      color: const Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'What Questions',
      icon: Icons.help_outline,
      color: const Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'Where Questions',
      icon: Icons.map,
      color: const Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Who Questions',
      icon: Icons.person_search,
      color: const Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'When Questions',
      icon: Icons.access_time,
      color: const Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'Why Questions',
      icon: Icons.psychology,
      color: const Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'How Questions',
      icon: Icons.lightbulb_outline,
      color: const Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'Choice Questions',
      icon: Icons.rule,
      color: const Color(0xFFFF4B4B),
    ),
    SubjectCard(
      title: 'Question Starters',
      icon: Icons.question_answer,
      color: const Color(0xFFFFC800),
    ),
    SubjectCard(
      title: 'Yes or No quiz',
      icon: Icons.quiz,
      color: const Color(0xFF58CC02),
    ),
    SubjectCard(
      title: 'Others',
      icon: Icons.more_horiz,
      color: const Color(0xFF1CB0F6),
    ),
    SubjectCard(
      title: 'How To',
      icon: Icons.video_library,
      color: const Color(0xFF1CB0F6),
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
    if (title == 'How To') {
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
      case 'My World & Daily Life':
        screen = const ReusableImageGridScreen(
          title: 'My World & Daily Life',
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
          imageCategory: 'family_and_friends',
          backgroundColor: Color(0xFFFF4B4B),
        );
        break;
      case 'Toys & Games':
        screen = const ReusableImageGridScreen(
          title: 'Toys & Games',
          imageCategory: 'toys_and_games',
          backgroundColor: Color(0xFFFFC800),
        );
        break;
      case 'Food & Drink':
        screen = const ReusableImageGridScreen(
          title: 'Food & Drink',
          imageCategory: 'food_and_drink',
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
        screen = PresentationTwo(
          title: 'When Questions',
          backgroundColor: color,
          subject: 'when_questions',
        );
        break;
      case 'Why Questions':
        screen = PresentationTwo(
          title: 'Why Questions',
          backgroundColor: color,
          subject: 'why_questions',
        );
        break;
      case 'Image Quiz Game':
        screen = PresentationTwo(
          title: 'Lessons',
          backgroundColor: color,
          subject: 'presentation3_lessons',
        );
        break;
      case 'How Questions':
        screen = LessonScreen(backgroundColor: color);
        break;
      case 'Yes or No quiz':
        screen = TrueOrFalse();
        break;
      case 'Others':
        screen = OthersScreen(backgroundColor: color);
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
