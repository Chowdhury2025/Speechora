import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WhyQuestionsScreen extends StatelessWidget {
  static const routeName = '/why-questions';
  final Color backgroundColor;

  const WhyQuestionsScreen({super.key, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    final questionItems = [
      'Why do this?',
      'Why not?',
      'Why now?',
      'Why later?',
      'Why here?',
      'Why there?',
      'Why sad?',
      'Why happy?',
      'Why angry?',
      'Why tired?',
      'Why hungry?',
      'Why thirsty?',
      'Why sick?',
      'Why hurt?',
      'Why scared?',
      'Why excited?',
      'Why worried?',
      'Why confused?',
      'Why different?',
      'Why same?',
    ];

    return BaseSubjectScreen(
      title: 'Why Questions',
      backgroundColor: backgroundColor,
      category: 'sss',
      children:
          questionItems
              .map(
                (item) => SizedBox(
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
              )
              .toList(),
    );
  }
}
