import 'package:speachora/constants/constants.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:path_provider/path_provider.dart';
import 'package:video_player/video_player.dart';
import 'package:http/http.dart' as http;
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'dart:convert';

class Video {
  final int id;
  final String title;
  final String? video_url;
  final String? description;
  final String? name;
  final String thumbnailUrl;

  Video({
    required this.id,
    required this.title,
    this.video_url,
    this.description,
    this.name,
    String? thumbnailUrl,
  }) : thumbnailUrl = thumbnailUrl ?? '';

  factory Video.fromJson(Map<String, dynamic> json) {
    return Video(
      id: json['id'],
      title: json['title'],
      video_url: json['video_url'],
      description: json['description'],
      name: json['name'],
    );
  }
}

class VideoService {
  static const String baseUrl = Constants.baseUrl;

  static Future<List<Video>> getVideosByCategory(String category) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/videos/category'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'category': category}),
      );

      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data.map((json) => Video.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load videos');
      }
    } catch (e) {
      throw Exception('Error fetching videos: $e');
    }
  }
}

class Presentation6Screen extends StatefulWidget {
  const Presentation6Screen({Key? key}) : super(key: key);

  @override
  State<Presentation6Screen> createState() => _Presentation6ScreenState();
}

class _Presentation6ScreenState extends State<Presentation6Screen> {
  bool isLoading = false;
  String? error;
  List<Video> videos = [];
  final Map<String, VideoPlayerController> _controllers = {};

  @override
  void initState() {
    super.initState();
    _loadVideos();
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _loadVideos() async {
    if (mounted) {
      setState(() {
        isLoading = true;
        error = null;
      });
    }

    try {
      final response = await VideoService.getVideosByCategory('presentation6');
      if (mounted) {
        setState(() {
          videos = response;
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          error = e.toString();
          isLoading = false;
        });
      }
    }
  }

  Future<String> _downloadAndGetVideoPath(String url) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final videoHash = sha256.convert(utf8.encode(url)).toString();
      final localPath = '${directory.path}/videos/$videoHash.mp4';
      final videoFile = File(localPath);

      await Directory(videoFile.parent.path).create(recursive: true);

      if (await videoFile.exists() && await videoFile.length() > 0) {
        return localPath;
      }

      final downloadedFile = await DefaultCacheManager().getSingleFile(url);
      await downloadedFile.copy(localPath);
      return localPath;
    } catch (e) {
      throw Exception('Error downloading video: $e');
    }
  }

  void _playVideo(Video video) async {
    if (video.video_url?.isNotEmpty ?? false) {
      try {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Preparing video...')));

        String videoUrl = video.video_url!;
        if (!videoUrl.startsWith('https://') &&
            !videoUrl.startsWith('http://')) {
          videoUrl = 'https://$videoUrl';
        }

        final localPath = await _downloadAndGetVideoPath(videoUrl);

        if (!mounted) return;

        final controller = VideoPlayerController.file(File(localPath));
        await controller.initialize();
        controller.play();

        _controllers[localPath] = controller;

        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (context) =>
                    _VideoPlayerScreen(video: video, controller: controller),
          ),
        ).then((_) {
          controller.dispose();
          _controllers.remove(localPath);
        });
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('No video URL available')));
    }
  }

  Widget _buildVideoGrid(BuildContext context, List<Video> videos) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: videos.length,
      itemBuilder: (context, index) {
        final video = videos[index];
        return Card(
          clipBehavior: Clip.antiAlias,
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: InkWell(
            onTap: () => _playVideo(video),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  flex: 3,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.network(
                        video.thumbnailUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: Colors.grey[200],
                            child: const Icon(
                              Icons.broken_image,
                              size: 48,
                              color: Colors.grey,
                            ),
                          );
                        },
                      ),
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: Container(
                          color: Colors.black.withOpacity(0.5),
                          padding: const EdgeInsets.all(8),
                          child: const Icon(
                            Icons.play_circle_fill,
                            size: 48,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    video.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildErrorScreen(String error, VoidCallback onRetry) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
              const SizedBox(height: 16),
              Text(
                'Error: $error',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 24),
              // Fixed button to prevent overflow
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onRetry,
                  child: const Text('Retry'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (error != null) {
      return _buildErrorScreen(error!, _loadVideos);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Presentation 6'), centerTitle: true),
      body:
          videos.isEmpty
              ? const Center(
                child: Text(
                  'No videos available',
                  style: TextStyle(fontSize: 18),
                ),
              )
              : _buildVideoGrid(context, videos),
    );
  }
}

// Fixed _VideoPlayerScreen class to resolve overflow issues
class _VideoPlayerScreen extends StatefulWidget {
  final Video video;
  final VideoPlayerController controller;

  const _VideoPlayerScreen({required this.video, required this.controller});

  @override
  State<_VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<_VideoPlayerScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.video.title, overflow: TextOverflow.ellipsis),
      ),
      body: Column(
        children: [
          // Video player section - Fixed aspect ratio handling
          Container(
            width: double.infinity,
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.3,
            ),
            child:
                widget.controller.value.isInitialized
                    ? AspectRatio(
                      aspectRatio: widget.controller.value.aspectRatio,
                      child: VideoPlayer(widget.controller),
                    )
                    : Container(
                      color: Colors.black,
                      child: const Center(child: CircularProgressIndicator()),
                    ),
          ),

          // Video progress indicator
          VideoProgressIndicator(
            widget.controller,
            allowScrubbing: true,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          ),

          // Controls section - Fixed by constraining the container
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Center(
              child: IconButton(
                iconSize: 48,
                padding: const EdgeInsets.all(8),
                icon: Icon(
                  widget.controller.value.isPlaying
                      ? Icons.pause_circle_filled
                      : Icons.play_circle_filled,
                  color: Theme.of(context).primaryColor,
                ),
                onPressed: () {
                  setState(() {
                    widget.controller.value.isPlaying
                        ? widget.controller.pause()
                        : widget.controller.play();
                  });
                },
              ),
            ),
          ),

          // Video information section - Made flexible to prevent overflow
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Video title - Added flexible text handling
                  Text(
                    widget.video.title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.visible,
                    softWrap: true,
                  ),
                  const SizedBox(height: 12),

                  // Teacher information - Fixed with Flexible wrapper
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.person, color: Colors.grey),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Teacher: ${widget.video.name ?? "Unknown Teacher"}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 2,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Description section
                  if (widget.video.description?.isNotEmpty ?? false) ...[
                    const SizedBox(height: 16),
                    const Text(
                      'Description:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Text(
                        widget.video.description!,
                        style: const TextStyle(fontSize: 16, height: 1.5),
                        softWrap: true,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
