import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class PlacesScreen extends StatelessWidget {
  static const routeName = '/places';
  final Color backgroundColor;

  const PlacesScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final placeItems = [
      'Home', 'School', 'Park', 'Playground', 'Library',
      'Restaurant', 'Store', 'Hospital', 'Doctor Office', 'Dentist',
      'Zoo', 'Museum', 'Beach', 'Pool', 'Movie Theater',
      'Mall', 'Grocery Store', 'Church', 'Gym', 'Community Center'
    ];

    return BaseSubjectScreen(
      title: 'Places',
      backgroundColor: backgroundColor,
      children: placeItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each place item
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
