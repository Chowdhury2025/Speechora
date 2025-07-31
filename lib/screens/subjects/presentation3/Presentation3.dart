import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../services/tts_service.dart';
import '../../../config/config.dart';

class QuizItem {
  final String subject;
  final String imageUrl;
  final String imageName;
  final String description;
  final String ageGroup;

  QuizItem({
    required this.subject,
    required this.imageUrl,
    required this.imageName,
    required this.description,
    required this.ageGroup,
  });

  factory QuizItem.fromJson(Map<String, dynamic> json) => QuizItem(
    subject: json['subject'],
    imageUrl: json['imageUrl'],
    imageName: json['imageName'],
    description: json['description'],
    ageGroup: json['ageGroup'],
  );
}

class Presentation3 extends StatefulWidget {
  const Presentation3({Key? key}) : super(key: key);

  @override
  _Presentation3State createState() => _Presentation3State();
}

class _Presentation3State extends State<Presentation3> {
  final TTSService _tts = TTSService();
  final List<QuizItem> _items = [];
  int _currentIndex = 0;
  QuizItem? _selected;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final response = await http.get(Uri.parse('${Config.apiUrl}/api/presentation3'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() => _items.addAll(data.map((e) => QuizItem.fromJson(e))));
      }
    } catch (e) {
      print('Error loading presentation items: $e');
    }
    // once loaded, ask first question
    WidgetsBinding.instance.addPostFrameCallback((_) => _askQuestion());
  }

  Future<void> _askQuestion() async {
    final a = _items[_currentIndex];
    final b = _items[(_currentIndex + 1) % _items.length];
    await _tts.speak("Do you want ${a.imageName} or ${b.imageName}?");
  }

  Future<void> _onSelect(QuizItem choice) async {
    if (_selected != null) return;
    setState(() => _selected = choice);
    await _tts.speak("I want ${choice.imageName}");
    // after a short delay, advance
    await Future.delayed(const Duration(seconds: 2));
    setState(() {
      _currentIndex = (_currentIndex + 2) % _items.length;
      _selected = null;
    });
    _askQuestion();
  }

  Widget _buildOptionCard(QuizItem item) {
    final isSelected = item == _selected;
    return GestureDetector(
      onTap: () => _onSelect(item),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: double.infinity,
        margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 24),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color:
              isSelected ? Colors.orangeAccent.withOpacity(0.7) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow:
              isSelected
                  ? [BoxShadow(color: Colors.black26, blurRadius: 8)]
                  : [BoxShadow(color: Colors.black12, blurRadius: 4)],
        ),
        child: Column(
          children: [
            Image.network(item.imageUrl, height: 120),
            const SizedBox(height: 12),
            Text(
              item.imageName,
              style: TextStyle(
                fontSize: 22,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: Colors.teal[800],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_items.length < 2) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final first = _items[_currentIndex];
    final second = _items[(_currentIndex + 1) % _items.length];

    return Scaffold(
      backgroundColor: const Color(0xFFE0F7FA),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 40),
            // Question text
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                "Do you want juice or water?", // you can dynamically swap "juice" & "water" wording here if you like
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal,
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Two option cards
            _buildOptionCard(first),
            _buildOptionCard(second),
            const Spacer(),
            // Bottom sentence
            if (_selected != null)
              Container(
                width: double.infinity,
                color: Colors.yellow[200],
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: Text(
                    "I want ${_selected!.imageName}",
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
