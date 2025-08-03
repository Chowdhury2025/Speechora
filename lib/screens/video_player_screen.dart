import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';
import 'package:chewie/chewie.dart';

class VideoPlayerScreen extends StatefulWidget {
  final String? youtubeUrl;
  final String? r2VideoUrl;
  final String title;
  final String? description;
  final String? teacherName;

  const VideoPlayerScreen({
    Key? key,
    this.youtubeUrl,
    this.r2VideoUrl,
    required this.title,
    this.description,
    this.teacherName,
  }) : super(key: key);

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  YoutubePlayerController? _youtubeController;
  VideoPlayerController? _r2Controller;
  ChewieController? _chewieController;
  bool _isReady = false;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    if (widget.youtubeUrl != null) {
      final videoId = YoutubePlayerController.convertUrlToId(
        widget.youtubeUrl!,
      );
      if (videoId != null) {
        _youtubeController = YoutubePlayerController.fromVideoId(
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
        _youtubeController!.listen((event) {
          if (event.playerState == PlayerState.playing && !_isReady) {
            setState(() {
              _isReady = true;
            });
          }
          if (event.error is String) {
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
    } else if (widget.r2VideoUrl != null) {
      _initializeR2Player();
    }
  }

  Future<void> _initializeR2Player() async {
    try {
      _r2Controller = VideoPlayerController.network(widget.r2VideoUrl!);
      await _r2Controller!.initialize();

      _chewieController = ChewieController(
        videoPlayerController: _r2Controller!,
        aspectRatio: 16 / 9,
        autoPlay: true,
        looping: false,
        showControls: true,
        allowFullScreen: true,
        allowMuting: true,
        errorBuilder: (context, errorMessage) {
          return Center(
            child: Text(
              errorMessage,
              style: const TextStyle(color: Colors.red),
            ),
          );
        },
      );

      setState(() {
        _isReady = true;
      });
    } catch (e) {
      print('R2 player initialization error: $e');
      setState(() {
        _hasError = true;
      });
    }
  }

  @override
  void dispose() {
    _youtubeController?.close();
    _r2Controller?.dispose();
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
            AspectRatio(
              aspectRatio: 16 / 9,
              child:
                  widget.r2VideoUrl != null
                      ? _buildR2Player()
                      : _buildYoutubePlayer(),
            ),
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
    if (_youtubeController == null) {
      return const Center(
        child: Text('Invalid YouTube URL', style: TextStyle(color: Colors.red)),
      );
    }
    return YoutubePlayerScaffold(
      controller: _youtubeController!,
      aspectRatio: 16 / 9,
      builder: (context, player) {
        return player;
      },
    );
  }

  Widget _buildR2Player() {
    if (_r2Controller == null || !_r2Controller!.value.isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_hasError) {
      return const Center(
        child: Text(
          'Error loading R2 video',
          style: TextStyle(color: Colors.red),
        ),
      );
    }
    if (_chewieController != null) {
      return Chewie(controller: _chewieController!);
    }
    return const Center(child: CircularProgressIndicator());
  }
}
