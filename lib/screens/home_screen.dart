import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
      title: 'Yes or No quiz',
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
      case 'Yes or No quiz':
        screen = true_false_quiz();
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
    // Force portrait orientation
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

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
      body: LayoutBuilder(
        builder: (context, constraints) {
          // Fixed parameters for portrait layout
          final double screenWidth = constraints.maxWidth;
          final double screenHeight = constraints.maxHeight;
          final double padding = 16.0;
          final double spacing = 12.0;

          // Fixed 2x3 grid for portrait mode
          final int crossAxisCount = 2;
          final int mainAxisCount = 3;

          // Calculate available space
          final double availableWidth = screenWidth - (padding * 2);
          final double availableHeight =
              screenHeight -
              (padding * 2) -
              80; // Account for page indicator and swipe text
          final double totalHorizontalSpacing = spacing * (crossAxisCount - 1);
          final double totalVerticalSpacing = spacing * (mainAxisCount - 1);

          final double cardWidthByWidth =
              (availableWidth - totalHorizontalSpacing) / crossAxisCount;
          final double cardHeightByHeight =
              (availableHeight - totalVerticalSpacing) / mainAxisCount;

          // Use the smaller dimension to ensure squares fit properly
          final double cardSize = min(cardWidthByWidth, cardHeightByHeight);

          // Calculate cards per page
          final int cardsPerPage = crossAxisCount * mainAxisCount;

          // Split subjects into pages
          List<List<SubjectCard>> pages = [];
          for (int i = 0; i < subjects.length; i += cardsPerPage) {
            pages.add(
              subjects.sublist(i, min(i + cardsPerPage, subjects.length)),
            );
          }

          return PageView.builder(
            itemCount: pages.length,
            itemBuilder: (context, pageIndex) {
              return Container(
                padding: EdgeInsets.all(padding),
                child: Column(
                  children: [
                    // Page indicator
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        pages.length,
                        (index) => Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color:
                                index == pageIndex
                                    ? Theme.of(context).primaryColor
                                    : Colors.grey.shade300,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Grid of cards
                    Expanded(
                      child: Center(
                        child: GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: crossAxisCount,
                                childAspectRatio: 1.0, // Perfect squares
                                crossAxisSpacing: spacing,
                                mainAxisSpacing: spacing,
                              ),
                          itemCount: pages[pageIndex].length,
                          itemBuilder: (context, index) {
                            final subject = pages[pageIndex][index];
                            return Container(
                              width: cardSize,
                              height: cardSize,
                              child: Card(
                                elevation: 4,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                color: subject.color,
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(12),
                                  onTap:
                                      () => _navigateToScreen(
                                        context,
                                        subject.title,
                                        subject.color,
                                      ),
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          subject.icon,
                                          size:
                                              cardSize *
                                              0.25, // Responsive icon size
                                          color: Colors.white,
                                        ),
                                        const SizedBox(height: 8),
                                        Flexible(
                                          child: Text(
                                            subject.title,
                                            textAlign: TextAlign.center,
                                            style: TextStyle(
                                              fontSize:
                                                  cardSize *
                                                  0.08, // Responsive text size
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
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
                    ),
                    const SizedBox(height: 16),
                    // Swipe instruction
                    Text(
                      'Swipe left/right for more',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  void dispose() {
    // Reset orientation settings when widget is disposed
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }
}
