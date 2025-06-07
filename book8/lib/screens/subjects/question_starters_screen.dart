import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class QuestionStartersScreen extends StatelessWidget {
  static const routeName = '/question-starters';
  final Color backgroundColor;

  const QuestionStartersScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final questionItems = [
      'Can I...?', 'May I...?', 'Will you...?', 'Do you...?', 'Are you...?',
      'Is it...?', 'Could you...?', 'Would you...?', 'Should I...?', 'Did you...?',
      'Have you...?', 'Does it...?', 'Was it...?', 'Were you...?', 'Am I...?',
      'Can we...?', 'Will they...?', 'Has anyone...?', 'Are we...?', 'Is there...?'
    ];

    return BaseSubjectScreen(
      title: 'Question Starters',
      backgroundColor: backgroundColor,
      children: questionItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each question starter item
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
