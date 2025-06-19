import 'package:flutter/material.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

class VideoPlayerScreen extends StatefulWidget {
  final String videoUrl;
  final String title;
  final String? description;
  final String? teacherName;

  const VideoPlayerScreen({
    Key? key,
    required this.videoUrl,
    required this.title,
    this.description,
    this.teacherName,
  }) : super(key: key);

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  late YoutubePlayerController _controller;
  bool _isReady = false;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    final videoId = YoutubePlayerController.convertUrlToId(widget.videoUrl);
    if (videoId != null) {
      _controller = YoutubePlayerController.fromVideoId(
        videoId: videoId,
        autoPlay: true,
        params: const YoutubePlayerParams(
          mute: false,
          showControls: true,
          showFullscreenButton: true,
          enableCaption: true,
          captionLanguage: 'en',
        ),
      );

      // Add listener for player state changes
      _controller.listen((event) {
        if (event.playerState == PlayerState.playing && !_isReady) {
          setState(() {
            _isReady = true;
          });
        }
        if (event.error != null && !_hasError) {
          setState(() {
            _hasError = true;
          });
        }
      });
    } else {
      setState(() {
        _hasError = true;
      });
    }
  }

  @override
  void dispose() {
    _controller.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(aspectRatio: 16 / 9, child: _buildYoutubePlayer()),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_hasError)
                    const Center(
                      child: Text(
                        'Error loading video',
                        style: TextStyle(color: Colors.red),
                      ),
                    )
                  else if (!_isReady)
                    const Center(child: CircularProgressIndicator()),
                  const SizedBox(height: 16),
                  Text(
                    widget.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (widget.teacherName != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Teacher: ${widget.teacherName}',
                      style: const TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ],
                  if (widget.description != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      widget.description!,
                      style: const TextStyle(fontSize: 16),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildYoutubePlayer() {
    final videoId = YoutubePlayerController.convertUrlToId(widget.videoUrl);
    if (videoId == null) {
      return const Center(
        child: Text('Invalid YouTube URL', style: TextStyle(color: Colors.red)),
      );
    }

    return YoutubePlayer(controller: _controller, aspectRatio: 16 / 9);
  }
}
