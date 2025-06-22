import 'package:flutter/material.dart';
import 'dart:math';
import 'settings_screen.dart';
import 'subjects/presentation1/daily_life_screen.dart';
import 'subjects/presentation1/home_screen.dart' as subject;
import 'subjects/presentation1/school_screen.dart';
import 'subjects/presentation1/therapy_screen.dart';
import 'subjects/presentation1/activities_screen.dart';
import 'subjects/presentation1/family_and_friends_screen.dart';
import 'subjects/presentation1/toys_and_games_screen.dart';
import 'subjects/presentation1/food_and_drink_screen.dart';
import 'subjects/presentation1/places_screen.dart';
import 'subjects/presentation2/wants_and_needs_screen.dart';
import 'subjects/actions_and_verbs_screen.dart';
import 'subjects/presentation2/what_questions_screen.dart';
import 'subjects/presentation2/where_questions_screen.dart';
import 'subjects/presentation2/who_questions_screen.dart';
import 'subjects/presentation2/when_questions_screen.dart';
import 'subjects/how_questions_screen.dart';
import 'subjects/choice_questions_screen.dart';
import 'subjects/question_starters_screen.dart';
import 'subjects/others_screen.dart';
import 'subjects/presentation4/trueorfalse.dart';

class SubjectCard {
  final String title;
  final IconData icon;
  final Color color;

  SubjectCard({required this.title, required this.icon, required this.color});
}

class MyHomePage extends StatelessWidget {
  MyHomePage({super.key, required this.title});

  final String title;

  final List<SubjectCard> subjects = [
    SubjectCard(
      title: 'Image Quiz Game',
      icon: Icons.image_search,
      color: Colors.orange.shade300,
    ),
    SubjectCard(
      title: 'My World & Daily Life',
      icon: Icons.home_outlined,
      color: Colors.blue.shade300,
    ),
    SubjectCard(title: 'Home', icon: Icons.house, color: Colors.green.shade300),
    SubjectCard(
      title: 'School',
      icon: Icons.school,
      color: Colors.purple.shade300,
    ),
    SubjectCard(
      title: 'Therapy',
      icon: Icons.healing,
      color: Colors.pink.shade300,
    ),
    SubjectCard(
      title: 'Activities',
      icon: Icons.sports_basketball,
      color: Colors.orange.shade300,
    ),
    SubjectCard(
      title: 'Family & Friends',
      icon: Icons.people,
      color: Colors.red.shade300,
    ),
    SubjectCard(
      title: 'Toys & Games',
      icon: Icons.toys,
      color: Colors.indigo.shade300,
    ),
    SubjectCard(
      title: 'Food & Drink',
      icon: Icons.restaurant,
      color: Colors.amber.shade300,
    ),
    SubjectCard(
      title: 'Places',
      icon: Icons.place,
      color: Colors.teal.shade300,
    ),
    SubjectCard(
      title: 'I Want / Needs',
      icon: Icons.favorite,
      color: Colors.deepPurple.shade300,
    ),
    SubjectCard(
      title: 'Actions / Verbs',
      icon: Icons.directions_run,
      color: Colors.lightBlue.shade300,
    ),
    SubjectCard(
      title: 'What Questions',
      icon: Icons.help_outline,
      color: Colors.brown.shade300,
    ),
    SubjectCard(
      title: 'Where Questions',
      icon: Icons.map,
      color: Colors.cyan.shade300,
    ),
    SubjectCard(
      title: 'Who Questions',
      icon: Icons.person_search,
      color: Colors.deepOrange.shade300,
    ),
    SubjectCard(
      title: 'When Questions',
      icon: Icons.access_time,
      color: Colors.lime.shade300,
    ),
    SubjectCard(
      title: 'Why Questions',
      icon: Icons.psychology,
      color: Colors.lightGreen.shade300,
    ),
    SubjectCard(
      title: 'How Questions',
      icon: Icons.lightbulb_outline,
      color: Colors.purple.shade300,
    ),
    SubjectCard(
      title: 'Choice Questions',
      icon: Icons.rule,
      color: Colors.pink.shade300,
    ),
    SubjectCard(
      title: 'Question Starters',
      icon: Icons.question_answer,
      color: Colors.blue.shade300,
    ),
    SubjectCard(
      title: 'True/False Quiz',
      icon: Icons.quiz,
      color: Colors.orange.shade400,
    ),
    SubjectCard(
      title: 'Others',
      icon: Icons.more_horiz,
      color: Colors.grey.shade400,
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
        screen = DailyLifeScreen(backgroundColor: color);
        break;
      case 'Home':
        screen = subject.HomeScreen(backgroundColor: color);
        break;
      case 'School':
        screen = SchoolScreen(backgroundColor: color);
        break;
      case 'Therapy':
        screen = TherapyScreen(backgroundColor: color);
        break;
      case 'Activities':
        screen = ActivitiesScreen(backgroundColor: color);
        break;
      case 'Family & Friends':
        screen = FamilyAndFriendsScreen(backgroundColor: color);
        break;
      case 'Toys & Games':
        screen = ToysAndGamesScreen(backgroundColor: color);
        break;
      case 'Food & Drink':
        screen = FoodAndDrinkScreen(backgroundColor: color);
        break;
      case 'Places':
        screen = PlacesScreen(backgroundColor: color);
        break;
      case 'I Want / Needs':
        screen = WantsAndNeedsScreen(backgroundColor: color);
        break;
      case 'Actions / Verbs':
        screen = ActionsAndVerbsScreen(backgroundColor: color);
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
      case 'Choice Questions':
        screen = ChoiceQuestionsScreen(backgroundColor: color);
        break;
      case 'Question Starters':
        screen = QuestionStartersScreen(backgroundColor: color);
        break;
      case 'True/False Quiz':
        screen = FruitQuizScreen();
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
      body: Container(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (var i = 0; i < subjects.length; i += 4)
                Padding(
                  padding: const EdgeInsets.only(right: 16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (var j = i; j < min(i + 4, subjects.length); j++)
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8.0),
                            child: SizedBox(
                              width: 280,
                              child: Card(
                                color: subjects[j].color,
                                child: InkWell(
                                  onTap:
                                      () => _navigateToScreen(
                                        context,
                                        subjects[j].title,
                                        subjects[j].color,
                                      ),
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Row(
                                      children: [
                                        Icon(
                                          subjects[j].icon,
                                          size: 32,
                                          color: Colors.white,
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: Text(
                                            subjects[j].title,
                                            style: const TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
