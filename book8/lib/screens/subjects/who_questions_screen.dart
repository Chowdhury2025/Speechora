import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WhoQuestionsScreen extends StatelessWidget {
  static const routeName = '/who-questions';
  final Color backgroundColor;

  const WhoQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final questionItems = [
      'Who is this?', 'Who are you?', 'Who am I?', 'Who is that?', 'Who is coming?',
      'Who is going?', 'Who helps you?', 'Who do you love?', 'Who is your friend?', 'Who is your teacher?',
      'Who is your doctor?', 'Who is your family?', 'Who plays with you?', 'Who reads to you?', 'Who takes care of you?',
      'Who lives here?', 'Who made this?', 'Who wants to play?', 'Who needs help?', 'Who is next?'
    ];

    return BaseSubjectScreen(
      title: 'Who Questions',
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
