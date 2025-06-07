import 'package:flutter/material.dart';
import '../services/video_service.dart';
import 'video_player_screen.dart';
import 'package:url_launcher/url_launcher.dart';

class VideoListScreen extends StatelessWidget {
  final String title;
  final List<Video> videos;
  final Color backgroundColor;

  const VideoListScreen({
    super.key,
    required this.title,
    required this.videos,
    required this.backgroundColor,
  });

  Future<void> _launchUrl(String url) async {
    final Uri uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: backgroundColor,
      ),
      body: ListView.builder(
        itemCount: videos.length,
        padding: const EdgeInsets.all(16),
        itemBuilder: (context, index) {
          final video = videos[index];
          return Card(
            elevation: 4,
            margin: const EdgeInsets.only(bottom: 16),
            child: ListTile(
              contentPadding: const EdgeInsets.all(16),
              leading: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: backgroundColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(
                  Icons.play_circle_outline,
                  color: backgroundColor,
                  size: 32,
                ),
              ),
              title: Text(
                video.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              subtitle: video.description != null
                  ? Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(video.description!),
                    )
                  : null,
              onTap: () => _launchUrl(video.linkyoutube_link),
            ),
          );
        },
      ),
    );
  }
}
