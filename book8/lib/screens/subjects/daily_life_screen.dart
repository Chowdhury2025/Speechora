import 'package:flutter/material.dart';
import 'base_subject_screen.dart';
import '../../services/video_service.dart';
import '../video_player_screen.dart';

class DailyLifeScreen extends StatelessWidget {
  static const routeName = '/daily-life';
  final Color backgroundColor;

  const DailyLifeScreen({
    super.key,
    required this.backgroundColor,
  });
  @override
  Widget build(BuildContext context) {
    final routineItems = {
      'Morning Routine': [
        'Wake up', 'Make bed', 'Stretch', 'Brush teeth', 'Use toilet',
        'Wash hands', 'Take bath', 'Dry off', 'Get dressed', 'Comb hair',
        'Eat breakfast', 'Take medicine', 'Pack bag'
      ],
      'Daily Routine': [
        'Wait for bus', 'Go to school', 'Come home', 'Take off shoes', 
        'Do homework', 'Watch TV', 'Eat dinner'
      ],
      'Bedtime Routine': [
        'Pajamas on', 'Story time', 'Say goodnight', 'Lights off', 'Sleep'
      ],
    };

    return BaseSubjectScreen(
      title: 'My World & Daily Life',
      backgroundColor: backgroundColor,
      children: routineItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(              onTap: () async {
                try {
                  final videos = await VideoService.getVideosByCategory('daily_life');
                  final categoryVideos = videos.where((v) => v.category == item).toList();
                  
                  if (categoryVideos.isNotEmpty) {
                    if (!context.mounted) return;
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => VideoListScreen(
                          title: item,
                          videos: categoryVideos,
                          backgroundColor: backgroundColor,
                        ),
                      ),
                    );
                  }
                } catch (e) {
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error loading videos: $e')),
                  );
                }
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
