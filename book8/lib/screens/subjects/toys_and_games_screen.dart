import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class ToysAndGamesScreen extends StatelessWidget {
  static const routeName = '/toys-and-games';
  final Color backgroundColor;

  const ToysAndGamesScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final toysItems = [
      'Blocks', 'Dolls', 'Cars', 'Trucks', 'Puzzles',
      'Board Games', 'Card Games', 'Video Games', 'Ball', 'Action Figures',
      'Stuffed Animals', 'Art Supplies', 'Play-Doh', 'Building Sets', 'Books',
      'Musical Toys', 'Educational Toys', 'Outdoor Toys', 'Sports Equipment', 'iPad Games'
    ];

    return BaseSubjectScreen(
      title: 'Toys & Games',
      backgroundColor: backgroundColor,
      children: toysItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each toy/game item
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
