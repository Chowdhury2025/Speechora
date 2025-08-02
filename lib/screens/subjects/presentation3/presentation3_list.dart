import 'dart:convert';
import 'package:book8/constants/constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'Presentation3.dart';
import 'models/quiz_item.dart';

class Presentation3List extends StatefulWidget {
  final String subject;

  const Presentation3List({Key? key, required this.subject}) : super(key: key);

  @override
  _Presentation3ListState createState() => _Presentation3ListState();
}

class _Presentation3ListState extends State<Presentation3List> {
  final List<QuizItem> _items = [];
  bool _isLoading = true;
  String? _error;

  String _formatSubjectTitle(String subject) {
    return subject
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  Future<void> _loadItems() async {
    try {
      final response = await http.get(
        Uri.parse('${Constants.baseUrl}/presentation3'),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final allItems = data.map((e) => QuizItem.fromJson(e)).toList();
        
        // Filter items by subject
        final filteredItems = allItems.where((item) => 
          item.subject.toLowerCase() == widget.subject.toLowerCase()
        ).toList();
        
        setState(() {
          _items.addAll(filteredItems);
          _isLoading = false;
        });

        if (filteredItems.isEmpty) {
          setState(() {
            _error = 'No items found for ${widget.subject}';
            _isLoading = false;
          });
        }
      } else {
        setState(() {
          _error = 'Failed to load items (status ${response.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error loading items: $e';
        _isLoading = false;
      });
    }
  }

  void _navigateToPresentation(int index) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Presentation3(
          subject: widget.subject,
          initialIndex: index,
          items: _items,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Text(
            _error!,
            style: const TextStyle(color: Colors.red),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFE0F7FA),
      appBar: AppBar(
        title: Text(_formatSubjectTitle(widget.subject)),
        backgroundColor: Colors.teal,
        elevation: 0,
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.8,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: _items.length,
        itemBuilder: (context, index) {
          final item = _items[index];
          return Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: InkWell(
              onTap: () => _navigateToPresentation(index),
              borderRadius: BorderRadius.circular(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    flex: 3,
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(16),
                      ),
                      child: Image.network(
                        item.imageUrl,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.vertical(
                          bottom: Radius.circular(16),
                        ),
                      ),
                      child: Text(
                        item.imageName,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.teal,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
