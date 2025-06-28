import 'package:flutter/material.dart';
import '../../../services/video_service.dart';
import 'base_subject_screen.dart';

class VideoCategoriesScreen extends StatefulWidget {
  final Color backgroundColor;
  const VideoCategoriesScreen({super.key, required this.backgroundColor});

  @override
  State<VideoCategoriesScreen> createState() => _VideoCategoriesScreenState();
}

class _VideoCategoriesScreenState extends State<VideoCategoriesScreen> {
  List<String> categories = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      final response = await VideoService.getAllCategories();
      setState(() {
        categories = response;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Video Categories'),
        backgroundColor: widget.backgroundColor,
      ),
      body:
          isLoading
              ? const Center(child: CircularProgressIndicator())
              : error != null
              ? Center(child: Text('Error: $error'))
              : ListView.builder(
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final category = categories[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    child: ListTile(
                      title: Text(category),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder:
                                (context) => BaseSubjectScreen(
                                  title: category,
                                  backgroundColor: widget.backgroundColor,
                                  category: category,
                                ),
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
    );
  }
}
