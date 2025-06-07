import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class DailyRoutineScreen extends StatelessWidget {
  DailyRoutineScreen({Key? key}) : super(key: key);

  final List<Map<String, String>> routineSteps = [
    {'title': 'Wake up', 'videoId': '1QJN1qQe1w8'},
    {'title': 'Make bed', 'videoId': '2Qe1w8J1QJN'},
    {'title': 'Stretch', 'videoId': '3QJN1qQe1w8'},
    {'title': 'Brush teeth', 'videoId': '4QJN1qQe1w8'},
    {'title': 'Use toilet', 'videoId': '5QJN1qQe1w8'},
    {'title': 'Wash hands', 'videoId': '6QJN1qQe1w8'},
    {'title': 'Take bath', 'videoId': '7QJN1qQe1w8'},
    {'title': 'Dry off', 'videoId': '8QJN1qQe1w8'},
    {'title': 'Get dressed', 'videoId': '9QJN1qQe1w8'},
    {'title': 'Comb hair', 'videoId': '10QJN1qQe1w8'},
    {'title': 'Eat breakfast', 'videoId': '11QJN1qQe1w8'},
    {'title': 'Take medicine', 'videoId': '12QJN1qQe1w8'},
    {'title': 'Pack bag', 'videoId': '13QJN1qQe1w8'},
    {'title': 'Wait for bus', 'videoId': '14QJN1qQe1w8'},
    {'title': 'Go to school', 'videoId': '15QJN1qQe1w8'},
    {'title': 'Come home', 'videoId': '16QJN1qQe1w8'},
    {'title': 'Take off shoes', 'videoId': '17QJN1qQe1w8'},
    {'title': 'Wash hands', 'videoId': '18QJN1qQe1w8'},
    {'title': 'Do homework', 'videoId': '19QJN1qQe1w8'},
    {'title': 'Watch TV', 'videoId': '20QJN1qQe1w8'},
    {'title': 'Eat dinner', 'videoId': '21QJN1qQe1w8'},
    {'title': 'Pajamas on', 'videoId': '22QJN1qQe1w8'},
    {'title': 'Brush teeth again', 'videoId': '23QJN1qQe1w8'},
    {'title': 'Story time', 'videoId': '24QJN1qQe1w8'},
    {'title': 'Say goodnight', 'videoId': '25QJN1qQe1w8'},
    {'title': 'Lights off', 'videoId': '26QJN1qQe1w8'},
    {'title': 'Sleep', 'videoId': '27QJN1qQe1w8'},
  ];

  void _showVideo(BuildContext context, String videoId, String title) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        contentPadding: EdgeInsets.zero,
        content: YoutubePlayer(
          controller: YoutubePlayerController(
            initialVideoId: videoId,
            flags: const YoutubePlayerFlags(
              autoPlay: true,
              mute: false,
            ),
          ),
          showVideoProgressIndicator: true,
        ),
        title: Text(title),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Daily Routine')),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 2.5,
        ),
        itemCount: routineSteps.length,
        itemBuilder: (context, index) {
          final step = routineSteps[index];
          return ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue.shade200,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            onPressed: () => _showVideo(context, step['videoId']!, step['title']!),
            child: Text(step['title']!),
          );
        },
      ),
    );
  }
}
