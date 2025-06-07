import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WhatQuestionsScreen extends StatelessWidget {
  static const routeName = '/what-questions';
  final Color backgroundColor;

  const WhatQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final questionItems = [
      'What is this?', 'What color?', 'What size?', 'What shape?', 'What time?',
      'What do you want?', 'What do you need?', 'What happened?', 'What next?', 'What for?',
      'What to do?', 'What to eat?', 'What to drink?', 'What to wear?', 'What to play?',
      'What to read?', 'What to write?', 'What to draw?', 'What to make?', 'What to say?'
    ];

    return BaseSubjectScreen(
      title: 'What Questions',
      backgroundColor: backgroundColor,
      children: questionItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each question item
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.play_circle_outline,
                    size: 50,
                    color: backgroundColor,
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      item,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ).toList(),
    );
  }
}
