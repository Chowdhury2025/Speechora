import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math';
import 'settings_screen.dart';
import 'subjects/presentation1/reusable_image_grid_screen.dart';
import 'subjects/presentation2/wants_and_needs_screen.dart';
import 'subjects/presentation2/what_questions_screen.dart';
import 'subjects/presentation2/where_questions_screen.dart';
import 'subjects/presentation2/who_questions_screen.dart';
import 'subjects/presentation2/when_questions_screen.dart';
import 'subjects/presentation6/how_questions_screen.dart';
import 'subjects/presentation6/others_screen.dart';
import 'subjects/presentation4/trueorfalse.dart';

class SubjectCard {
  final String title;
  final IconData icon;
  final Color color;

  SubjectCard({required this.title, required this.icon, required this.color});
}

class MyHomePage extends StatelessWidget {
  final String title;
  final List<SubjectCard> subjects;

  MyHomePage({super.key, required this.title})
    : subjects = [
        SubjectCard(
          title: 'Image Quiz Game',
          icon: Icons.image_search,
          color: const Color(0xFF58CC02), // Duolingo green
        ),
        SubjectCard(
          title: 'My World & Daily Life',
          icon: Icons.home_outlined,
          color: const Color(0xFF1CB0F6), // Duolingo blue
        ),
        SubjectCard(
          title: 'Home',
          icon: Icons.house,
          color: const Color(0xFFFF4B4B), // Duolingo red
        ),
        SubjectCard(
          title: 'School',
          icon: Icons.school,
          color: const Color(0xFFFFC800), // Duolingo yellow
        ),
        SubjectCard(
          title: 'Therapy',
          icon: Icons.healing,
          color: const Color(0xFF58CC02), // Duolingo green
        ),
        SubjectCard(
          title: 'Activities',
          icon: Icons.sports_basketball,
          color: const Color(0xFF1CB0F6), // Duolingo blue
        ),
        SubjectCard(
          title: 'Family & Friends',
          icon: Icons.people,
          color: const Color(0xFFFF4B4B), // Duolingo red
        ),
        SubjectCard(
          title: 'Toys & Games',
          icon: Icons.toys,
          color: const Color(0xFFFFC800), // Duolingo yellow
        ),
        SubjectCard(
          title: 'Food & Drink',
          icon: Icons.restaurant,
          color: const Color(0xFF58CC02), // Duolingo green
        ),
        SubjectCard(
          title: 'Places',
          icon: Icons.place,
          color: const Color(0xFF1CB0F6), // Duolingo blue
        ),
        SubjectCard(
          title: 'I Want / Needs',
          icon: Icons.favorite,
          color: const Color(0xFFFF4B4B), // Duolingo red
        ),
        SubjectCard(
          title: 'Actions / Verbs',
          icon: Icons.directions_run,
          color: const Color(0xFFFFC800), // Duolingo yellow
        ),
        SubjectCard(
          title: 'What Questions',
          icon: Icons.help_outline,
          color: const Color(0xFF58CC02), // Duolingo green
        ),
        SubjectCard(
          title: 'Where Questions',
          icon: Icons.map,
          color: const Color(0xFF1CB0F6), // Duolingo blue
        ),
        SubjectCard(
          title: 'Who Questions',
          icon: Icons.person_search,
          color: const Color(0xFFFF4B4B), // Duolingo red
        ),
        SubjectCard(
          title: 'When Questions',
          icon: Icons.access_time,
          color: const Color(0xFFFFC800), // Duolingo yellow
        ),
        SubjectCard(
          title: 'Why Questions',
          icon: Icons.psychology,
          color: const Color(0xFF58CC02), // Duolingo green
        ),
        SubjectCard(
          title: 'How Questions',
          icon: Icons.lightbulb_outline,
          color: const Color(0xFF1CB0F6), // Duolingo blue
        ),
        SubjectCard(
          title: 'Choice Questions',
          icon: Icons.rule,
          color: const Color(0xFFFF4B4B), // Duolingo red
        ),
        SubjectCard(
          title: 'Question Starters',
          icon: Icons.question_answer,
          color: const Color(0xFFFFC800), // Duolingo yellow
        ),
        SubjectCard(
          title: 'Yes or No quiz',
          icon: Icons.quiz,
          color: const Color(0xFF58CC02), // Duolingo green
        ),
        SubjectCard(
          title: 'Others',
          icon: Icons.more_horiz,
          color: const Color(0xFF1CB0F6), // Duolingo blue
        ),
      ];

  void _navigateToScreen(BuildContext context, String title, Color color) {
    if (title == 'Image Quiz Game') {
      Navigator.pushNamed(context, '/image-quiz');
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
        screen = WantsAndNeedsScreen(backgroundColor: color);
        break;

      case 'What Questions':
        screen = WhatQuestionsScreen(backgroundColor: color);
        break;
      case 'Where Questions':
        screen = WhereQuestionsScreen(backgroundColor: color);
        break;
      case 'Who Questions':
        screen = WhoQuestionsScreen(backgroundColor: color);
        break;
      case 'When Questions':
        screen = WhenQuestionsScreen(backgroundColor: color);
        break;
      case 'How Questions':
        screen = HowQuestionsScreen(backgroundColor: color);
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

    // Get current language and accent from SettingsScreen static (for demo)
    final language = SettingsScreenState.selectedLanguage;
    final accent = SettingsScreenState.selectedVoiceAccent;

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SettingsScreen()),
              );
            },
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 8.0,
            ),
            child: Row(
              children: [
                Chip(
                  label: Text('Language: $language'),
                  backgroundColor: Colors.blue.shade100,
                ),
                const SizedBox(width: 10),
                Chip(
                  label: Text('Voice Accent: $accent'),
                  backgroundColor: Colors.green.shade100,
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: subjects.length,
              itemBuilder: (context, index) {
                final subject = subjects[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: SizedBox(
                    height: 100,
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
                          child: Row(
                            children: [
                              const SizedBox(width: 20),
                              Container(
                                width: 60,
                                height: 60,
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  subject.icon,
                                  size: 32,
                                  color: subject.color,
                                ),
                              ),
                              const SizedBox(width: 20),
                              Expanded(
                                child: Text(
                                  subject.title,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const Icon(
                                Icons.chevron_right,
                                color: Colors.white,
                                size: 32,
                              ),
                              const SizedBox(width: 16),
                            ],
                          ),
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

  void dispose() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }
}
