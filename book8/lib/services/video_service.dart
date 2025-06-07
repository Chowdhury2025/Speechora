import 'dart:convert';
import 'package:http/http.dart' as http;

class VideoService {  static final Map<String, List<Video>> _staticVideos = {
    'daily_life': [
      // Morning Routine videos
      Video(
        title: 'Wake Up! Daily Routines Song for Kids',
        linkyoutube_link: 'https://www.youtube.com/watch?v=eUXkj6j6Ezw',
        category: 'Morning Routine',
        description: 'Fun song to learn morning routines',
      ),
      Video(
        title: 'Morning Routine Song | Fun Kids English',
        linkyoutube_link: 'https://www.youtube.com/watch?v=b_8G7yFJS5g',
        category: 'Morning Routine',
        description: 'Learn English with morning routines',
      ),
      // Daily Routine videos
      Video(
        title: 'This Is The Way Song | Daily Routine Song',
        linkyoutube_link: 'https://www.youtube.com/watch?v=VnZlAOSEmYQ',
        category: 'Daily Routine',
        description: 'Fun way to learn daily activities',
      ),
      Video(
        title: "Daniel Tiger's Neighborhood - The Morning Routine",
        linkyoutube_link: 'https://youtube.com/watch?v=qCUNRhPBCYQ',
        category: 'Morning Routine',
        description: 'Learn morning routine with Daniel Tiger',
      ),
      // Bedtime Routine videos
      Video(
        title: 'Bedtime Routine for Babies | CoComelon',
        linkyoutube_link: 'https://www.youtube.com/watch?v=1DlOysdHP3c',
        category: 'Bedtime Routine',
        description: 'Bedtime routine songs for babies',
      ),
      Video(
        title: 'Bedtime Routine Songs | Super Simple Songs',
        linkyoutube_link: 'https://www.youtube.com/watch?v=ts-qvuqweEg',
        category: 'Bedtime Routine',
        description: 'Learn bedtime routines with fun songs',
      ),
      Video(
        title: "Daniel Tiger's Bedtime Routine",
        linkyoutube_link: 'https://youtube.com/watch?v=qCUNRhPBCYQ',
        category: 'Bedtime Routine',
        description: 'Learn bedtime routine with Daniel Tiger',
      ),
      Video(
        title: 'Moshi Bedtime Stories',
        linkyoutube_link: 'https://www.youtube.com/watch?v=80Cn59kzTI4',
        category: 'Bedtime Routine',
        description: 'Relaxing bedtime stories for kids',
      ),
    ],
  };

  static Future<List<Video>> getVideosByCategory(String category) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    return _staticVideos[category] ?? [];
  }
}

class Video {
  final String title;
  final String linkyoutube_link;
  final String? description;
  final String? category;
  final String? ageGroup;
  final String? name;

  Video({
    required this.title,
    required this.linkyoutube_link,
    this.description,
    this.category,
    this.ageGroup,
    this.name,
  });

  factory Video.fromJson(Map<String, dynamic> json) {
    return Video(
      title: json['title'] as String,
      linkyoutube_link: json['linkyoutube_link'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
      ageGroup: json['ageGroup'] as String?,
      name: json['name'] as String?,
    );
  }
}
