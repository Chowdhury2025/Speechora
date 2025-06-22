import 'package:book8/constants/constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:photo_view/photo_view.dart';

class FamilyAndFriendsScreen extends StatefulWidget {
  static const routeName = '/family-and-friends';
  final Color backgroundColor;

  const FamilyAndFriendsScreen({super.key, required this.backgroundColor});

  @override
  State<FamilyAndFriendsScreen> createState() => _FamilyAndFriendsScreenState();
}

class _FamilyAndFriendsScreenState extends State<FamilyAndFriendsScreen> {
  final FlutterTts flutterTts = FlutterTts();
  List<Map<String, dynamic>> images = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchImages();
    initTts();
  }

  Future<void> initTts() async {
    await flutterTts.setLanguage("en-US");
    await flutterTts.setSpeechRate(0.5);
    await flutterTts.setVolume(1.0);
    await flutterTts.setPitch(1.0);
  }

  Future<void> fetchImages() async {
    try {
      final response = await http.get(
        Uri.parse('${Constants.baseUrl}/images?category=family_friends'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (mounted) {
          setState(() {
            images = List<Map<String, dynamic>>.from(data);
            isLoading = false;
          });
        }
      } else {
        throw Exception('Failed to load images');
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

  Future<void> speakText(String text) async {
    await flutterTts.speak(text);
  }

  void _showFullScreenImage(BuildContext context, Map<String, dynamic> image) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder:
            (context) => FullScreenImageView(image: image, onSpeak: speakText),
      ),
    );
  }

  Future<void> _refreshImages() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    await fetchImages();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Family & Friends',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: widget.backgroundColor,
        elevation: 0,
      ),
      body: Container(
        color: widget.backgroundColor.withOpacity(0.1),
        child: RefreshIndicator(
          onRefresh: _refreshImages,
          child:
              isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : error != null
                  ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Error: $error'),
                        ElevatedButton(
                          onPressed: _refreshImages,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                  : images.isEmpty
                  ? const Center(child: Text('No images available'))
                  : GridView.builder(
                    padding: const EdgeInsets.all(8),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 1.0,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                        ),
                    itemCount: images.length,
                    itemBuilder: (context, index) {
                      final image = images[index];
                      return GestureDetector(
                        onTap: () => _showFullScreenImage(context, image),
                        child: Card(
                          elevation: 4,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: CachedNetworkImage(
                              imageUrl: image['url'],
                              fit: BoxFit.cover,
                              placeholder:
                                  (context, url) => const Center(
                                    child: CircularProgressIndicator(),
                                  ),
                              errorWidget:
                                  (context, url, error) =>
                                      const Icon(Icons.error),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    flutterTts.stop();
    super.dispose();
  }
}

class FullScreenImageView extends StatelessWidget {
  final Map<String, dynamic> image;
  final Function(String) onSpeak;

  const FullScreenImageView({
    super.key,
    required this.image,
    required this.onSpeak,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.volume_up),
            onPressed: () {
              final description =
                  image['description'] as String? ?? 'No description available';
              onSpeak(description);
            },
          ),
        ],
      ),
      body: PhotoView(
        imageProvider: NetworkImage(image['url']),
        minScale: PhotoViewComputedScale.contained,
        maxScale: PhotoViewComputedScale.covered * 2,
        backgroundDecoration: const BoxDecoration(color: Colors.black),
      ),
    );
  }
}
