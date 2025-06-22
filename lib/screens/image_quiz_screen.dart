import 'dart:math';
import 'package:flutter/material.dart';
import '../services/tts_service.dart';

class ImageQuizScreen extends StatefulWidget {
  const ImageQuizScreen({Key? key}) : super(key: key);

  @override
  State<ImageQuizScreen> createState() => _ImageQuizScreenState();
}

class _ImageQuizScreenState extends State<ImageQuizScreen> {
  final TTSService _ttsService = TTSService();
  final Random random = Random();
  final List<String> images = [
    'areoplane.jpg',
    'butterfly.jpg',
    'cat.jpg',
    'crockodile.webp',
    'elephant.jpg',
    'fish_photo.jpg',
    'parat bird.jpg',
    'scroll.jpg',
    'tortoise_photo.jpg',
    'tree.jpg',
    'zebra.jpg',
  ];

  List<String> displayedImages = [];
  String correctImage = '';
  bool showSuccess = false;
  bool showError = false;
  @override
  void initState() {
    super.initState();
    _setupNewRound();
  }

  void _setupNewRound() {
    // Shuffle all images and take first 6
    final shuffledImages = List<String>.from(images)..shuffle(random);
    displayedImages = shuffledImages.take(6).toList();
    // Pick one random image from the 6 as correct answer
    correctImage = displayedImages[random.nextInt(6)];
    // Speak the name of the correct image
    _speakWord();
  }

  Future<void> _speakWord() async {
    // Remove file extension and convert to proper speaking format
    String wordToSpeak = correctImage.split('.').first.replaceAll('_', ' ');
    await _ttsService.speak("Can you find the $wordToSpeak?");
  }

  void _handleImageTap(String selectedImage) {
    if (selectedImage == correctImage) {
      setState(() {
        showSuccess = true;
        showError = false;
      });
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            showSuccess = false;
            _setupNewRound();
          });
        }
      });
    } else {
      setState(() {
        showError = true;
        showSuccess = false;
      });
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            showError = false;
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find the Item!'),
        actions: [
          IconButton(icon: const Icon(Icons.volume_up), onPressed: _speakWord),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              const SizedBox(height: 20),
              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  padding: const EdgeInsets.all(16),
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  children:
                      displayedImages.map((image) {
                        return GestureDetector(
                          onTap: () => _handleImageTap(image),
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.asset(
                                'assets/items/$image',
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                ),
              ),
            ],
          ),
          if (showSuccess)
            Container(
              color: Colors.green.withOpacity(0.7),
              child: const Center(
                child: Icon(Icons.check_circle, color: Colors.white, size: 100),
              ),
            ),
          if (showError)
            Container(
              color: Colors.red.withOpacity(0.7),
              child: const Center(
                child: Icon(Icons.close, color: Colors.white, size: 100),
              ),
            ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _ttsService.stop();
    super.dispose();
  }
}
