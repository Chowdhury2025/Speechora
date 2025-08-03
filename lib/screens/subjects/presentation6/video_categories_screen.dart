import 'package:book8/constants/constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:path_provider/path_provider.dart';
import 'package:crypto/crypto.dart';
import 'package:video_player/video_player.dart';
import 'presentation6_youtube_player.dart';
import 'presentation6_video_file_player.dart';

class VideoCategoriesScreen extends StatefulWidget {
  const VideoCategoriesScreen({super.key, required Color backgroundColor});

  @override
  State<VideoCategoriesScreen> createState() => _VideoCategoriesScreenState();
}

class _VideoCategoriesScreenState extends State<VideoCategoriesScreen> {
  List<VideoModel> videos = [];
  List<String> categories = [];
  String selectedCategory = '';
  bool isLoading = true;
  String? errorMessage;

  // Replace with your actual API URL
  static const String apiUrl = Constants.baseUrl;

  @override
  void initState() {
    super.initState();
    fetchVideos();
  }

  Future<void> fetchVideos() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      // First, fetch categories
      final categoriesResponse = await http.get(
        Uri.parse('$apiUrl/videos/categories'),
        headers: {'Content-Type': 'application/json'},
      );

      if (categoriesResponse.statusCode != 200) {
        throw Exception('Failed to load categories');
      }

      final List<dynamic> categoryData = json.decode(categoriesResponse.body);
      categories = categoryData.map((c) => c.toString()).toList();

      // Then fetch videos
      final response = await http.get(
        Uri.parse('$apiUrl/videos'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> videoData = json.decode(response.body);
        List<VideoModel> processedVideos = [];

        for (var videoJson in videoData) {
          var video = VideoModel.fromJson(videoJson);
          processedVideos.add(video);
        }

        setState(() {
          videos = processedVideos;
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load videos');
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to fetch videos: $e';
        isLoading = false;
      });
    }
  }

  Future<void> fetchVideosByCategory(String category) async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      if (category.isEmpty) {
        await fetchVideos();
        return;
      }

      final response = await http.post(
        Uri.parse('$apiUrl/videos/category'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'category': category}),
      );

      if (response.statusCode == 200) {
        final List<dynamic> videoData = json.decode(response.body);
        List<VideoModel> processedVideos = [];

        for (var videoJson in videoData) {
          var video = VideoModel.fromJson(videoJson);
          processedVideos.add(video);
        }

        setState(() {
          videos = processedVideos;
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load videos for category');
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to fetch videos: $e';
        isLoading = false;
      });
    }
  }

  List<VideoModel> get filteredVideos => videos;

  Future<void> deleteVideo(String videoId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Delete Video'),
            content: const Text('Are you sure you want to delete this video?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                style: TextButton.styleFrom(foregroundColor: Colors.red),
                child: const Text('Delete'),
              ),
            ],
          ),
    );

    if (confirmed == true) {
      try {
        final response = await http.delete(
          Uri.parse('$apiUrl/api/videos/$videoId'),
          headers: {'Content-Type': 'application/json'},
        );

        if (response.statusCode == 200) {
          setState(() {
            videos.removeWhere((video) => video.id == videoId);
          });
        } else {
          throw Exception('Failed to delete video');
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to delete video: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> playVideo(VideoModel video) async {
    try {
      if (video.youtubeLink.isNotEmpty) {
        // Play YouTube video in-app
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (context) => Presentation6YouTubePlayer(
                  youtubeUrl: video.youtubeLink,
                  title: video.title,
                  description: video.description,
                  teacherName: video.name,
                ),
          ),
        );
      } else if (video.videoUrl.isNotEmpty) {
        // Prepare local video path
        final directory = await getApplicationDocumentsDirectory();
        final videoHash =
            sha256.convert(utf8.encode(video.videoUrl)).toString();
        final localPath = '${directory.path}/videos/$videoHash.mp4';

        // Navigate to video player (it will handle download if needed)
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder:
                  (context) => Presentation6VideoFilePlayer(
                    videoFilePath: localPath,
                    title: video.title,
                    description: video.description,
                    teacherName: video.name,
                    videoUrl:
                        video.videoUrl, // Pass the original URL for downloading
                  ),
            ),
          );
        }
      } else {
        throw Exception('No valid video URL found');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error playing video: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String getYoutubeThumbnail(String youtubeUrl) {
    if (youtubeUrl.isEmpty) {
      return 'https://via.placeholder.com/150?text=No+Thumbnail';
    }

    final regExp = RegExp(
      r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
    );
    final match = regExp.firstMatch(youtubeUrl);
    if (match != null) {
      final videoId = match.group(1);
      // Try maxresdefault first, hqdefault will be used as fallback in CachedNetworkImage
      return 'https://img.youtube.com/vi/$videoId/maxresdefault.jpg';
    }
    return 'https://via.placeholder.com/150?text=No+Thumbnail';
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (errorMessage != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
              const SizedBox(height: 16),
              Text(
                errorMessage!,
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: fetchVideos,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Educational Videos'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            onPressed: () {
              // Navigate to upload screen
              Navigator.pushNamed(context, '/videos-upload');
            },
            icon: const Icon(Icons.add),
            tooltip: 'Upload Video',
          ),
        ],
      ),
      body: Column(
        children: [
          // Category Filter
          Container(
            padding: const EdgeInsets.all(16),
            child: DropdownButtonFormField<String>(
              value: selectedCategory.isEmpty ? null : selectedCategory,
              decoration: const InputDecoration(
                labelText: 'Filter by Category',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
              ),
              items: [
                const DropdownMenuItem<String>(
                  value: '',
                  child: Text('All Categories'),
                ),
                ...categories.map(
                  (category) => DropdownMenuItem<String>(
                    value: category,
                    child: Text(category),
                  ),
                ),
              ],
              onChanged: (value) {
                setState(() {
                  selectedCategory = value ?? '';
                });
                fetchVideosByCategory(selectedCategory);
              },
            ),
          ),

          // Video Grid
          Expanded(
            child:
                filteredVideos.isEmpty
                    ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.video_library_outlined,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            selectedCategory.isEmpty
                                ? 'No videos available'
                                : 'No videos found in this category',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    )
                    : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 16,
                            childAspectRatio: 0.75,
                          ),
                      itemCount: filteredVideos.length,
                      itemBuilder: (context, index) {
                        final video = filteredVideos[index];
                        return VideoCard(
                          video: video,
                          onPlay: () => playVideo(video),
                          onDelete: () => deleteVideo(video.id),
                          getThumbnail: getYoutubeThumbnail,
                        );
                      },
                    ),
          ),
        ],
      ),
    );
  }
}

class VideoCard extends StatelessWidget {
  final VideoModel video;
  final VoidCallback onPlay;
  final VoidCallback onDelete;
  final String Function(String) getThumbnail;

  const VideoCard({
    super.key,
    required this.video,
    required this.onPlay,
    required this.onDelete,
    required this.getThumbnail,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onPlay,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              flex: 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(16),
                    ),
                    child: CachedNetworkImage(
                      imageUrl: getThumbnail(video.youtubeLink),
                      fit: BoxFit.cover,
                      placeholder:
                          (context, url) => Container(
                            color: Colors.grey[200],
                            child: const Center(
                              child: CircularProgressIndicator(),
                            ),
                          ),
                      errorWidget: (context, url, error) {
                        // If maxresdefault fails, try hqdefault
                        if (url.contains('maxresdefault')) {
                          final regExp = RegExp(
                            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
                          );
                          final match = regExp.firstMatch(video.youtubeLink);
                          if (match != null) {
                            final videoId = match.group(1);
                            return CachedNetworkImage(
                              imageUrl:
                                  'https://img.youtube.com/vi/$videoId/hqdefault.jpg',
                              fit: BoxFit.cover,
                              placeholder:
                                  (context, url) => Container(
                                    color: Colors.grey[200],
                                    child: const Center(
                                      child: CircularProgressIndicator(),
                                    ),
                                  ),
                              errorWidget:
                                  (context, url, error) => Container(
                                    color: Colors.grey[200],
                                    child: const Center(
                                      child: Icon(
                                        Icons.broken_image,
                                        size: 48,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ),
                            );
                          }
                        }
                        return Container(
                          color: Colors.grey[200],
                          child: const Center(
                            child: Icon(
                              Icons.broken_image,
                              size: 48,
                              color: Colors.grey,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  Align(
                    alignment: Alignment.center,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.5),
                        shape: BoxShape.circle,
                      ),
                      child: const Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Icon(
                          Icons.play_arrow,
                          size: 48,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    video.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'By: ${video.name}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class VideoModel {
  final String id;
  final String title;
  final String name;
  final String category;
  final String ageGroup;
  final String description;
  final String videoUrl;
  final String youtubeLink;

  VideoModel({
    required this.id,
    required this.title,
    required this.name,
    required this.category,
    required this.ageGroup,
    required this.description,
    required this.videoUrl,
    required this.youtubeLink,
  });

  factory VideoModel.fromJson(Map<String, dynamic> json) {
    return VideoModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? '',
      ageGroup: json['ageGroup'] ?? '',
      description: json['description'] ?? '',
      videoUrl: json['video_url'] ?? '',
      youtubeLink: json['linkyoutube_link'] ?? '',
    );
  }
}

class VideoPlayerScreen extends StatefulWidget {
  final String videoUrl;

  const VideoPlayerScreen({super.key, required this.videoUrl});

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl));
    _controller.initialize().then((_) {
      setState(() {
        _isInitialized = true;
      });
      _controller.play();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Video Player'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      backgroundColor: Colors.black,
      body: Center(
        child:
            _isInitialized
                ? AspectRatio(
                  aspectRatio: _controller.value.aspectRatio,
                  child: VideoPlayer(_controller),
                )
                : const CircularProgressIndicator(),
      ),
      floatingActionButton:
          _isInitialized
              ? FloatingActionButton(
                onPressed: () {
                  setState(() {
                    _controller.value.isPlaying
                        ? _controller.pause()
                        : _controller.play();
                  });
                },
                child: Icon(
                  _controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
                ),
              )
              : null,
    );
  }
}
